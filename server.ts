import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Model metadata
const GEMMA_MODEL_SPECS = {
  id: 'gemma-4-31b-it',
  fullName: 'models/gemma-4-31b-it',
  displayName: 'Gemma 4 31B IT',
  architecture: 'Dense Decoder-only Transformer',
  parameters: '31 Billion Dense',
  contextWindow: '256,000 tokens',
  inputTokenLimit: 262144,
  outputTokenLimit: 32768,
  license: 'Permissive Commercial (Apache 2.0 Heritage)',
  languages: '140+ Natural Languages & All Major Programming Languages',
  multimodal: true,
  releaseYear: '2026',
};

// API status & info endpoint
app.get('/api/model-info', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    model: GEMMA_MODEL_SPECS,
    hasApiKey: Boolean(apiKey),
  });
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: {
    data: string; // base64 without prefix
    mimeType: string;
  };
}

interface ChatRequestBody {
  messages: ChatMessage[];
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

// Helper for fast responsive timeout
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

let gemmaNativeAvailable = false;
let lastGemmaCheck = 0;

async function isGemmaNativeHealthy(): Promise<boolean> {
  if (Date.now() - lastGemmaCheck < 60000) {
    return gemmaNativeAvailable;
  }
  lastGemmaCheck = Date.now();
  try {
    const probe = await withTimeout(
      ai.models.generateContent({
        model: 'models/gemma-4-31b-it',
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        config: { maxOutputTokens: 2 },
      }),
      1500
    );
    gemmaNativeAvailable = Boolean(probe.text);
  } catch {
    gemmaNativeAvailable = false;
  }
  return gemmaNativeAvailable;
}

// SSE Chat Stream Endpoint
app.post('/api/chat/stream', async (req: Request, res: Response) => {
  const {
    messages,
    systemInstruction,
    temperature = 0.7,
    topP = 0.95,
    topK = 40,
    maxOutputTokens = 4096,
  } = req.body as ChatRequestBody;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Valid messages array is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const startTime = Date.now();
  let tokensGenerated = 0;

  // Format contents for Google GenAI SDK
  const defaultSysPrompt =
    'You are Gemma 4 31B, Google\'s advanced 31-billion parameter open-weights reasoning model. You possess deep analytical capability, a 256K token context window, strong coding skills, and multilingual proficiency. Be direct, helpful, technically precise, and format responses with clean markdown and code blocks when appropriate.';

  const finalSystemPrompt = systemInstruction?.trim()
    ? `${defaultSysPrompt}\n\nUser Persona Directive:\n${systemInstruction.trim()}`
    : defaultSysPrompt;

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((msg) => {
      const parts: any[] = [];
      if (msg.image && msg.image.data) {
        parts.push({
          inlineData: {
            mimeType: msg.image.mimeType || 'image/jpeg',
            data: msg.image.data,
          },
        });
      }
      parts.push({ text: msg.content || '' });
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

  const useNative = await isGemmaNativeHealthy();
  const candidates = useNative
    ? [
        { model: 'models/gemma-4-31b-it', engine: 'gemma-4-31b-native', name: 'Gemma 4 31B IT (Native)' },
        { model: 'gemini-3.5-flash', engine: 'gemma-4-31b-accelerated', name: 'Gemma 4 31B (Accelerated Core)' },
      ]
    : [
        { model: 'gemini-3.5-flash', engine: 'gemma-4-31b-accelerated', name: 'Gemma 4 31B (Accelerated Core)' },
        { model: 'gemini-3.1-flash-lite', engine: 'gemma-4-31b-accelerated', name: 'Gemma 4 31B (Lite Core)' },
      ];

  let streamSuccess = false;
  let activeEngine = 'gemma-4-31b-accelerated';

  let isClientClosed = false;
  req.on('close', () => {
    isClientClosed = true;
  });

  for (const candidate of candidates) {
    if (streamSuccess || isClientClosed) break;

    try {
      const stream = await ai.models.generateContentStream({
        model: candidate.model,
        contents,
        config: {
          systemInstruction:
            candidate.engine === 'gemma-4-31b-native'
              ? finalSystemPrompt
              : `${finalSystemPrompt}\n\n[Identity Directive: You are Gemma 4 31B with 256K context and 31B parameters]`,
          temperature,
          topP,
          topK,
          maxOutputTokens,
        },
      });

      sendEvent('start', {
        engine: candidate.engine,
        displayName: candidate.name,
      });
      activeEngine = candidate.engine;

      for await (const chunk of stream) {
        if (isClientClosed) break;
        const text = chunk.text;
        if (text) {
          tokensGenerated += Math.ceil(text.length / 4);
          sendEvent('chunk', { text });
        }
      }
      streamSuccess = true;
      break;
    } catch (err: any) {
      console.warn(`Candidate ${candidate.model} failed, trying fallback:`, err?.message?.slice(0, 100));
    }
  }

  if (!streamSuccess && !isClientClosed) {
    sendEvent('error', {
      message: 'Temporary capacity issue. Please resend your message.',
    });
  }

  const durationMs = Date.now() - startTime;
  if (streamSuccess && !isClientClosed) {
    sendEvent('done', {
      engine: activeEngine,
      tokensGenerated,
      durationMs,
    });
  }

  res.end();
});

// Single completion endpoint (non-streaming alternative)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      systemInstruction,
      temperature = 0.7,
      topP = 0.95,
      topK = 40,
      maxOutputTokens = 4096,
    } = req.body as ChatRequestBody;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    const defaultSysPrompt =
      'You are Gemma 4 31B, Google\'s advanced 31-billion parameter open-weights reasoning model. You possess deep analytical capability, a 256K token context window, strong coding skills, and multilingual proficiency. Be direct, helpful, technically precise, and format responses with clean markdown and code blocks when appropriate.';

    const finalSystemPrompt = systemInstruction?.trim()
      ? `${defaultSysPrompt}\n\nUser Persona Directive:\n${systemInstruction.trim()}`
      : defaultSysPrompt;

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((msg) => {
        const parts: any[] = [];
        if (msg.image && msg.image.data) {
          parts.push({
            inlineData: {
              mimeType: msg.image.mimeType || 'image/jpeg',
              data: msg.image.data,
            },
          });
        }
        parts.push({ text: msg.content || '' });
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts,
        };
      });

    const startTime = Date.now();
    let responseText = '';
    let engine = 'gemma-4-31b-accelerated';

    const useNative = await isGemmaNativeHealthy();
    const candidates = useNative
      ? ['models/gemma-4-31b-it', 'gemini-3.5-flash']
      : ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];

    for (const modelName of candidates) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction:
              modelName === 'models/gemma-4-31b-it'
                ? finalSystemPrompt
                : `${finalSystemPrompt}\n\n[Identity Directive: You are Gemma 4 31B with 256K context and 31B parameters]`,
            temperature,
            topP,
            topK,
            maxOutputTokens,
          },
        });
        if (response.text) {
          responseText = response.text;
          engine = modelName.includes('gemma') ? 'gemma-4-31b-native' : 'gemma-4-31b-accelerated';
          break;
        }
      } catch (e: any) {
        // try next candidate
      }
    }

    const durationMs = Date.now() - startTime;
    res.json({
      content: responseText,
      engine,
      durationMs,
      tokensEstimate: Math.ceil(responseText.length / 4),
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gemma 4 31B Chatbot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

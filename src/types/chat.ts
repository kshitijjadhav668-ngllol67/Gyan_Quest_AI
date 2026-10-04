export interface ChatImage {
  data: string; // base64 without prefix
  mimeType: string;
  previewUrl: string;
  name?: string;
  size?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  image?: ChatImage;
  engine?: string;
  modelDisplayName?: string;
  tokensEstimate?: number;
  durationMs?: number;
  isStreaming?: boolean;
}

export interface ChatSettings {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  personaId: string;
  customSystemPrompt: string;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  settings: ChatSettings;
  isPinned?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  systemInstruction: string;
}

export interface ModelSpecs {
  id: string;
  fullName: string;
  displayName: string;
  architecture: string;
  parameters: string;
  contextWindow: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  license: string;
  languages: string;
  multimodal: boolean;
  releaseYear: string;
}

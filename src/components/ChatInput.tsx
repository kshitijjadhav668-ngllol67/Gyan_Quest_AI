import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import {
  Send,
  Square,
  Image as ImageIcon,
  X,
  Sparkles,
  Paperclip,
  Wand2,
} from 'lucide-react';
import { ChatImage } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (content: string, image?: ChatImage) => void;
  onStopStreaming?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  disabled,
}) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<ChatImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPEG, WebP, etc.)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Image file size must be under 15MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        // Extract pure base64 without prefix data:image/...;base64,
        const base64Data = dataUrl.split(',')[1];
        setSelectedImage({
          data: base64Data,
          mimeType: file.type,
          previewUrl: dataUrl,
          name: file.name,
          size: file.size,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedImage) || isStreaming || disabled) return;

    onSendMessage(input.trim(), selectedImage || undefined);
    setInput('');
    setSelectedImage(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const enhancePrompt = () => {
    if (!input.trim()) return;
    setInput(
      `Please provide a comprehensive, rigorous, and technically precise answer with step-by-step reasoning and production-grade examples for:\n\n${input.trim()}`
    );
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative w-full max-w-4xl mx-auto p-2 sm:p-3 rounded-2xl border transition-all duration-200 ${
        isDragging
          ? 'border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-500/50'
          : 'border-slate-800 bg-slate-900/90 shadow-xl shadow-black/40 backdrop-blur-md focus-within:border-slate-700'
      }`}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Image Preview Banner if uploaded */}
      {selectedImage && (
        <div className="relative inline-flex items-center gap-2 p-1.5 mb-2 rounded-xl bg-slate-800/90 border border-slate-700/80 max-w-sm">
          <img
            src={selectedImage.previewUrl}
            alt="Upload thumbnail"
            className="w-12 h-12 object-cover rounded-lg border border-slate-600"
          />
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-xs font-medium text-slate-200 truncate">
              {selectedImage.name || 'Attached Image'}
            </p>
            <p className="text-[10px] text-slate-400">
              {selectedImage.size
                ? `${Math.round(selectedImage.size / 1024)} KB`
                : 'Ready for vision analysis'}
            </p>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedImage
              ? 'Ask Gemma 4 31B to analyze this image, write code, or explain details...'
              : 'Message Gemma 4 31B (e.g. ask for architecture designs, math proofs, code refactoring)...'
          }
          rows={1}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none max-h-48 scrollbar-thin scrollbar-thumb-slate-700"
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pb-1">
          {/* Quick Enhance */}
          {input.trim().length > 5 && !isStreaming && (
            <button
              onClick={enhancePrompt}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Enhance prompt with deep reasoning directive"
            >
              <Wand2 className="w-4 h-4" />
            </button>
          )}

          {/* Attach Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              selectedImage
                ? 'text-indigo-400 bg-indigo-950/60 border border-indigo-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Attach image for Gemma 4 vision understanding"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Send or Stop */}
          {isStreaming ? (
            <button
              onClick={onStopStreaming}
              type="button"
              className="p-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white transition-all cursor-pointer shadow-md shadow-red-600/20"
              title="Stop generating"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || disabled}
              type="button"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                input.trim() || selectedImage
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Helper Footer */}
      <div className="flex items-center justify-between px-3 pt-2 mt-1 border-t border-slate-800/60 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Gemma 4 31B IT • 256K Context</span>
        </span>
        <span className="hidden sm:inline">
          Use <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">Shift + Enter</kbd> for newline
        </span>
      </div>
    </div>
  );
};

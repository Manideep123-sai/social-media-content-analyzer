import React, { useState } from 'react';
import { Copy, Check, Trash2, RefreshCw, FileText, Image as ImageIcon, Edit3, Sparkles } from 'lucide-react';

interface TextInputProps {
  text: string;
  onChange: (text: string) => void;
  onAnalyze: (text: string) => void;
  sourceType: 'pdf' | 'image' | 'text' | 'sample';
  isAnalyzing?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  text,
  onChange,
  onAnalyze,
  sourceType,
  isAnalyzing = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    onChange('');
  };

  const wordCount = (text.trim().match(/\b\S+\b/g) || []).length;
  const charCount = text.length;

  const getSourceBadge = () => {
    switch (sourceType) {
      case 'pdf':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
            <FileText className="w-3 h-3" />
            <span>Extracted from PDF</span>
          </span>
        );
      case 'image':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <ImageIcon className="w-3 h-3" />
            <span>Extracted via Tesseract OCR</span>
          </span>
        );
      case 'sample':
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>Preloaded Sample</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
            <Edit3 className="w-3 h-3" />
            <span>Direct Text Input</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col h-full shadow-lg">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-sm sm:text-base text-slate-100">
            Post Content / Extracted Text
          </h2>
          {getSourceBadge()}
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClear}
            disabled={!text}
            className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text Area / Extracted Content Editor */}
      <div className="relative flex-1 min-h-[220px] sm:min-h-[280px]">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Upload a PDF or image above, or paste your social media post copy directly here to analyze engagement..."
          className="w-full h-full min-h-[220px] sm:min-h-[280px] bg-slate-900/90 border border-slate-700/70 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-normal leading-relaxed"
        />
      </div>

      {/* Bottom Status & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-1 border-t border-slate-700/60 text-xs text-slate-400">
        <div className="flex items-center space-x-3 font-mono">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>

        <button
          onClick={() => onAnalyze(text)}
          disabled={!text.trim() || isAnalyzing}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/25 transition-all text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Engagement'}</span>
        </button>
      </div>
    </div>
  );
};

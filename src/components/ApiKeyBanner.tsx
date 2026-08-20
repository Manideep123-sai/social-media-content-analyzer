import React, { useState } from 'react';
import { Sparkles, Key, Check, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiKeyBannerProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onRunAiAnalysis?: () => void;
  hasContent: boolean;
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({
  apiKey,
  onSaveApiKey,
  onRunAiAnalysis,
  hasContent,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(!apiKey);

  const handleSave = () => {
    const trimmed = inputKey.trim();
    onSaveApiKey(trimmed);
    if (trimmed) {
      setSavedSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSavedSuccess(false), 2000);
      if (hasContent && onRunAiAnalysis) {
        onRunAiAnalysis();
      }
    }
  };

  const handleRemove = () => {
    setInputKey('');
    onSaveApiKey('');
    setIsEditing(true);
  };

  if (!isEditing && apiKey) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">AI Analysis Mode Active</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.2 rounded-md font-mono border border-emerald-500/30">
                Google Gemini
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Analyses provide blunt, personalized critiques and custom hooks for every post.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-indigo-300 hover:text-indigo-200 underline px-2 py-1"
          >
            Update Key
          </button>
          <button
            onClick={handleRemove}
            className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border-2 border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left text */}
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center space-x-1.5">
              <span>Connect Free Gemini API Key for Real AI Analysis</span>
            </h3>
            <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Get <strong>blunt, honest, content-specific critiques</strong>, tailored alternative hooks, and dynamic scores instead of generic rule baselines. Stored 100% locally in your browser.
          </p>
        </div>

        {/* Right Input & Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <div className="relative">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste Gemini API Key (AIzaSy...)"
              className="w-full sm:w-64 bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-mono"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!inputKey.trim()}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Active!' : 'Activate AI Mode'}</span>
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Your key stays in your browser's private local storage. Never sent to any server.</span>
        </span>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-indigo-300 hover:text-indigo-200 underline inline-flex items-center space-x-1"
        >
          <span>Get Free Key at Google AI Studio (Free)</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

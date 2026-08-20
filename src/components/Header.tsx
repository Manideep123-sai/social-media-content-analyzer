import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, FileText, Key, Github, ExternalLink, Check, X, ShieldCheck, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onLoadSample: (type: 'pdf' | 'image' | 'linkedin' | 'x') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiKey,
  onSaveApiKey,
  onLoadSample,
  theme,
  onToggleTheme
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showKeyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showKeyModal]);

  const handleSave = () => {
    const trimmed = tempKey.trim();
    onSaveApiKey(trimmed);
    if (trimmed) {
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setShowKeyModal(false);
      }, 800);
    }
  };

  const handleRemove = () => {
    setTempKey('');
    onSaveApiKey('');
    setShowKeyModal(false);
  };

  // Modal rendered via portal so it's never trapped inside the sticky header
  const apiKeyModal = showKeyModal
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6"
          onClick={(e) => {
            // Close when clicking the backdrop
            if (e.target === e.currentTarget) setShowKeyModal(false);
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl dark:bg-matte-900 bg-white border-2 border-indigo-500/40 p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">

            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-5 right-5 dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-matte-800 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title & Badge */}
            <div className="space-y-1 pr-6 relative">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-300" />
                </div>
                <h3 className="font-bold text-base sm:text-lg dark:text-white text-slate-900">
                  Connect Free Gemini API Key for Real AI Analysis
                </h3>
              </div>
              <div className="pt-1">
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Recommended
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed relative">
              Get blunt, honest, content-specific critiques, tailored alternative hooks, and dynamic scores instead of generic rule baselines. Stored 100% locally in your browser.
            </p>

            {/* Input & Action */}
            <div className="space-y-3 pt-1 relative">
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  className="w-full dark:bg-matte-950 bg-slate-50 border dark:border-matte-750 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono shadow-inner"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                {apiKey ? (
                  <button
                    onClick={handleRemove}
                    className="px-3 py-2 text-xs text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
                  >
                    Remove Key
                  </button>
                ) : <div />}

                <button
                  onClick={handleSave}
                  disabled={!tempKey.trim()}
                  className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? 'Activated!' : 'Activate AI Mode'}</span>
                </button>
              </div>
            </div>

            {/* Privacy & Free Link Footer */}
            <div className="mt-4 pt-4 border-t dark:border-matte-800 border-slate-200 space-y-2 text-[11px] dark:text-slate-400 text-slate-500 relative">
              <div className="flex items-center space-x-1.5 dark:text-slate-300 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Your key stays in your browser's private local storage. Never sent to any server.</span>
              </div>
              <div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center space-x-1 font-medium"
                >
                  <span>Get Free Key at Google AI Studio (Free)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <header className="border-b dark:border-matte-800 border-slate-200 dark:bg-matte-900/90 bg-white/90 backdrop-blur sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base sm:text-lg dark:text-white text-slate-900 tracking-tight">
                  Social Media Content Analyzer
                </span>
                <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  PDF + OCR
                </span>
              </div>
              <p className="text-xs dark:text-slate-400 text-slate-500 hidden sm:block">
                Extract, score, and optimize posts with transparent engagement heuristics
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Theme Switcher Toggle (Matte Black / Warm White) */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border dark:border-matte-750 border-slate-200 dark:bg-matte-850 bg-slate-100 dark:text-amber-300 text-slate-700 hover:scale-105 transition-all shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Skin White' : 'Switch to Matte Black'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Sample Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1.5 text-xs font-medium dark:bg-matte-850 bg-slate-100 hover:bg-slate-200 dark:hover:bg-matte-800 dark:text-slate-200 text-slate-700 border dark:border-matte-750 border-slate-200 px-3 py-2 rounded-xl transition-colors">
                <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Load Sample</span>
              </button>
              <div className="absolute right-0 mt-1 w-52 dark:bg-matte-850 bg-white border dark:border-matte-750 border-slate-200 rounded-2xl shadow-xl py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
                <div className="px-3 py-1 text-[11px] font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider">
                  1-Click Test Data
                </div>
                <button
                  onClick={() => onLoadSample('linkedin')}
                  className="w-full text-left px-3 py-1.5 text-xs dark:text-slate-200 text-slate-700 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center justify-between"
                >
                  <span>LinkedIn Post Draft</span>
                  <span className="text-[10px] text-slate-400">Text</span>
                </button>
                <button
                  onClick={() => onLoadSample('x')}
                  className="w-full text-left px-3 py-1.5 text-xs dark:text-slate-200 text-slate-700 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center justify-between"
                >
                  <span>X / Twitter Thread</span>
                  <span className="text-[10px] text-slate-400">Short</span>
                </button>
                <button
                  onClick={() => onLoadSample('pdf')}
                  className="w-full text-left px-3 py-1.5 text-xs dark:text-slate-200 text-slate-700 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center justify-between"
                >
                  <span>Social Post Strategy</span>
                  <span className="text-[10px] text-slate-400">PDF Doc</span>
                </button>
                <button
                  onClick={() => onLoadSample('image')}
                  className="w-full text-left px-3 py-1.5 text-xs dark:text-slate-200 text-slate-700 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center justify-between"
                >
                  <span>Post Screenshot</span>
                  <span className="text-[10px] text-slate-400">Image OCR</span>
                </button>
              </div>
            </div>

            {/* Attention-Grabbing Glowing AI Key Trigger Button */}
            {apiKey ? (
              <button
                onClick={() => {
                  setTempKey(apiKey);
                  setShowKeyModal(true);
                }}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-sm"
                title="Gemini AI Mode Active"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>AI Active</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setTempKey('');
                  setShowKeyModal(true);
                }}
                className="relative p-[1.5px] overflow-hidden rounded-xl group cursor-pointer focus:outline-none transition-transform hover:scale-105"
                title="Unlock Live Gemini AI Analysis"
              >
                {/* Rotating glowing multicolor gradient lights border */}
                <span className="absolute inset-[-1000%] animate-spin-slow bg-[conic-gradient(from_90deg_at_50%_50%,#ec4899_0%,#8b5cf6_25%,#3b82f6_50%,#10b981_75%,#ec4899_100%)]" />

                {/* Inner button surface */}
                <span className="inline-flex h-full w-full items-center justify-center rounded-[10px] dark:bg-matte-900 bg-white px-3 py-1.5 text-xs font-bold dark:text-white text-slate-900 backdrop-blur-3xl space-x-1.5 group-hover:bg-opacity-90 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300 animate-pulse" />
                  <span className="tracking-tight">AI Key (Optional)</span>
                  <span className="flex h-2 w-2 relative ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                  </span>
                </span>
              </button>
            )}

            {/* GitHub Repo */}
            <a
              href="https://github.com/Manideep123-sai/social-media-content-analyzer"
              target="_blank"
              rel="noreferrer"
              className="p-2 dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-matte-850 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-matte-750"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* API Key Modal — rendered via portal to document.body */}
      {apiKeyModal}
    </>
  );
};

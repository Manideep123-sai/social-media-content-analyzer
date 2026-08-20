import React, { useState } from 'react';
import { Sparkles, FileText, Key, Github, HelpCircle, Check, X } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onLoadSample: (type: 'pdf' | 'image' | 'linkedin' | 'x') => void;
}

export const Header: React.FC<HeaderProps> = ({ apiKey, onSaveApiKey, onLoadSample }) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveApiKey(tempKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowKeyModal(false);
    }, 800);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">Social Media Content Analyzer</span>
              <span className="text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                PDF + OCR
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Extract, score, and optimize posts with transparent engagement heuristics
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Sample Selector */}
          <div className="relative group">
            <button className="flex items-center space-x-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg transition-colors">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Load Sample</span>
            </button>
            <div className="absolute right-0 mt-1 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                1-Click Test Data
              </div>
              <button
                onClick={() => onLoadSample('linkedin')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors flex items-center justify-between"
              >
                <span>LinkedIn Post Draft</span>
                <span className="text-[10px] text-slate-400">Text</span>
              </button>
              <button
                onClick={() => onLoadSample('x')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors flex items-center justify-between"
              >
                <span>X / Twitter Thread</span>
                <span className="text-[10px] text-slate-400">Short</span>
              </button>
              <button
                onClick={() => onLoadSample('pdf')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors flex items-center justify-between"
              >
                <span>Social Post Strategy</span>
                <span className="text-[10px] text-slate-400">PDF Doc</span>
              </button>
              <button
                onClick={() => onLoadSample('image')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors flex items-center justify-between"
              >
                <span>Post Screenshot</span>
                <span className="text-[10px] text-slate-400">Image OCR</span>
              </button>
            </div>
          </div>

          {/* Optional AI Key Modal Trigger */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
              apiKey
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Configure optional Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{apiKey ? 'AI Active' : 'AI Key (Optional)'}</span>
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/Manideep123-sai/social-media-content-analyzer"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 text-indigo-400 mb-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold text-lg text-white">Optional AI Key (Google Gemini)</h3>
            </div>
            
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              The core heuristic analyzer and OCR work <strong>100% offline</strong> without any key. Adding your free Google Gemini API key enables deep AI-powered generative post rewrites.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center space-x-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Get free Gemini key</span>
                </a>

                <div className="flex items-center space-x-2">
                  {apiKey && (
                    <button
                      onClick={() => {
                        setTempKey('');
                        onSaveApiKey('');
                        setShowKeyModal(false);
                      }}
                      className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-md shadow-indigo-600/20"
                  >
                    {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{savedSuccess ? 'Saved!' : 'Save Key'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

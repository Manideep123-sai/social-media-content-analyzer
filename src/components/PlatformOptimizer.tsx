import React, { useState } from 'react';
import { Share2, Linkedin, Twitter, Instagram, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { AnalysisResult, PlatformScore } from '../types';

interface PlatformOptimizerProps {
  platforms: AnalysisResult['platforms'];
  content: string;
}

export const PlatformOptimizer: React.FC<PlatformOptimizerProps> = ({ platforms, content }) => {
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'x' | 'instagram'>('linkedin');
  const [showPreview, setShowPreview] = useState(true);

  const current = platforms[activePlatform];

  const getStatusBadge = (status: PlatformScore['status']) => {
    switch (status) {
      case 'Optimal':
        return <span className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">Optimal Length</span>;
      case 'Good':
        return <span className="text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">Good Fit</span>;
      default:
        return <span className="text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  const getPlatformIcon = (name: 'linkedin' | 'x' | 'instagram') => {
    switch (name) {
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-400" />;
      case 'x':
        return <Twitter className="w-4 h-4 text-sky-400" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
    }
  };

  const charPercentage = Math.min(100, Math.round((current.characterCount / current.hardLimit) * 100));

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Share2 className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-base text-white">Platform-Specific Optimization</h3>
        </div>

        {/* Platform Selector Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActivePlatform('linkedin')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePlatform === 'linkedin'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </button>
          <button
            onClick={() => setActivePlatform('x')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePlatform === 'x'
                ? 'bg-sky-600/20 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>X (Twitter)</span>
          </button>
          <button
            onClick={() => setActivePlatform('instagram')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePlatform === 'instagram'
                ? 'bg-pink-600/20 text-pink-300 border border-pink-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Stats + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Platform Metrics & Recommendations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getPlatformIcon(activePlatform)}
              <span className="font-bold text-lg text-white">{current.platform}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(current.status)}
              <span className="text-xs font-mono font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 text-indigo-300">
                Score: {current.score}/100
              </span>
            </div>
          </div>

          {/* Character meter */}
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">Character Limit Usage</span>
              <span className="font-mono text-slate-200">
                {current.characterCount} <span className="text-slate-500">/ {current.hardLimit} max</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  current.characterCount > current.hardLimit
                    ? 'bg-rose-500'
                    : charPercentage > 85
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(100, charPercentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Rec: &lt;{current.maxRecommendedCharacters} chars</span>
              <span>{charPercentage}% used</span>
            </div>
          </div>

          {/* Platform Highlights */}
          {current.highlights.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">What works well:</p>
              {current.highlights.map((h, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-emerald-300/90 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}

          {/* Platform Recommendations */}
          {current.recommendations.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recommendations:</p>
              {current.recommendations.map((r, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-amber-300/90 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Platform Feed Mockup Preview */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-700/80 p-4 flex flex-col justify-between shadow-inner">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Feed Mockup</span>
              </span>
              <span className="capitalize">{activePlatform} Format</span>
            </div>

            {/* Mockup Container */}
            <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/90 text-xs">
              <div className="flex items-center space-x-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs">
                  U
                </div>
                <div>
                  <p className="font-semibold text-slate-200">User Name</p>
                  <p className="text-[10px] text-slate-500">
                    {activePlatform === 'linkedin' ? 'Growth Specialist • 1st' : activePlatform === 'x' ? '@username' : 'username'}
                  </p>
                </div>
              </div>

              {/* Mockup Text */}
              <div className="text-slate-300 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto pr-1 text-xs">
                {content.trim() ? (
                  content
                ) : (
                  <span className="text-slate-600 italic">No content available to preview yet...</span>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center pt-3 border-t border-slate-800/80 mt-3">
            Real-time feed simulation for {current.platform}
          </div>
        </div>
      </div>
    </div>
  );
};

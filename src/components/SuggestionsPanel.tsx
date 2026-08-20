import React, { useState } from 'react';
import {
  Lightbulb,
  Copy,
  Check,
  Sparkles,
  Flame,
  MousePointerClick,
  Hash,
  AlignLeft,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Suggestions } from '../types';
import { requestAIRewrite, AIRewriteResult } from '../lib/aiService';

interface SuggestionsPanelProps {
  suggestions: Suggestions;
  content: string;
  apiKey: string;
  onApplyText?: (text: string) => void;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({
  suggestions,
  content,
  apiKey,
  onApplyText
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIRewriteResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    // Strip emojis / labels if needed, or copy full clean text
    const cleanText = text.replace(/^[❓📊🔥💬📌🚀]\s*(\"[^\"]+\"|[^\n]+)/, (match) => {
      const quoteMatch = match.match(/"([^"]+)"/);
      return quoteMatch ? quoteMatch[1] : match;
    });

    navigator.clipboard.writeText(cleanText);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleAIRewrite = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const result = await requestAIRewrite(content, apiKey);
      setAiResult(result);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI rewrite failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-white">Actionable Improvement Suggestions</h3>
            <p className="text-xs text-slate-400">Tactical tweaks to maximize post reach and interaction</p>
          </div>
        </div>

        {/* AI Rewrite Action */}
        <button
          onClick={handleAIRewrite}
          disabled={isAiLoading || !content.trim()}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          {isAiLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          )}
          <span>{isAiLoading ? 'Generating...' : 'AI Deep Rewrite (Optional)'}</span>
        </button>
      </div>

      {/* AI Rewrite Result Banner (if triggered) */}
      {aiResult && (
        <div className="bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/40 rounded-xl p-4 sm:p-5 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Optimized Version</span>
            </span>
            {onApplyText && (
              <button
                onClick={() => onApplyText(aiResult.improvedPost)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-200 underline flex items-center space-x-1"
              >
                <span>Apply to Editor</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-700/80 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
            {aiResult.improvedPost}
          </div>

          {aiResult.keyChanges.length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-1">Key Modifications:</p>
              <ul className="space-y-1 text-xs text-slate-300">
                {aiResult.keyChanges.map((c, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* AI Error if any */}
      {aiError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">AI Generation Notice: </span>
            <span>{aiError}</span>
          </div>
        </div>
      )}

      {/* 1. Alternative Hook Ideas */}
      <div className="space-y-2.5">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>High-Impact Hook Variations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestions.hooks.map((hook, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-3 flex flex-col justify-between hover:border-slate-600 transition-colors group"
            >
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{hook}</p>
              <button
                onClick={() => handleCopy(hook, `hook-${idx}`)}
                className="self-end flex items-center space-x-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors bg-slate-800 px-2 py-1 rounded-md border border-slate-700"
              >
                {copiedIndex === `hook-${idx}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Suggested Call-to-Actions (CTAs) */}
      <div className="space-y-2.5">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
          <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
          <span>Suggested Call-to-Actions (CTAs)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestions.ctas.map((cta, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-700/70 rounded-xl p-3 flex flex-col justify-between hover:border-slate-600 transition-colors group"
            >
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{cta}</p>
              <button
                onClick={() => handleCopy(cta, `cta-${idx}`)}
                className="self-end flex items-center space-x-1 text-[11px] text-slate-400 hover:text-emerald-300 transition-colors bg-slate-800 px-2 py-1 rounded-md border border-slate-700"
              >
                {copiedIndex === `cta-${idx}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Formatting Guidelines & Suggested Hashtags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Formatting Tips */}
        <div className="bg-slate-900/70 rounded-xl p-3.5 border border-slate-700/60 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <AlignLeft className="w-3.5 h-3.5 text-purple-400" />
            <span>Formatting Best Practices</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-400">
            {suggestions.formattingTips.map((tip, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-purple-400">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Hashtags */}
        <div className="bg-slate-900/70 rounded-xl p-3.5 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Hash className="w-3.5 h-3.5 text-pink-400" />
              <span>Recommended Hashtags</span>
            </div>
            <button
              onClick={() => handleCopy(suggestions.recommendedHashtags.join(' '), 'all-tags')}
              className="text-[10px] text-slate-400 hover:text-pink-300 underline"
            >
              {copiedIndex === 'all-tags' ? 'Copied all!' : 'Copy All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {suggestions.recommendedHashtags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => handleCopy(tag, `tag-${idx}`)}
                className="text-xs font-mono bg-slate-800 text-pink-300 border border-slate-700 px-2.5 py-1 rounded-lg hover:bg-slate-700/80 transition-colors flex items-center space-x-1"
              >
                <span>{tag}</span>
                {copiedIndex === `tag-${idx}` && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

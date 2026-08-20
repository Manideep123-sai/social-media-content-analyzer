import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Flame,
  BookOpen,
  MousePointerClick,
  AlignLeft,
  Hash,
  Smile,
  Clock,
  Type,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import { AnalysisResult, MetricScore } from '../types';

interface AnalysisDashboardProps {
  result: AnalysisResult;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  const { overallScore, tier, metrics, stats, strengths, improvements } = result;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getProgressColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 60) return 'bg-indigo-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getRatingBadge = (rating: MetricScore['rating']) => {
    switch (rating) {
      case 'Excellent':
        return <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">Excellent</span>;
      case 'Good':
        return <span className="text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">Good</span>;
      case 'Average':
        return <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">Average</span>;
      default:
        return <span className="text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md">Needs Work</span>;
    }
  };

  const metricCards = [
    {
      key: 'hook',
      icon: Flame,
      color: 'text-amber-400',
      data: metrics.hook,
      max: 20
    },
    {
      key: 'readability',
      icon: BookOpen,
      color: 'text-blue-400',
      data: metrics.readability,
      max: 20
    },
    {
      key: 'cta',
      icon: MousePointerClick,
      color: 'text-emerald-400',
      data: metrics.cta,
      max: 20
    },
    {
      key: 'formatting',
      icon: AlignLeft,
      color: 'text-purple-400',
      data: metrics.formatting,
      max: 20
    },
    {
      key: 'hashtags',
      icon: Hash,
      color: 'text-pink-400',
      data: metrics.hashtags,
      max: 10
    },
    {
      key: 'tone',
      icon: Smile,
      color: 'text-cyan-400',
      data: metrics.tone,
      max: 10
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Main Score Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Background gradient decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center space-x-4">
            {/* Circular score dial */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg shrink-0 ${getScoreColor(overallScore)}`}>
              <span className="font-extrabold text-3xl sm:text-4xl tracking-tight leading-none font-mono">
                {overallScore}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-semibold text-slate-400 mt-1">
                / 100
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Engagement Score
                </span>
                <span className="text-xs text-slate-500">•</span>
                {result.analysisMode === 'ai' ? (
                  <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Gemini AI Analysis</span>
                  </span>
                ) : (
                  <span className="text-xs text-indigo-400 font-medium">Heuristic Model</span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {tier}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                {result.summary}
              </p>

              {result.aiCritique && (
                <div className="mt-3 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200/90 flex items-start space-x-2">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">Blunt Take: </span>
                    <span>{result.aiCritique}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-700 rounded-xl flex items-center space-x-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Reading Time:</span>
              <span className="font-semibold text-slate-200">~{stats.readingTimeSec}s</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-900/80 border border-slate-700 rounded-xl flex items-center space-x-2 text-xs">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Tone:</span>
              <span className="font-semibold text-slate-200">{result.detectedTone}</span>
            </div>
          </div>
        </div>

        {/* Quick Text Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-5 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Words</p>
            <p className="text-base font-bold text-slate-100 font-mono mt-0.5">{stats.wordCount}</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Characters</p>
            <p className="text-base font-bold text-slate-100 font-mono mt-0.5">{stats.charCount}</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Sentences</p>
            <p className="text-base font-bold text-slate-100 font-mono mt-0.5">{stats.sentenceCount}</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Avg Sentence</p>
            <p className="text-base font-bold text-slate-100 font-mono mt-0.5">{stats.avgSentenceLength} w</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Paragraphs</p>
            <p className="text-base font-bold text-slate-100 font-mono mt-0.5">{stats.paragraphCount}</p>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/40">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Readability</p>
            <p className="text-xs font-semibold text-indigo-300 mt-1 truncate" title={stats.readabilityGrade}>
              {stats.readabilityGrade.split(' ')[0]}
            </p>
          </div>
        </div>
      </div>

      {/* 6 Transparent Scoring Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Detailed Scoring Breakdown</span>
          </h3>
          <span className="text-xs text-slate-400">Transparent Rule-Based Weights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {metricCards.map(({ key, icon: Icon, color, data, max }) => (
            <div
              key={key}
              className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg bg-slate-900/80 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{data.name}</span>
                  </div>
                  {getRatingBadge(data.rating)}
                </div>

                {/* Score bar */}
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">Score</span>
                  <span className="font-bold text-slate-200">
                    {data.score} <span className="text-slate-500 font-normal">/ {max}</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${getProgressColor(data.score, max)} transition-all duration-500 rounded-full`}
                    style={{ width: `${(data.score / max) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {data.explanation}
                </p>
              </div>

              {/* Quick tip bullet */}
              {data.tips.length > 0 && (
                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 mt-2">
                  💡 {data.tips[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Strengths & Priority Improvements summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center space-x-2 text-emerald-400 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <h4 className="text-sm font-semibold text-emerald-300">Key Strengths</h4>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300">
              {strengths.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">Review recommendations below to build post strength.</p>
          )}
        </div>

        {/* Priority Improvements */}
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center space-x-2 text-amber-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-sm font-semibold text-amber-300">Priority Improvements</h4>
          </div>
          {improvements.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300">
              {improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-400 font-medium">Post checks all primary engagement guidelines!</p>
          )}
        </div>
      </div>
    </div>
  );
};

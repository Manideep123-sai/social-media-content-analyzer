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
    if (score >= 85) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-indigo-500 border-indigo-500/30 bg-indigo-500/10';
    if (score >= 50) return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
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
        return <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">Excellent</span>;
      case 'Good':
        return <span className="text-[10px] font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">Good</span>;
      case 'Average':
        return <span className="text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">Average</span>;
      default:
        return <span className="text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md">Needs Work</span>;
    }
  };

  const metricCards = [
    {
      key: 'hook',
      icon: Flame,
      color: 'text-amber-500 dark:text-amber-400 bg-amber-500/10',
      data: metrics.hook,
      max: 20
    },
    {
      key: 'readability',
      icon: BookOpen,
      color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10',
      data: metrics.readability,
      max: 20
    },
    {
      key: 'cta',
      icon: MousePointerClick,
      color: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10',
      data: metrics.cta,
      max: 20
    },
    {
      key: 'formatting',
      icon: AlignLeft,
      color: 'text-purple-500 dark:text-purple-400 bg-purple-500/10',
      data: metrics.formatting,
      max: 20
    },
    {
      key: 'hashtags',
      icon: Hash,
      color: 'text-pink-500 dark:text-pink-400 bg-pink-500/10',
      data: metrics.hashtags,
      max: 10
    },
    {
      key: 'tone',
      icon: Smile,
      color: 'text-cyan-500 dark:text-cyan-400 bg-cyan-500/10',
      data: metrics.tone,
      max: 10
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Main Score Card */}
      <div className="dark:bg-matte-900/90 bg-white border dark:border-matte-800 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-colors duration-300">
        {/* Background gradient decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center space-x-4">
            {/* Circular score dial */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg shrink-0 ${getScoreColor(overallScore)}`}>
              <span className="font-extrabold text-3xl sm:text-4xl tracking-tight leading-none font-mono">
                {overallScore}
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold dark:text-slate-400 text-slate-500 mt-1">
                / 100
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider dark:text-slate-400 text-slate-500">
                  Engagement Score
                </span>
                <span className="text-xs text-slate-400">•</span>
                {result.analysisMode === 'ai' ? (
                  <span className="inline-flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>Gemini AI Analysis</span>
                  </span>
                ) : (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Heuristic Model</span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900 mt-0.5">
                {tier}
              </h2>
              <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 mt-1 max-w-xl leading-relaxed">
                {result.summary}
              </p>

              {result.aiCritique && (
                <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs dark:text-indigo-200 text-indigo-900 flex items-start space-x-2">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-600 dark:text-amber-300">Blunt Take: </span>
                    <span>{result.aiCritique}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <div className="px-3.5 py-1.5 dark:bg-matte-950 bg-slate-100 border dark:border-matte-800 border-slate-200 rounded-xl flex items-center space-x-2 text-xs shadow-sm">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="dark:text-slate-400 text-slate-500">Reading Time:</span>
              <span className="font-semibold dark:text-slate-200 text-slate-800">~{stats.readingTimeSec}s</span>
            </div>
            <div className="px-3.5 py-1.5 dark:bg-matte-950 bg-slate-100 border dark:border-matte-800 border-slate-200 rounded-xl flex items-center space-x-2 text-xs shadow-sm">
              <Type className="w-3.5 h-3.5 text-indigo-500" />
              <span className="dark:text-slate-400 text-slate-500">Tone:</span>
              <span className="font-semibold dark:text-slate-200 text-slate-800">{result.detectedTone}</span>
            </div>
          </div>
        </div>

        {/* Quick Text Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mt-5 pt-5 border-t dark:border-matte-800 border-slate-200">
          <div className="dark:bg-matte-950 bg-slate-50 p-2.5 rounded-2xl border dark:border-matte-800 border-slate-200 shadow-sm">
            <p className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500">Words</p>
            <p className="text-base font-bold dark:text-white text-slate-900 font-mono mt-0.5">{stats.wordCount}</p>
          </div>
          <div className="dark:bg-matte-950 bg-slate-50 p-2.5 rounded-2xl border dark:border-matte-800 border-slate-200 shadow-sm">
            <p className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500">Characters</p>
            <p className="text-base font-bold dark:text-white text-slate-900 font-mono mt-0.5">{stats.charCount}</p>
          </div>
          <div className="dark:bg-matte-950 bg-slate-50 p-2.5 rounded-2xl border dark:border-matte-800 border-slate-200 shadow-sm">
            <p className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500">Sentences</p>
            <p className="text-base font-bold dark:text-white text-slate-900 font-mono mt-0.5">{stats.sentenceCount}</p>
          </div>
          <div className="dark:bg-matte-950 bg-slate-50 p-2.5 rounded-2xl border dark:border-matte-800 border-slate-200 shadow-sm">
            <p className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500">Avg Sentence</p>
            <p className="text-base font-bold dark:text-white text-slate-900 font-mono mt-0.5">{stats.avgSentenceLength} w</p>
          </div>
          <div className="dark:bg-matte-950 bg-slate-50 p-2.5 rounded-2xl border dark:border-matte-800 border-slate-200 shadow-sm">
            <p className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500">Paragraphs</p>
            <p className="text-base font-bold dark:text-white text-slate-900 font-mono mt-0.5">{stats.paragraphCount}</p>
          </div>
          <div className="dark:bg-matte-950 bg-slate-50 p-2.5 rounded-2xl border dark:border-matte-800 border-slate-200 shadow-sm">
            <p className="text-[10px] uppercase font-bold dark:text-slate-400 text-slate-500">Readability</p>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 truncate" title={stats.readabilityGrade}>
              {stats.readabilityGrade.split(' ')[0]}
            </p>
          </div>
        </div>
      </div>

      {/* 6 Transparent Scoring Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold dark:text-slate-200 text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Detailed Scoring Breakdown</span>
          </h3>
          <span className="text-xs dark:text-slate-400 text-slate-500">Transparent Rule-Based Weights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {metricCards.map(({ key, icon: Icon, color, data, max }) => (
            <div
              key={key}
              className="dark:bg-matte-900/90 bg-white border dark:border-matte-800 border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-xl ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold dark:text-slate-200 text-slate-800">{data.name}</span>
                  </div>
                  {getRatingBadge(data.rating)}
                </div>

                {/* Score bar */}
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="dark:text-slate-400 text-slate-500">Score</span>
                  <span className="font-bold dark:text-white text-slate-900">
                    {data.score} <span className="dark:text-slate-500 text-slate-400 font-normal">/ {max}</span>
                  </span>
                </div>
                <div className="w-full h-2 dark:bg-matte-950 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${getProgressColor(data.score, max)} transition-all duration-500 rounded-full`}
                    style={{ width: `${(data.score / max) * 100}%` }}
                  />
                </div>

                <p className="text-xs dark:text-slate-300 text-slate-600 leading-relaxed mb-2">
                  {data.explanation}
                </p>
              </div>

              {/* Quick tip bullet */}
              {data.tips.length > 0 && (
                <div className="text-[11px] dark:text-slate-400 text-slate-600 dark:bg-matte-950 bg-slate-50 p-2.5 rounded-xl border dark:border-matte-800 border-slate-200 mt-2">
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
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Key Strengths</h4>
          </div>
          {strengths.length > 0 ? (
            <ul className="space-y-2 text-xs dark:text-slate-300 text-slate-700">
              {strengths.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">Review recommendations below to build post strength.</p>
          )}
        </div>

        {/* Priority Improvements */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5">
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 mb-3">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-300">Priority Improvements</h4>
          </div>
          {improvements.length > 0 ? (
            <ul className="space-y-2 text-xs dark:text-slate-300 text-slate-700">
              {improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Post checks all primary engagement guidelines!</p>
          )}
        </div>
      </div>
    </div>
  );
};

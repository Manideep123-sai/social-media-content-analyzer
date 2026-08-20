export interface MetricScore {
  name: string;
  score: number;
  maxScore: number;
  rating: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  explanation: string;
  tips: string[];
}

export interface PlatformScore {
  platform: 'LinkedIn' | 'X (Twitter)' | 'Instagram';
  score: number;
  characterCount: number;
  maxRecommendedCharacters: number;
  hardLimit: number;
  status: 'Optimal' | 'Good' | 'Too Long' | 'Needs Adjustment';
  highlights: string[];
  recommendations: string[];
}

export interface TextStats {
  wordCount: number;
  charCount: number;
  charCountNoSpaces: number;
  sentenceCount: number;
  avgSentenceLength: number;
  paragraphCount: number;
  readingTimeSec: number;
  questionCount: number;
  exclamationCount: number;
  emojiCount: number;
  hashtagCount: number;
  readabilityGrade: string;
}

export interface Suggestions {
  hooks: string[];
  ctas: string[];
  formattingTips: string[];
  recommendedHashtags: string[];
  toneAdvice: string;
}

export interface AnalysisResult {
  overallScore: number;
  tier: 'High Engagement Potential' | 'Moderate Potential' | 'Needs Polish' | 'Needs Major Improvement';
  summary: string;
  stats: TextStats;
  metrics: {
    hook: MetricScore;
    readability: MetricScore;
    cta: MetricScore;
    formatting: MetricScore;
    hashtags: MetricScore;
    tone: MetricScore;
  };
  strengths: string[];
  improvements: string[];
  suggestions: Suggestions;
  platforms: {
    linkedin: PlatformScore;
    x: PlatformScore;
    instagram: PlatformScore;
  };
  detectedTone: string;
  sourceType: 'pdf' | 'image' | 'text' | 'sample';
  timestamp: string;
}

export interface ExtractionProgress {
  status: 'idle' | 'uploading' | 'parsing_pdf' | 'running_ocr' | 'analyzing' | 'complete' | 'error';
  progress: number; // 0 to 100
  message: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  pageCount?: number;
  error?: string;
}

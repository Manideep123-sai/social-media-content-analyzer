import { AnalysisResult, MetricScore, PlatformScore, TextStats, Suggestions } from '../types';

// Power words that increase hook engagement
const HOOK_POWER_WORDS = [
  'how to', 'why most', 'stop', 'secret', 'mistake', 'framework', 'unpopular opinion',
  'proven', 'lessons', 'guide', 'steal this', 'truth about', 'biggest', 'step-by-step',
  'what happens when', 'never', 'always', 'simple', 'formula', 'blueprint', 'essential'
];

// Common CTA trigger phrases and verbs
const CTA_TRIGGERS = [
  'what do you think', 'let me know', 'agree', 'disagree', 'drop your', 'comment below',
  'share this', 'save this', 'follow for more', 'link in', 'check out', 'repost',
  'thoughts?', 'curious to hear', 'would love your take', 'dm me', 'click the link',
  'what has been your experience', 'reply with', 'tag someone'
];

const POSITIVE_WORDS = [
  'great', 'growth', 'opportunity', 'success', 'strategy', 'achieve', 'winning',
  'transform', 'inspire', 'valuable', 'effective', 'master', 'boost', 'innovate', 'impact'
];

const CONVERSATIONAL_WORDS = [
  'you', 'your', 'we', 'i', 'honestly', 'remember', 'imagine', 'here is why', 'let us'
];

/**
 * Parses raw text into statistics and metrics
 */
export function calculateTextStats(text: string): TextStats {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      charCount: 0,
      charCountNoSpaces: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      paragraphCount: 0,
      readingTimeSec: 0,
      questionCount: 0,
      exclamationCount: 0,
      emojiCount: 0,
      hashtagCount: 0,
      readabilityGrade: 'N/A'
    };
  }

  const words = trimmed.match(/\b\S+\b/g) || [];
  const wordCount = words.length;
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s+/g, '').length;

  // Split into sentences
  const sentences = trimmed.split(/[.!?]+(?:\s+|\n+|$)/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);
  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;

  // Paragraph count
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = Math.max(1, paragraphs.length);

  // Reading time: avg 200 words per minute
  const readingTimeSec = Math.max(1, Math.round((wordCount / 200) * 60));

  // Count punctuation & symbols
  const questionCount = (text.match(/\?/g) || []).length;
  const exclamationCount = (text.match(/!/g) || []).length;

  // Emojis regex
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;
  const emojiCount = (text.match(emojiRegex) || []).length;

  // Hashtags regex
  const hashtagCount = (text.match(/#[a-zA-Z0-9_]+/g) || []).length;

  // Approximate Readability Grade (based on avg sentence length & word length)
  let readabilityGrade = 'Easy (Grade 6–8)';
  if (avgSentenceLength > 22) {
    readabilityGrade = 'Complex / Dense (Grade 12+)';
  } else if (avgSentenceLength > 16) {
    readabilityGrade = 'Moderate (Grade 9–11)';
  } else if (avgSentenceLength < 10) {
    readabilityGrade = 'Very Conversational (Grade 4–6)';
  }

  return {
    wordCount,
    charCount,
    charCountNoSpaces,
    sentenceCount,
    avgSentenceLength,
    paragraphCount,
    readingTimeSec,
    questionCount,
    exclamationCount,
    emojiCount,
    hashtagCount,
    readabilityGrade
  };
}

/**
 * Evaluates Hook Strength (0 - 20)
 */
function evaluateHook(text: string, stats: TextStats): MetricScore {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const firstLine = lines[0] || '';
  const firstSentence = text.split(/[.!?\n]/)[0]?.trim() || '';
  const targetHook = firstLine.length > 0 && firstLine.length < 150 ? firstLine : firstSentence;

  let score = 8; // base
  const tips: string[] = [];
  const lowerHook = targetHook.toLowerCase();

  // Check question hook
  if (targetHook.includes('?')) {
    score += 4;
    tips.push('Good use of a question hook to spark curiosity.');
  }

  // Check numbers/stats in hook
  if (/\b\d+(\.\d+)?%?\b/.test(targetHook)) {
    score += 4;
    tips.push('Specific numbers/data in the opening increase credibility.');
  }

  // Check power words
  const matchedPowerWord = HOOK_POWER_WORDS.some(pw => lowerHook.includes(pw));
  if (matchedPowerWord) {
    score += 3;
    tips.push('High-converting power phrase detected in opening line.');
  }

  // Check length & punchiness
  if (targetHook.length > 0 && targetHook.length <= 90) {
    score += 3;
    tips.push('Opening sentence is concise and immediately scannable.');
  } else if (targetHook.length > 140) {
    score -= 3;
    tips.push('Opening is slightly long (>140 chars). Trim to make it punchier.');
  }

  score = Math.min(20, Math.max(2, score));

  let rating: MetricScore['rating'] = 'Good';
  if (score >= 17) rating = 'Excellent';
  else if (score >= 13) rating = 'Good';
  else if (score >= 9) rating = 'Average';
  else rating = 'Needs Improvement';

  return {
    name: 'Hook Strength',
    score,
    maxScore: 20,
    rating,
    explanation: `Your opening (${targetHook.slice(0, 50)}${targetHook.length > 50 ? '...' : ''}) scored ${score}/20 based on punchiness and curiosity triggers.`,
    tips: tips.length > 0 ? tips : ['Start with a bold question, statistic, or contrarian statement to hook scrolling readers.']
  };
}

/**
 * Evaluates Readability (0 - 20)
 */
function evaluateReadability(stats: TextStats): MetricScore {
  let score = 12;
  const tips: string[] = [];

  if (stats.avgSentenceLength >= 8 && stats.avgSentenceLength <= 16) {
    score += 6;
    tips.push('Sentence length is well-balanced for mobile reading (8–16 words/sentence).');
  } else if (stats.avgSentenceLength > 22) {
    score -= 5;
    tips.push('Sentences average >22 words. Break compound sentences into shorter thoughts.');
  } else {
    score += 3;
  }

  // Punctuation variety
  if (stats.questionCount >= 1) {
    score += 2;
  }

  score = Math.min(20, Math.max(2, score));

  let rating: MetricScore['rating'] = 'Good';
  if (score >= 17) rating = 'Excellent';
  else if (score >= 13) rating = 'Good';
  else if (score >= 9) rating = 'Average';
  else rating = 'Needs Improvement';

  return {
    name: 'Readability & Flow',
    score,
    maxScore: 20,
    rating,
    explanation: `Assessed at ${stats.readabilityGrade} with an average of ${stats.avgSentenceLength} words per sentence.`,
    tips: tips.length > 0 ? tips : ['Aim for simple language and rhythmic sentence lengths.']
  };
}

/**
 * Evaluates Call to Action (CTA) (0 - 20)
 */
function evaluateCTA(text: string, stats: TextStats): MetricScore {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const endingSnippet = lines.slice(-2).join(' ').toLowerCase();
  
  let score = 5;
  const tips: string[] = [];

  const hasCTATrigger = CTA_TRIGGERS.some(trigger => endingSnippet.includes(trigger) || text.toLowerCase().includes(trigger));
  const endsWithQuestion = endingSnippet.includes('?');

  if (hasCTATrigger && endsWithQuestion) {
    score = 20;
    tips.push('Excellent clear Call to Action ending with an engaging question.');
  } else if (hasCTATrigger) {
    score = 16;
    tips.push('Clear action requested in the conclusion.');
  } else if (endsWithQuestion) {
    score = 15;
    tips.push('Closing question invites conversation and comments.');
  } else {
    score = 6;
    tips.push('No direct Call-to-Action detected. Ask readers for their thoughts or next step.');
  }

  let rating: MetricScore['rating'] = 'Good';
  if (score >= 17) rating = 'Excellent';
  else if (score >= 13) rating = 'Good';
  else if (score >= 9) rating = 'Average';
  else rating = 'Needs Improvement';

  return {
    name: 'Call to Action (CTA)',
    score,
    maxScore: 20,
    rating,
    explanation: hasCTATrigger || endsWithQuestion ? 'Strong closing invitation detected.' : 'Post lacks a distinct closing prompt.',
    tips
  };
}

/**
 * Evaluates Formatting & Whitespace (0 - 20)
 */
function evaluateFormatting(text: string, stats: TextStats): MetricScore {
  let score = 10;
  const tips: string[] = [];

  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const avgWordsPerParagraph = stats.paragraphCount > 0 ? Math.round(stats.wordCount / stats.paragraphCount) : stats.wordCount;

  // Single block of text penalty
  if (stats.paragraphCount === 1 && stats.wordCount > 60) {
    score -= 6;
    tips.push('Text is currently a single dense block. Add line breaks every 1–3 sentences.');
  } else if (stats.paragraphCount >= 3 && avgWordsPerParagraph <= 40) {
    score += 6;
    tips.push('Great use of whitespace and readable paragraph chunks.');
  } else {
    score += 3;
  }

  // Lists / bullet points detection
  const hasBullets = /^[•\-\*–—\d+\.]\s/m.test(text);
  if (hasBullets) {
    score += 4;
    tips.push('Bullet points or numbered lists make the post easy to skim.');
  }

  score = Math.min(20, Math.max(2, score));

  let rating: MetricScore['rating'] = 'Good';
  if (score >= 17) rating = 'Excellent';
  else if (score >= 13) rating = 'Good';
  else if (score >= 9) rating = 'Average';
  else rating = 'Needs Improvement';

  return {
    name: 'Visual Formatting & Whitespace',
    score,
    maxScore: 20,
    rating,
    explanation: `${stats.paragraphCount} paragraph sections detected with ~${avgWordsPerParagraph} words/section.`,
    tips: tips.length > 0 ? tips : ['Use double line breaks to ensure readability on mobile screens.']
  };
}

/**
 * Evaluates Hashtag & Emoji Usage (0 - 10)
 */
function evaluateHashtagsAndEmojis(stats: TextStats): MetricScore {
  let score = 5;
  const tips: string[] = [];

  // Hashtags (Optimal: 2–5)
  if (stats.hashtagCount >= 2 && stats.hashtagCount <= 5) {
    score += 3;
    tips.push('Optimal hashtag count (2–5 tags) for discoverability without looking spammy.');
  } else if (stats.hashtagCount > 10) {
    score -= 2;
    tips.push('Too many hashtags (>10) can trigger spam filters and clutter your message.');
  } else if (stats.hashtagCount === 0) {
    tips.push('Adding 2–3 niche hashtags can expand audience reach.');
  }

  // Emojis (Optimal: 1–5)
  if (stats.emojiCount >= 1 && stats.emojiCount <= 6) {
    score += 2;
    tips.push('Tasteful emoji usage provides visual anchor points.');
  } else if (stats.emojiCount > 10) {
    score -= 1;
    tips.push('Heavy emoji usage may distract from the core value proposition.');
  }

  score = Math.min(10, Math.max(1, score));

  let rating: MetricScore['rating'] = 'Good';
  if (score >= 8) rating = 'Excellent';
  else if (score >= 6) rating = 'Good';
  else if (score >= 4) rating = 'Average';
  else rating = 'Needs Improvement';

  return {
    name: 'Hashtag & Visual Polish',
    score,
    maxScore: 10,
    rating,
    explanation: `${stats.hashtagCount} hashtags and ${stats.emojiCount} emojis identified.`,
    tips
  };
}

/**
 * Evaluates Tone & Engagement Factor (0 - 10)
 */
function evaluateTone(text: string, stats: TextStats): { metric: MetricScore; detectedTone: string } {
  const lower = text.toLowerCase();
  let score = 6;
  const tips: string[] = [];

  const posCount = POSITIVE_WORDS.filter(w => lower.includes(w)).length;
  const convCount = CONVERSATIONAL_WORDS.filter(w => lower.includes(w)).length;

  if (convCount >= 3) {
    score += 2;
    tips.push('Direct reader address ("you/your") creates strong personal resonance.');
  }

  if (posCount >= 2) {
    score += 2;
    tips.push('Proactive, solution-oriented vocabulary detected.');
  }

  score = Math.min(10, Math.max(2, score));

  let detectedTone = 'Informative & Professional';
  if (stats.questionCount >= 2 && convCount >= 4) {
    detectedTone = 'Conversational & Interactive';
  } else if (lower.includes('stop') || lower.includes('mistake') || lower.includes('unpopular')) {
    detectedTone = 'Bold / Thought-Provoking';
  } else if (posCount >= 4) {
    detectedTone = 'Inspirational & Motivating';
  }

  let rating: MetricScore['rating'] = 'Good';
  if (score >= 8) rating = 'Excellent';
  else if (score >= 6) rating = 'Good';
  else if (score >= 4) rating = 'Average';
  else rating = 'Needs Improvement';

  return {
    metric: {
      name: 'Tone & Sentiment',
      score,
      maxScore: 10,
      rating,
      explanation: `Tone identified as ${detectedTone}.`,
      tips: tips.length > 0 ? tips : ['Use direct conversational address to maintain reader interest.']
    },
    detectedTone
  };
}

/**
 * Evaluates Platform Compatibility (LinkedIn, X, Instagram)
 */
function evaluatePlatforms(text: string, stats: TextStats): {
  linkedin: PlatformScore;
  x: PlatformScore;
  instagram: PlatformScore;
} {
  const charLen = stats.charCount;

  // 1. LinkedIn
  let liScore = 75;
  const liHighlights: string[] = [];
  const liRecs: string[] = [];

  if (stats.paragraphCount >= 3 && stats.wordCount >= 60 && stats.wordCount <= 300) {
    liScore += 18;
    liHighlights.push('Ideal length and paragraph breakdown for LinkedIn feed algorithm.');
  } else if (stats.wordCount < 40) {
    liScore -= 10;
    liRecs.push('A bit short for LinkedIn. Expand with a story or practical lesson.');
  }
  if (stats.hashtagCount >= 2 && stats.hashtagCount <= 5) {
    liScore += 7;
    liHighlights.push('Hashtags within LinkedIn optimal range (3–5 tags).');
  }

  // 2. X (Twitter)
  let xScore = 80;
  const xHighlights: string[] = [];
  const xRecs: string[] = [];

  if (charLen <= 280) {
    xScore += 18;
    xHighlights.push('Fits perfectly within standard 280-character single tweet limit.');
  } else {
    xScore = Math.max(35, 90 - Math.floor((charLen - 280) / 40));
    xRecs.push(`Exceeds 280 chars by ${charLen - 280} chars. Best formatted as a Twitter Thread.`);
  }

  // 3. Instagram
  let igScore = 70;
  const igHighlights: string[] = [];
  const igRecs: string[] = [];

  if (charLen <= 2200) {
    igHighlights.push('Within Instagram 2,200 character caption limit.');
  }
  if (stats.hashtagCount >= 3 && stats.hashtagCount <= 8) {
    igScore += 15;
    igHighlights.push('Solid hashtag balance for Instagram discovery.');
  } else if (stats.hashtagCount < 2) {
    igRecs.push('Instagram posts thrive on 4–8 relevant topic hashtags at the end.');
  }
  if (stats.emojiCount >= 2) {
    igScore += 10;
    igHighlights.push('Visual emoji usage aligns well with Instagram aesthetic.');
  }

  return {
    linkedin: {
      platform: 'LinkedIn',
      score: Math.min(100, Math.max(10, liScore)),
      characterCount: charLen,
      maxRecommendedCharacters: 1500,
      hardLimit: 3000,
      status: charLen <= 3000 ? 'Optimal' : 'Too Long',
      highlights: liHighlights,
      recommendations: liRecs
    },
    x: {
      platform: 'X (Twitter)',
      score: Math.min(100, Math.max(10, xScore)),
      characterCount: charLen,
      maxRecommendedCharacters: 280,
      hardLimit: 280,
      status: charLen <= 280 ? 'Optimal' : 'Too Long',
      highlights: xHighlights,
      recommendations: xRecs
    },
    instagram: {
      platform: 'Instagram',
      score: Math.min(100, Math.max(10, igScore)),
      characterCount: charLen,
      maxRecommendedCharacters: 1000,
      hardLimit: 2200,
      status: charLen <= 2200 ? 'Optimal' : 'Too Long',
      highlights: igHighlights,
      recommendations: igRecs
    }
  };
}

/**
 * Generates Actionable Content Improvement Suggestions
 */
function generateActionableSuggestions(text: string, stats: TextStats): Suggestions {
  const words = text.match(/\b[A-Za-z]{4,}\b/g) || [];
  const uniqueKeyWords = Array.from(new Set(words.map(w => w.toLowerCase())))
    .filter(w => !['this', 'that', 'with', 'from', 'have', 'were', 'what', 'your', 'about', 'some'].includes(w))
    .slice(0, 5);

  const suggestedTags = uniqueKeyWords.map(w => `#${w.charAt(0).toUpperCase() + w.slice(1)}`);
  if (suggestedTags.length === 0) {
    suggestedTags.push('#ContentStrategy', '#Growth', '#Productivity');
  }

  // Hook suggestions
  const firstSentence = text.split(/[.!?\n]/)[0]?.trim() || 'Your core message';
  const hooks = [
    `❓ Question Hook: "What is the #1 mistake most people make with ${uniqueKeyWords[0] || 'this'}?"`,
    `📊 Data Hook: "90% of creators overlook this simple lesson on ${uniqueKeyWords[0] || 'growth'}:"`,
    `🔥 Contrarian Hook: "Unpopular opinion: Stop doing ${uniqueKeyWords[1] || uniqueKeyWords[0] || 'things the traditional way'}. Here is why:"`
  ];

  // CTA suggestions
  const ctas = [
    `💬 "What has been your biggest takeaway with this? Drop your thoughts below!"`,
    `📌 "Save this post for later and share it with someone who needs this today."`,
    `🚀 "Which strategy will you try first? 1 or 2? Let me know in the comments."`
  ];

  // Formatting tips
  const formattingTips: string[] = [];
  if (stats.paragraphCount <= 2 && stats.wordCount > 50) {
    formattingTips.push('Break dense paragraphs into 1–2 line bite-sized sections.');
  }
  if (stats.avgSentenceLength > 18) {
    formattingTips.push('Shorten sentences to under 15 words to increase mobile retention.');
  }
  if (stats.emojiCount === 0) {
    formattingTips.push('Add 1–3 contextual emojis (👉, 💡, 🚀) as bullet anchors.');
  }
  if (formattingTips.length === 0) {
    formattingTips.push('Formatting and line spacing are clean and mobile-friendly!');
  }

  return {
    hooks,
    ctas,
    formattingTips,
    recommendedHashtags: suggestedTags,
    toneAdvice: 'Maintain an empathetic, direct conversational voice addressing the reader directly.'
  };
}

/**
 * Main Analysis Orchestrator
 */
export function analyzeContent(
  rawText: string,
  sourceType: 'pdf' | 'image' | 'text' | 'sample' = 'text'
): AnalysisResult {
  const cleanText = rawText.trim();
  const stats = calculateTextStats(cleanText);

  // Evaluate 6 distinct transparent metrics
  const hookMetric = evaluateHook(cleanText, stats);
  const readabilityMetric = evaluateReadability(stats);
  const ctaMetric = evaluateCTA(cleanText, stats);
  const formattingMetric = evaluateFormatting(cleanText, stats);
  const hashtagsMetric = evaluateHashtagsAndEmojis(stats);
  const toneResult = evaluateTone(cleanText, stats);

  const overallScore = Math.round(
    hookMetric.score +
    readabilityMetric.score +
    ctaMetric.score +
    formattingMetric.score +
    hashtagsMetric.score +
    toneResult.metric.score
  );

  let tier: AnalysisResult['tier'] = 'Moderate Potential';
  if (overallScore >= 85) tier = 'High Engagement Potential';
  else if (overallScore >= 70) tier = 'Moderate Potential';
  else if (overallScore >= 50) tier = 'Needs Polish';
  else tier = 'Needs Major Improvement';

  const strengths: string[] = [];
  const improvements: string[] = [];

  [hookMetric, readabilityMetric, ctaMetric, formattingMetric, hashtagsMetric, toneResult.metric].forEach(m => {
    if (m.score >= (m.maxScore * 0.8)) {
      strengths.push(`${m.name}: ${m.tips[0] || m.explanation}`);
    } else {
      improvements.push(`${m.name}: ${m.tips[0] || m.explanation}`);
    }
  });

  const platforms = evaluatePlatforms(cleanText, stats);
  const suggestions = generateActionableSuggestions(cleanText, stats);

  return {
    overallScore,
    tier,
    summary: `Content analyzed with an overall engagement score of ${overallScore}/100 based on hook strength, clarity, formatting, and call to action.`,
    stats,
    metrics: {
      hook: hookMetric,
      readability: readabilityMetric,
      cta: ctaMetric,
      formatting: formattingMetric,
      hashtags: hashtagsMetric,
      tone: toneResult.metric
    },
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3),
    suggestions,
    platforms,
    detectedTone: toneResult.detectedTone,
    sourceType,
    timestamp: new Date().toLocaleTimeString()
  };
}

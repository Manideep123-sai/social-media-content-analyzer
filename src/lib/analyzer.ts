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

const COMMON_VOCABULARY = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on',
  'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we',
  'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
  'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into',
  'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
  'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
  'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
  'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'has', 'had'
]);

/**
 * Calculates a continuous Linguistic Quality Index (LQI) from 0.0 to 1.0
 * Evaluates vowel balance, dictionary word matches, character entropy, and word length distribution.
 */
export function calculateLinguisticQuality(text: string): {
  lqi: number;
  isGibberish: boolean;
  vowelRatio: number;
  recognizedWordRatio: number;
} {
  const clean = text.trim();
  if (clean.length === 0) {
    return { lqi: 0, isGibberish: true, vowelRatio: 0, recognizedWordRatio: 0 };
  }

  const letters = clean.match(/[a-zA-Z]/g) || [];
  if (letters.length < 4) {
    return { lqi: 0.05, isGibberish: true, vowelRatio: 0, recognizedWordRatio: 0 };
  }

  // 1. Vowel Balance Factor (English is typically 30%-48% vowels)
  const vowels = clean.match(/[aeiouyAEIOUY]/g) || [];
  const vowelRatio = vowels.length / letters.length;
  let vowelScore = 1.0;
  if (vowelRatio < 0.20 || vowelRatio > 0.65) {
    // Sharp decline as vowel ratio approaches 0 or 1
    vowelScore = Math.max(0.0, 1.0 - Math.abs(vowelRatio - 0.38) * 3.5);
  }

  // 2. Recognized Common Word Ratio
  const words = clean.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  let recognizedCount = 0;
  for (const w of words) {
    if (COMMON_VOCABULARY.has(w)) {
      recognizedCount++;
    }
  }
  const recognizedWordRatio = words.length > 0 ? recognizedCount / words.length : 0;

  // 3. Word Length & Character Sanity Factor
  const rawWords = clean.split(/\s+/).filter(w => w.length > 0);
  let lengthPenalty = 0;
  for (const w of rawWords) {
    if (w.length > 24) lengthPenalty += 0.35; // Abnormal keyboard mash tokens
    if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/.test(w)) lengthPenalty += 0.25; // 6 consonants in a row
  }
  const wordSanityFactor = Math.max(0.05, 1.0 - (lengthPenalty / Math.max(1, rawWords.length)));

  // Combine metrics into continuous 0.0 - 1.0 LQI
  // If text has normal words, recognizedWordRatio boosts it; if gibberish, both vowelScore and recognizedWordRatio are near 0.
  const rawLQI = (vowelScore * 0.45) + (Math.min(1.0, recognizedWordRatio * 2.5) * 0.35) + (wordSanityFactor * 0.20);
  const lqi = Math.max(0.02, Math.min(1.0, Math.round(rawLQI * 100) / 100));
  const isGibberish = lqi < 0.30;

  return {
    lqi,
    isGibberish,
    vowelRatio: Math.round(vowelRatio * 100) / 100,
    recognizedWordRatio: Math.round(recognizedWordRatio * 100) / 100
  };
}

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

  // Readability calculation
  let readabilityGrade = 'Conversational (Grade 6–8)';
  if (avgSentenceLength > 22) {
    readabilityGrade = 'Complex / Dense (Grade 12+)';
  } else if (avgSentenceLength > 16) {
    readabilityGrade = 'Moderate (Grade 9–11)';
  } else if (avgSentenceLength < 10) {
    readabilityGrade = 'Simple / Bite-sized (Grade 4–6)';
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
 * Evaluates Hook Strength (0 - 20) continuously
 */
function evaluateHook(text: string, stats: TextStats, lqi: number): MetricScore {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const firstLine = lines[0] || '';
  const firstSentence = text.split(/[.!?\n]/)[0]?.trim() || '';
  const targetHook = firstLine.length > 0 && firstLine.length < 150 ? firstLine : firstSentence;

  let rawScore = 6;
  const tips: string[] = [];
  const lowerHook = targetHook.toLowerCase();

  // Question hook
  if (targetHook.includes('?')) {
    rawScore += 5;
    tips.push('Question opener creates curiosity gap.');
  }

  // Number / Stat
  if (/\b\d+(\.\d+)?%?\b/.test(targetHook)) {
    rawScore += 4;
    tips.push('Specific data or digits increase opening authority.');
  }

  // Power phrase
  if (HOOK_POWER_WORDS.some(pw => lowerHook.includes(pw))) {
    rawScore += 4;
    tips.push('High-converting hook trigger keyword detected.');
  }

  // Length optimization
  if (targetHook.length >= 20 && targetHook.length <= 95) {
    rawScore += 3;
    tips.push('Opening sentence is concise and immediately scannable.');
  } else if (targetHook.length > 140) {
    rawScore -= 3;
    tips.push('Opening sentence exceeds 140 chars. Shorten to grab attention faster.');
  }

  // Scale continuously by Linguistic Quality Index (LQI)
  const finalScore = Math.max(0, Math.min(20, Math.round(rawScore * lqi)));

  let rating: MetricScore['rating'] = 'Needs Improvement';
  if (finalScore >= 16) rating = 'Excellent';
  else if (finalScore >= 12) rating = 'Good';
  else if (finalScore >= 7) rating = 'Average';

  return {
    name: 'Hook Strength',
    score: finalScore,
    maxScore: 20,
    rating,
    explanation: lqi < 0.35
      ? `Opening lacks recognizable vocabulary or coherent curiosity trigger (LQI: ${Math.round(lqi * 100)}%).`
      : `Opening (${targetHook.slice(0, 45)}${targetHook.length > 45 ? '...' : ''}) scored ${finalScore}/20 on curiosity and punchiness.`,
    tips: tips.length > 0 ? tips : ['Start with a bold question, compelling number, or contrarian take to hook scrolling readers.']
  };
}

/**
 * Evaluates Readability & Flow (0 - 20) continuously
 */
function evaluateReadability(stats: TextStats, lqi: number): MetricScore {
  let rawScore = 14;
  const tips: string[] = [];

  // Optimal cadence: 8 to 16 words per sentence
  if (stats.avgSentenceLength >= 8 && stats.avgSentenceLength <= 16) {
    rawScore += 5;
    tips.push('Sentence length is well-balanced for mobile reading (8–16 words/sentence).');
  } else if (stats.avgSentenceLength > 24) {
    const penalty = Math.min(8, Math.round((stats.avgSentenceLength - 20) * 0.8));
    rawScore -= penalty;
    tips.push(`Sentences average ${stats.avgSentenceLength} words. Break compound thoughts into shorter lines.`);
  } else if (stats.avgSentenceLength < 5 && stats.wordCount > 10) {
    rawScore -= 3;
  }

  if (stats.questionCount >= 1) {
    rawScore += 1;
  }

  const finalScore = Math.max(0, Math.min(20, Math.round(rawScore * lqi)));

  let rating: MetricScore['rating'] = 'Needs Improvement';
  if (finalScore >= 16) rating = 'Excellent';
  else if (finalScore >= 12) rating = 'Good';
  else if (finalScore >= 7) rating = 'Average';

  return {
    name: 'Readability & Flow',
    score: finalScore,
    maxScore: 20,
    rating,
    explanation: lqi < 0.35
      ? `Input contains irregular character patterns or low lexical clarity (Score: ${finalScore}/20).`
      : `Assessed at ${stats.readabilityGrade} with ~${stats.avgSentenceLength} words per sentence.`,
    tips: tips.length > 0 ? tips : ['Keep sentence lengths varied and easy to read on mobile screens.']
  };
}

/**
 * Evaluates Call to Action (CTA) (0 - 20) continuously
 */
function evaluateCTA(text: string, stats: TextStats, lqi: number): MetricScore {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const endingSnippet = lines.slice(-2).join(' ').toLowerCase();
  
  let rawScore = 2; // base
  const tips: string[] = [];

  const hasCTATrigger = CTA_TRIGGERS.some(trigger => endingSnippet.includes(trigger) || text.toLowerCase().includes(trigger));
  const endsWithQuestion = endingSnippet.includes('?');

  if (hasCTATrigger && endsWithQuestion) {
    rawScore = 20;
    tips.push('Excellent clear Call to Action ending with an engaging question.');
  } else if (hasCTATrigger) {
    rawScore = 15;
    tips.push('Clear action requested in the conclusion.');
  } else if (endsWithQuestion) {
    rawScore = 14;
    tips.push('Closing question invites conversation and comments.');
  } else if (stats.wordCount > 40) {
    rawScore = 4;
    tips.push('No direct Call-to-Action detected. Ask readers for their take or next step.');
  }

  const finalScore = Math.max(0, Math.min(20, Math.round(rawScore * lqi)));

  let rating: MetricScore['rating'] = 'Needs Improvement';
  if (finalScore >= 16) rating = 'Excellent';
  else if (finalScore >= 12) rating = 'Good';
  else if (finalScore >= 7) rating = 'Average';

  return {
    name: 'Call to Action (CTA)',
    score: finalScore,
    maxScore: 20,
    rating,
    explanation: hasCTATrigger || endsWithQuestion
      ? `Closing invitation detected (Score: ${finalScore}/20).`
      : `Post lacks an explicit closing prompt or question (Score: ${finalScore}/20).`,
    tips: tips.length > 0 ? tips : ['Conclude with a single direct question to invite comments.']
  };
}

/**
 * Evaluates Formatting & Whitespace (0 - 20) continuously
 */
function evaluateFormatting(text: string, stats: TextStats, lqi: number): MetricScore {
  let rawScore = 8;
  const tips: string[] = [];

  const avgWordsPerParagraph = stats.paragraphCount > 0 ? Math.round(stats.wordCount / stats.paragraphCount) : stats.wordCount;

  if (stats.paragraphCount === 1 && stats.wordCount > 50) {
    rawScore -= 5;
    tips.push('Text is currently a single dense block. Add line breaks every 1–3 sentences.');
  } else if (stats.paragraphCount >= 3 && avgWordsPerParagraph <= 40) {
    rawScore += 8;
    tips.push('Great use of whitespace and readable paragraph chunks.');
  } else if (stats.paragraphCount >= 2) {
    rawScore += 4;
  }

  // Lists / bullet points detection
  const hasBullets = /^[•\-\*–—\d+\.]\s/m.test(text);
  if (hasBullets) {
    rawScore += 4;
    tips.push('Bullet points or numbered items make the post easy to skim.');
  }

  const finalScore = Math.max(0, Math.min(20, Math.round(rawScore * Math.max(0.2, lqi))));

  let rating: MetricScore['rating'] = 'Needs Improvement';
  if (finalScore >= 16) rating = 'Excellent';
  else if (finalScore >= 12) rating = 'Good';
  else if (finalScore >= 7) rating = 'Average';

  return {
    name: 'Visual Formatting & Whitespace',
    score: finalScore,
    maxScore: 20,
    rating,
    explanation: `${stats.paragraphCount} paragraph sections with ~${avgWordsPerParagraph} words per section.`,
    tips: tips.length > 0 ? tips : ['Use double line breaks to ensure readability on mobile feeds.']
  };
}

/**
 * Evaluates Hashtags & Visuals (0 - 10) continuously
 */
function evaluateHashtagsAndEmojis(stats: TextStats, lqi: number): MetricScore {
  let rawScore = 3;
  const tips: string[] = [];

  // Hashtags
  if (stats.hashtagCount >= 2 && stats.hashtagCount <= 5) {
    rawScore += 4;
    tips.push('Optimal hashtag count (2–5 tags) for reach without spam.');
  } else if (stats.hashtagCount === 1) {
    rawScore += 2;
  } else if (stats.hashtagCount > 10) {
    rawScore -= 2;
    tips.push('Excessive hashtags (>10) can trigger feed spam filters.');
  }

  // Emojis
  if (stats.emojiCount >= 1 && stats.emojiCount <= 6) {
    rawScore += 3;
    tips.push('Tasteful emoji usage creates visual anchor points.');
  } else if (stats.emojiCount > 10) {
    rawScore -= 1;
    tips.push('Heavy emoji usage may distract from the core value proposition.');
  }

  const finalScore = Math.max(0, Math.min(10, Math.round(rawScore * Math.max(0.1, lqi))));

  let rating: MetricScore['rating'] = 'Needs Improvement';
  if (finalScore >= 8) rating = 'Excellent';
  else if (finalScore >= 6) rating = 'Good';
  else if (finalScore >= 4) rating = 'Average';

  return {
    name: 'Hashtag & Visual Polish',
    score: finalScore,
    maxScore: 10,
    rating,
    explanation: `${stats.hashtagCount} hashtags and ${stats.emojiCount} emojis identified (Score: ${finalScore}/10).`,
    tips
  };
}

/**
 * Evaluates Tone & Sentiment (0 - 10) continuously
 */
function evaluateTone(text: string, stats: TextStats, lqi: number): { metric: MetricScore; detectedTone: string } {
  const lower = text.toLowerCase();
  let rawScore = 4;
  const tips: string[] = [];

  const posCount = POSITIVE_WORDS.filter(w => lower.includes(w)).length;
  const convCount = CONVERSATIONAL_WORDS.filter(w => lower.includes(w)).length;

  if (convCount >= 2) {
    rawScore += 3;
    tips.push('Direct reader address ("you/your") creates strong personal resonance.');
  }

  if (posCount >= 2) {
    rawScore += 3;
    tips.push('Proactive, solution-oriented vocabulary detected.');
  }

  const finalScore = Math.max(0, Math.min(10, Math.round(rawScore * lqi)));

  let detectedTone = 'Informative & Professional';
  if (lqi < 0.35) {
    detectedTone = 'Unintelligible / Noise';
  } else if (stats.questionCount >= 2 && convCount >= 3) {
    detectedTone = 'Conversational & Interactive';
  } else if (lower.includes('stop') || lower.includes('mistake') || lower.includes('unpopular')) {
    detectedTone = 'Bold / Thought-Provoking';
  } else if (posCount >= 3) {
    detectedTone = 'Inspirational & Motivating';
  }

  let rating: MetricScore['rating'] = 'Needs Improvement';
  if (finalScore >= 8) rating = 'Excellent';
  else if (finalScore >= 6) rating = 'Good';
  else if (finalScore >= 4) rating = 'Average';

  return {
    metric: {
      name: 'Tone & Sentiment',
      score: finalScore,
      maxScore: 10,
      rating,
      explanation: `Tone identified as ${detectedTone} (Score: ${finalScore}/10).`,
      tips: tips.length > 0 ? tips : ['Use direct conversational address to maintain reader interest.']
    },
    detectedTone
  };
}

/**
 * Evaluates Platform Compatibility (LinkedIn, X, Instagram)
 */
function evaluatePlatforms(text: string, stats: TextStats, lqi: number): {
  linkedin: PlatformScore;
  x: PlatformScore;
  instagram: PlatformScore;
} {
  const charLen = stats.charCount;

  if (lqi < 0.35) {
    const lowRec = ['Input is unintelligible or contains random characters. Re-enter valid content.'];
    const pScore = Math.max(2, Math.min(25, Math.round(20 * lqi)));
    return {
      linkedin: {
        platform: 'LinkedIn',
        score: pScore,
        characterCount: charLen,
        maxRecommendedCharacters: 1500,
        hardLimit: 3000,
        status: 'Needs Adjustment',
        highlights: [],
        recommendations: lowRec
      },
      x: {
        platform: 'X (Twitter)',
        score: pScore,
        characterCount: charLen,
        maxRecommendedCharacters: 280,
        hardLimit: 280,
        status: 'Needs Adjustment',
        highlights: [],
        recommendations: lowRec
      },
      instagram: {
        platform: 'Instagram',
        score: pScore,
        characterCount: charLen,
        maxRecommendedCharacters: 1000,
        hardLimit: 2200,
        status: 'Needs Adjustment',
        highlights: [],
        recommendations: lowRec
      }
    };
  }

  // 1. LinkedIn
  let liScore = 70;
  const liHighlights: string[] = [];
  const liRecs: string[] = [];

  if (stats.paragraphCount >= 3 && stats.wordCount >= 60 && stats.wordCount <= 300) {
    liScore += 20;
    liHighlights.push('Ideal length and paragraph breakdown for LinkedIn feed algorithm.');
  } else if (stats.wordCount < 40) {
    liScore -= 15;
    liRecs.push('A bit short for LinkedIn. Expand with a story or practical lesson.');
  }
  if (stats.hashtagCount >= 2 && stats.hashtagCount <= 5) {
    liScore += 8;
    liHighlights.push('Hashtags within LinkedIn optimal range (3–5 tags).');
  }

  // 2. X (Twitter)
  let xScore = 75;
  const xHighlights: string[] = [];
  const xRecs: string[] = [];

  if (charLen <= 280) {
    xScore += 20;
    xHighlights.push('Fits perfectly within standard 280-character single tweet limit.');
  } else {
    xScore = Math.max(30, 90 - Math.floor((charLen - 280) / 35));
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
      score: Math.min(100, Math.max(5, Math.round(liScore * lqi))),
      characterCount: charLen,
      maxRecommendedCharacters: 1500,
      hardLimit: 3000,
      status: charLen <= 3000 ? 'Optimal' : 'Too Long',
      highlights: liHighlights,
      recommendations: liRecs
    },
    x: {
      platform: 'X (Twitter)',
      score: Math.min(100, Math.max(5, Math.round(xScore * lqi))),
      characterCount: charLen,
      maxRecommendedCharacters: 280,
      hardLimit: 280,
      status: charLen <= 280 ? 'Optimal' : 'Too Long',
      highlights: xHighlights,
      recommendations: xRecs
    },
    instagram: {
      platform: 'Instagram',
      score: Math.min(100, Math.max(5, Math.round(igScore * lqi))),
      characterCount: charLen,
      maxRecommendedCharacters: 1000,
      hardLimit: 2200,
      status: charLen <= 2200 ? 'Optimal' : 'Too Long',
      highlights: igHighlights,
      recommendations: igRecs
    }
  };
}

const COMMON_STOP_WORDS = new Set([
  'this', 'that', 'with', 'from', 'have', 'were', 'what', 'your', 'about', 'some',
  'stop', 'here', 'will', 'when', 'more', 'their', 'there', 'they', 'them', 'these',
  'those', 'been', 'than', 'then', 'also', 'into', 'only', 'just', 'make', 'most',
  'very', 'even', 'over', 'such', 'take', 'time', 'well', 'where', 'which', 'whose',
  'how', 'each', 'does', 'done', 'doing', 'give', 'gave', 'given', 'know', 'knew',
  'like', 'look', 'come', 'came', 'could', 'should', 'would', 'want', 'said', 'tell',
  'told', 'need', 'using', 'used', 'uses', 'drop', 'below', 'year', 'years', 'post',
  'posts', 'read', 'share', 'save', 'agree', 'short', 'term', 'vanity'
]);

/**
 * Generates Actionable Content Improvement Suggestions
 */
function generateActionableSuggestions(text: string, stats: TextStats, lqi: number): Suggestions {
  if (lqi < 0.35) {
    return {
      hooks: [
        '❓ Question Hook: "What is the biggest lesson your team learned this month?"',
        '📊 Data Hook: "80% of creators overlook this fundamental rule for consistency:"',
        '🔥 Contrarian Hook: "Unpopular opinion: Stop doing complex strategies until you master the basics."'
      ],
      ctas: [
        '💬 "What has been your experience? Drop your thoughts below!"',
        '📌 "Save this framework for your next review session."'
      ],
      formattingTips: ['Write in natural, human-readable language with clear sentences.'],
      recommendedHashtags: ['#ContentStrategy', '#Productivity', '#Growth'],
      toneAdvice: 'Focus on clear, readable human communication.'
    };
  }

  const words = text.match(/\b[A-Za-z]{4,}\b/g) || [];
  const uniqueKeyWords = Array.from(new Set(words.map(w => w.toLowerCase())))
    .filter(w => !COMMON_STOP_WORDS.has(w) && w.length >= 4)
    .slice(0, 5);

  const topicName = uniqueKeyWords[0] ? uniqueKeyWords[0].charAt(0).toUpperCase() + uniqueKeyWords[0].slice(1) : 'Content';
  const subTopic = uniqueKeyWords[1] ? uniqueKeyWords[1].charAt(0).toUpperCase() + uniqueKeyWords[1].slice(1) : 'Growth';

  let suggestedTags = uniqueKeyWords.map(w => `#${w.charAt(0).toUpperCase() + w.slice(1)}`);
  if (suggestedTags.length < 3) {
    suggestedTags = Array.from(new Set([...suggestedTags, '#Growth', '#Productivity', '#Leadership', '#TechTrends']));
  }
  suggestedTags = suggestedTags.slice(0, 5);

  const hooks = [
    `❓ Question Hook: "What is the #1 lesson high performers learn about ${topicName}?"`,
    `📊 Data Hook: "90% of leaders overlook this single rule for ${topicName} and ${subTopic}:"`,
    `🔥 Contrarian Hook: "Unpopular opinion: Stop doing ${topicName} the traditional way. Here is why:"`
  ];

  const ctas = [
    `💬 "What has been your biggest takeaway with ${topicName}? Drop your thoughts below!"`,
    `📌 "Save this post for your next project and share it with someone building today."`,
    `🚀 "Which insight resonates most with your current workflow? Let me know in the comments."`
  ];

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
 * Main Analysis Orchestrator (Continuous Heuristic Engine)
 */
export function analyzeContent(
  rawText: string,
  sourceType: 'pdf' | 'image' | 'text' | 'sample' = 'text'
): AnalysisResult {
  const cleanText = rawText.trim();
  const stats = calculateTextStats(cleanText);
  const { lqi, isGibberish } = calculateLinguisticQuality(cleanText);

  // Evaluate 6 distinct continuous metrics
  const hookMetric = evaluateHook(cleanText, stats, lqi);
  const readabilityMetric = evaluateReadability(stats, lqi);
  const ctaMetric = evaluateCTA(cleanText, stats, lqi);
  const formattingMetric = evaluateFormatting(cleanText, stats, lqi);
  const hashtagsMetric = evaluateHashtagsAndEmojis(stats, lqi);
  const toneResult = evaluateTone(cleanText, stats, lqi);

  // Overall Score is the exact mathematical sum of metrics
  const overallScore = Math.max(
    0,
    Math.min(
      100,
      hookMetric.score +
      readabilityMetric.score +
      ctaMetric.score +
      formattingMetric.score +
      hashtagsMetric.score +
      toneResult.metric.score
    )
  );

  let tier: AnalysisResult['tier'] = 'Needs Major Improvement';
  if (overallScore >= 85) tier = 'High Engagement Potential';
  else if (overallScore >= 70) tier = 'Moderate Potential';
  else if (overallScore >= 50) tier = 'Needs Polish';

  const strengths: string[] = [];
  const improvements: string[] = [];

  [hookMetric, readabilityMetric, ctaMetric, formattingMetric, hashtagsMetric, toneResult.metric].forEach(m => {
    if (m.score >= (m.maxScore * 0.75)) {
      strengths.push(`${m.name}: ${m.tips[0] || m.explanation}`);
    } else {
      improvements.push(`${m.name}: ${m.tips[0] || m.explanation}`);
    }
  });

  const platforms = evaluatePlatforms(cleanText, stats, lqi);
  const suggestions = generateActionableSuggestions(cleanText, stats, lqi);

  const summary = isGibberish
    ? `Low-quality or corrupted text detected (Linguistic Quality: ${Math.round(lqi * 100)}%). Overall engagement score: ${overallScore}/100.`
    : `Content analyzed with an overall engagement score of ${overallScore}/100 based on hook strength, clarity, formatting, and call to action.`;

  return {
    overallScore,
    tier,
    summary,
    aiCritique: isGibberish
      ? `Blunt Assessment: This input contains random or corrupted characters (LQI ${Math.round(lqi * 100)}%) and will produce near-zero engagement.`
      : undefined,
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
    analysisMode: 'heuristic',
    timestamp: new Date().toLocaleTimeString()
  };
}

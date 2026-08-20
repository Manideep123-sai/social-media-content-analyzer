import { AnalysisResult, TextStats } from '../types';
import { calculateTextStats } from './analyzer';

export interface AIRewriteResult {
  improvedHook: string;
  improvedPost: string;
  keyChanges: string[];
}

/**
 * Executes a full, intelligent, blunt social media content analysis using Google Gemini.
 */
export async function analyzeContentWithAI(
  postContent: string,
  apiKey: string,
  sourceType: 'pdf' | 'image' | 'text' | 'sample' = 'text'
): Promise<AnalysisResult> {
  const cleanText = postContent.trim();
  const stats: TextStats = calculateTextStats(cleanText);

  if (!apiKey) {
    throw new Error('Gemini API key is required for AI-powered analysis.');
  }

  const systemInstruction = `You are a world-class, brutally honest social media strategist, virality consultant, and growth director.
Analyze the user's provided post draft or document extract with realistic, unsparing analytical rigor.
Do NOT give generic or sugarcoated feedback. Critique the exact words, hook quality, flaws, and structure in this specific post.
Give realistic, uninflated scores (0-100) and blunt, actionable critiques.

Return ONLY a valid JSON object matching this exact schema:
{
  "overallScore": 76,
  "tier": "Moderate Potential",
  "summary": "2-3 sentences of sharp, executive summary critique of the post.",
  "aiCritique": "A candid, blunt 2-sentence breakdown of the biggest flaw and single highest-leverage improvement.",
  "detectedTone": "Authoritative & Direct",
  "metrics": {
    "hook": {
      "name": "Hook Strength",
      "score": 14,
      "maxScore": 20,
      "rating": "Good",
      "explanation": "Exact critique of the specific opening line in the post.",
      "tips": ["Concrete, tactical fix for this exact hook"]
    },
    "readability": {
      "name": "Readability & Flow",
      "score": 15,
      "maxScore": 20,
      "rating": "Good",
      "explanation": "Specific critique of sentence rhythm, clarity, and jargon.",
      "tips": ["Concrete tip for smoother pacing"]
    },
    "cta": {
      "name": "Call to Action (CTA)",
      "score": 12,
      "maxScore": 20,
      "rating": "Average",
      "explanation": "Honest assessment of whether real users will actually reply, share, or click.",
      "tips": ["How to rephrase the CTA to compel genuine responses"]
    },
    "formatting": {
      "name": "Visual Formatting & Whitespace",
      "score": 16,
      "maxScore": 20,
      "rating": "Good",
      "explanation": "Critique on paragraph spacing, line breaks, and mobile skimmability.",
      "tips": ["Concrete layout adjustment"]
    },
    "hashtags": {
      "name": "Hashtag & Visual Polish",
      "score": 8,
      "maxScore": 10,
      "rating": "Good",
      "explanation": "Critique on hashtag relevance and visual emoji balance.",
      "tips": ["Specific hashtag strategy"]
    },
    "tone": {
      "name": "Tone & Sentiment",
      "score": 8,
      "maxScore": 10,
      "rating": "Good",
      "explanation": "Tone resonance and audience perception.",
      "tips": ["Tone refinement advice"]
    }
  },
  "strengths": [
    "Specific concrete strength 1 from their actual text",
    "Specific concrete strength 2"
  ],
  "improvements": [
    "Specific blunt weakness 1",
    "Specific blunt weakness 2",
    "Specific blunt weakness 3"
  ],
  "suggestions": {
    "hooks": [
      "❓ Question Hook: (Creative provocative question tailored to their exact topic)",
      "📊 Data Hook: (Compelling statistic or contrarian opener for their topic)",
      "🔥 Story/Contrast Hook: (High-stakes curiosity opener for their topic)"
    ],
    "ctas": [
      "💬 (High-converting discussion question tailored to this specific post)",
      "📌 (Save/share value-driver CTA for this topic)",
      "🚀 (Opinion or vote CTA)"
    ],
    "formattingTips": [
      "Specific formatting suggestion 1",
      "Specific formatting suggestion 2"
    ],
    "recommendedHashtags": [
      "#NicheTag1", "#TopicTag2", "#IndustryTag3", "#CommunityTag4", "#GrowthTag5"
    ],
    "toneAdvice": "Targeted advice on conversational tone."
  },
  "platforms": {
    "linkedin": {
      "platform": "LinkedIn",
      "score": 82,
      "status": "Optimal",
      "highlights": ["Specific LinkedIn-oriented strength"],
      "recommendations": ["Specific LinkedIn-oriented fix"]
    },
    "x": {
      "platform": "X (Twitter)",
      "score": 68,
      "status": "Needs Adjustment",
      "highlights": ["Specific Twitter-oriented strength"],
      "recommendations": ["Specific Twitter-oriented fix"]
    },
    "instagram": {
      "platform": "Instagram",
      "score": 74,
      "status": "Good",
      "highlights": ["Specific Instagram-oriented strength"],
      "recommendations": ["Specific Instagram-oriented fix"]
    }
  }
}`;

  const prompt = `Analyze this social media post content:
"""
${cleanText}
"""`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${prompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `API error (${response.status})`;
      if (response.status === 400 || response.status === 403) {
        throw new Error(`Invalid API key or permission error: ${errorMsg}`);
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response from AI model.');
    }

    const parsed = JSON.parse(rawText);

    // Merge character limits into platforms
    const linkedinHardLimit = 3000;
    const xHardLimit = 280;
    const igHardLimit = 2200;

    const result: AnalysisResult = {
      overallScore: Math.round(parsed.overallScore || 70),
      tier: parsed.tier || 'Moderate Potential',
      summary: parsed.summary || 'Content analysis complete.',
      aiCritique: parsed.aiCritique,
      stats,
      metrics: {
        hook: {
          name: 'Hook Strength',
          score: Math.min(20, Math.max(0, parsed.metrics?.hook?.score ?? 12)),
          maxScore: 20,
          rating: parsed.metrics?.hook?.rating || 'Good',
          explanation: parsed.metrics?.hook?.explanation || 'Opening line evaluated.',
          tips: parsed.metrics?.hook?.tips || []
        },
        readability: {
          name: 'Readability & Flow',
          score: Math.min(20, Math.max(0, parsed.metrics?.readability?.score ?? 12)),
          maxScore: 20,
          rating: parsed.metrics?.readability?.rating || 'Good',
          explanation: parsed.metrics?.readability?.explanation || 'Readability evaluated.',
          tips: parsed.metrics?.readability?.tips || []
        },
        cta: {
          name: 'Call to Action (CTA)',
          score: Math.min(20, Math.max(0, parsed.metrics?.cta?.score ?? 12)),
          maxScore: 20,
          rating: parsed.metrics?.cta?.rating || 'Good',
          explanation: parsed.metrics?.cta?.explanation || 'Call to action evaluated.',
          tips: parsed.metrics?.cta?.tips || []
        },
        formatting: {
          name: 'Visual Formatting & Whitespace',
          score: Math.min(20, Math.max(0, parsed.metrics?.formatting?.score ?? 12)),
          maxScore: 20,
          rating: parsed.metrics?.formatting?.rating || 'Good',
          explanation: parsed.metrics?.formatting?.explanation || 'Formatting evaluated.',
          tips: parsed.metrics?.formatting?.tips || []
        },
        hashtags: {
          name: 'Hashtag & Visual Polish',
          score: Math.min(10, Math.max(0, parsed.metrics?.hashtags?.score ?? 7)),
          maxScore: 10,
          rating: parsed.metrics?.hashtags?.rating || 'Good',
          explanation: parsed.metrics?.hashtags?.explanation || 'Hashtags evaluated.',
          tips: parsed.metrics?.hashtags?.tips || []
        },
        tone: {
          name: 'Tone & Sentiment',
          score: Math.min(10, Math.max(0, parsed.metrics?.tone?.score ?? 7)),
          maxScore: 10,
          rating: parsed.metrics?.tone?.rating || 'Good',
          explanation: parsed.metrics?.tone?.explanation || 'Tone evaluated.',
          tips: parsed.metrics?.tone?.tips || []
        }
      },
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      suggestions: {
        hooks: parsed.suggestions?.hooks || [],
        ctas: parsed.suggestions?.ctas || [],
        formattingTips: parsed.suggestions?.formattingTips || [],
        recommendedHashtags: parsed.suggestions?.recommendedHashtags || ['#Growth', '#Strategy'],
        toneAdvice: parsed.suggestions?.toneAdvice || 'Maintain active conversational voice.'
      },
      platforms: {
        linkedin: {
          platform: 'LinkedIn',
          score: parsed.platforms?.linkedin?.score || 75,
          characterCount: stats.charCount,
          maxRecommendedCharacters: 1500,
          hardLimit: linkedinHardLimit,
          status: stats.charCount > linkedinHardLimit ? 'Too Long' : (parsed.platforms?.linkedin?.status || 'Optimal'),
          highlights: parsed.platforms?.linkedin?.highlights || [],
          recommendations: parsed.platforms?.linkedin?.recommendations || []
        },
        x: {
          platform: 'X (Twitter)',
          score: parsed.platforms?.x?.score || 70,
          characterCount: stats.charCount,
          maxRecommendedCharacters: 280,
          hardLimit: xHardLimit,
          status: stats.charCount > xHardLimit ? 'Too Long' : (parsed.platforms?.x?.status || 'Optimal'),
          highlights: parsed.platforms?.x?.highlights || [],
          recommendations: parsed.platforms?.x?.recommendations || []
        },
        instagram: {
          platform: 'Instagram',
          score: parsed.platforms?.instagram?.score || 70,
          characterCount: stats.charCount,
          maxRecommendedCharacters: 1000,
          hardLimit: igHardLimit,
          status: stats.charCount > igHardLimit ? 'Too Long' : (parsed.platforms?.instagram?.status || 'Good'),
          highlights: parsed.platforms?.instagram?.highlights || [],
          recommendations: parsed.platforms?.instagram?.recommendations || []
        }
      },
      detectedTone: parsed.detectedTone || 'Professional',
      sourceType,
      analysisMode: 'ai',
      timestamp: new Date().toLocaleTimeString()
    };

    return result;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
}

/**
 * Generates AI Post Rewrites
 */
export async function requestAIRewrite(
  postContent: string,
  apiKey: string,
  platform: 'general' | 'linkedin' | 'x' | 'instagram' = 'general'
): Promise<AIRewriteResult> {
  if (!apiKey) {
    throw new Error('Gemini API key not provided. Add your key to enable AI rewrites.');
  }

  const systemInstruction = `You are an elite, top-tier copywriter and viral strategist.
Rewrite the provided post to maximize engagement, punchy opening hook, mobile whitespace, and high response rate for ${platform.toUpperCase()}.
Return ONLY a valid JSON object with:
{
  "improvedHook": "A powerful 1-line opening hook",
  "improvedPost": "The complete polished post with formatting and spacing",
  "keyChanges": ["Bullet 1 explaining what was improved", "Bullet 2", "Bullet 3"]
}`;

  const prompt = `Rewrite this draft:
"""
${postContent}
"""`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${prompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error (${response.status})`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error('Empty response from AI service');
    }

    const parsed = JSON.parse(rawText) as AIRewriteResult;
    return parsed;
  } catch (error) {
    console.error('AI Rewrite Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate AI rewrite');
  }
}

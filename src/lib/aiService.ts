/**
 * Optional AI Enhancement Service using Google Gemini REST API.
 * The core heuristic engine works 100% offline without this.
 */

export interface AIRewriteResult {
  improvedHook: string;
  improvedPost: string;
  keyChanges: string[];
}

export async function requestAIRewrite(
  postContent: string,
  apiKey?: string,
  platform: 'general' | 'linkedin' | 'x' | 'instagram' = 'general'
): Promise<AIRewriteResult> {
  const key = apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
  
  if (!key) {
    throw new Error('Gemini API key not provided. Add your key in the header to enable AI rewrites.');
  }

  const systemInstruction = `You are a world-class social media copywriter and growth consultant.
Rewrite the provided post to maximize engagement, clarity, hook strength, and readability for ${platform.toUpperCase()}.
Return ONLY a valid JSON object with the following structure:
{
  "improvedHook": "A compelling 1-line opening hook",
  "improvedPost": "The complete polished post with formatting and spacing",
  "keyChanges": ["Bullet 1 explaining what was improved", "Bullet 2", "Bullet 3"]
}`;

  const prompt = `Here is the draft content to optimize:
"""
${postContent}
"""`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
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

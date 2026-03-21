import Groq from 'groq-sdk';
import { AnalyzeRequest, Nutrients } from '@/types/food';

const FOOD_PROMPT = `Analyze this food and return ONLY valid JSON with no markdown formatting, no code blocks, no explanation:
{
  "name": "<2-5 word food name>",
  "description": "<portion and preparation method, 1-2 sentences>",
  "confidence": "<high|medium|low>",
  "nutrients": {
    "calories": <number in kcal>,
    "protein": <number in grams>,
    "carbs": <number in grams>,
    "fat": <number in grams>,
    "fiber": <number in grams>,
    "sugar": <number in grams>,
    "sodium": <number in milligrams>
  }
}

Rules:
- All nutrient values MUST be numbers (never null, never strings)
- If portion size is unclear, assume a standard single serving
- confidence: "high" = clearly identifiable, "medium" = estimated, "low" = very uncertain
- sodium is in milligrams, all others in grams except calories in kcal
- If no food is detected, return calories: 0 and confidence: "low"`;

export interface GeminiResult {
  name: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  nutrients: Nutrients;
}

function coerceNumber(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

function parseResponse(raw: string): GeminiResult {
  const cleaned = raw.replace(/```(?:json)?\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    name: String(parsed.name || 'Unknown food'),
    description: String(parsed.description || ''),
    confidence: ['high', 'medium', 'low'].includes(parsed.confidence)
      ? parsed.confidence
      : 'medium',
    nutrients: {
      calories: coerceNumber(parsed.nutrients?.calories),
      protein: coerceNumber(parsed.nutrients?.protein),
      carbs: coerceNumber(parsed.nutrients?.carbs),
      fat: coerceNumber(parsed.nutrients?.fat),
      fiber: coerceNumber(parsed.nutrients?.fiber),
      sugar: coerceNumber(parsed.nutrients?.sugar),
      sodium: coerceNumber(parsed.nutrients?.sodium),
    },
  };
}

export async function analyzeFood(request: AnalyzeRequest): Promise<GeminiResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  const groq = new Groq({ apiKey });

  let raw: string;

  if (request.method === 'image' && request.imageBase64 && request.imageMime) {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${request.imageMime};base64,${request.imageBase64}`,
              },
            },
            { type: 'text', text: FOOD_PROMPT },
          ],
        },
      ],
      max_tokens: 512,
    });
    raw = response.choices[0]?.message?.content || '';
  } else {
    const text = request.text || '';
    if (!text.trim()) {
      throw new Error('No food description provided');
    }
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `${FOOD_PROMPT}\n\nFood description: "${text}"`,
        },
      ],
      max_tokens: 512,
    });
    raw = response.choices[0]?.message?.content || '';
  }

  return parseResponse(raw);
}

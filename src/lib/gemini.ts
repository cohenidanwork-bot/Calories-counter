import { GoogleGenerativeAI } from '@google/generative-ai';
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
  // Strip markdown code blocks if present
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('GEMINI_API_KEY is not configured. Add your key to .env.local');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let result;

  if (request.method === 'image' && request.imageBase64 && request.imageMime) {
    result = await model.generateContent([
      {
        inlineData: {
          data: request.imageBase64,
          mimeType: request.imageMime,
        },
      },
      FOOD_PROMPT,
    ]);
  } else {
    const text = request.text || '';
    if (!text.trim()) {
      throw new Error('No food description provided');
    }
    result = await model.generateContent(
      `${FOOD_PROMPT}\n\nFood description: "${text}"`
    );
  }

  const raw = result.response.text();
  return parseResponse(raw);
}

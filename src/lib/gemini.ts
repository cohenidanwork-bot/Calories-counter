import Groq from 'groq-sdk';
import { AnalyzeRequest, Nutrients } from '@/types/food';

const FOOD_PROMPT = `You are a registered dietitian and food scientist. Analyze the described food and return ONLY valid JSON with no markdown, no code blocks, no explanation.

Return this exact structure:
{
  "name": "<2-5 word descriptive food name>",
  "searchName": "<simple generic English food name for USDA database lookup — no quantities, no cooking adjectives unless essential, e.g. 'chicken breast', 'white rice', 'whole milk', 'peanut butter', 'banana'>",
  "amountGrams": <total weight in grams as a number>,
  "description": "<portion size and preparation in 1-2 sentences>",
  "confidence": "<high|medium|low>",
  "nutrients": {
    "calories": <kcal — use net-carb Atwater: protein×4 + (total_carbs−fiber)×4 + fat×9>,
    "protein": <grams>,
    "carbs": <total carbohydrates in grams, INCLUDING fiber and sugar>,
    "fat": <total fat in grams>,
    "fiber": <dietary fiber in grams>,
    "sugar": <total sugars in grams>,
    "sodium": <milligrams>
  }
}

Critical rules — follow exactly:
1. All values MUST be non-negative numbers (never null, never strings, never negative).
2. calories = protein×4 + (carbs−fiber)×4 + fat×9  (fiber provides ~0 kcal/g per FDA).
3. sugar must be ≤ carbs. fiber must be ≤ carbs.
4. amountGrams: convert any unit to grams using standard weights:
   1 large egg ≈ 50g | 1 cup cooked rice ≈ 185g | 1 cup raw leafy greens ≈ 30g
   1 tbsp ≈ 15g | 1 tsp ≈ 5g | 1 oz ≈ 28g | 1 medium apple ≈ 182g
   1 slice bread ≈ 30g | 1 cup milk ≈ 244g | 1 cup cooked pasta ≈ 140g
   1 medium banana ≈ 118g | 1 chicken breast ≈ 174g | 1 cup cooked oats ≈ 234g
5. searchName: single food item, generic US English, no brand names, no quantities.
   Examples: "chicken breast" NOT "2 grilled chicken breasts with herbs"
             "white rice cooked" NOT "steamed jasmine rice"
             "orange juice" NOT "fresh squeezed OJ"
6. confidence: "high"=clearly identified single food, "medium"=mixed dish or estimated portion, "low"=unclear or multi-ingredient recipe.
7. If no food is detected, return all nutrients as 0 and confidence "low".
8. Reference values for accuracy:
   - Raw chicken breast (100g): ~165 kcal, 31g protein, 0g carbs, 3.6g fat
   - Cooked white rice (100g): ~130 kcal, 2.7g protein, 28g carbs, 0.3g fat, 0.4g fiber
   - Whole egg (50g): ~72 kcal, 6g protein, 0.4g carbs, 5g fat
   - Banana medium (118g): ~105 kcal, 1.3g protein, 27g carbs, 0.3g fat, 3.1g fiber
   - White bread slice (30g): ~79 kcal, 2.7g protein, 15g carbs, 1g fat, 0.6g fiber`;

export interface GeminiResult {
  name: string;
  searchName: string;
  amountGrams: number;
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
    searchName: String(parsed.searchName || parsed.name || 'Unknown food'),
    amountGrams: coerceNumber(parsed.amountGrams) || 100,
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

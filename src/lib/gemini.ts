import Groq from 'groq-sdk';
import { AnalyzeRequest, Nutrients } from '@/types/food';

// ─── Prompts ──────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a precise nutrition analyst with deep knowledge of food science and the USDA nutrition database. Your job is to estimate the nutritional content of any food described by the user.

Always respond with ONLY valid JSON — no markdown, no code blocks, no explanation.`;

const buildUserPrompt = (foodDescription: string) => `Analyze this food and return its nutritional data:

"${foodDescription}"

Return this exact JSON structure:
{
  "name": "<concise name, 2-5 words>",
  "amountGrams": <total weight in grams as a number>,
  "description": "<1 sentence: what it is and the serving size>",
  "confidence": "<high|medium|low>",
  "nutrients": {
    "calories": <kcal as a number>,
    "protein": <grams>,
    "carbs": <total carbohydrates in grams, includes fiber and sugar>,
    "fat": <total fat in grams>,
    "fiber": <dietary fiber in grams>,
    "sugar": <total sugars in grams>,
    "sodium": <milligrams>
  }
}

Rules you must follow:
1. All values must be non-negative numbers. Never use null or strings.
2. Calorie formula: calories = (protein × 4) + ((carbs − fiber) × 4) + (fat × 9)
3. sugar must be ≤ carbs. fiber must be ≤ carbs.
4. amountGrams — the TOTAL weight of the food as described:
   • 1 large egg = 50g  →  2 large eggs = 100g  →  3 large eggs = 150g
   • 1 cup cooked rice = 185g | 1 cup cooked pasta = 140g | 1 cup cooked oats = 234g
   • 1 cup milk = 244g | 1 tbsp = 15g | 1 tsp = 5g | 1 oz = 28g
   • 1 medium apple = 182g | 1 medium banana = 118g | 1 medium potato = 150g
   • 1 chicken breast = 174g | 1 slice bread = 30g | 1 serving = 100g (if unclear)
5. For egg dishes (omelet, scrambled, fried): unless oil/butter amount is stated,
   add only 5g of cooking fat. Never count eggs as 100g each — 1 large egg = 50g.
6. confidence: "high" = simple food clearly described, "medium" = mixed dish or estimated,
   "low" = very unclear or multiple items with unknown quantities
7. If no food detected, return all nutrients as 0 and confidence "low".

Reference values — use THESE EXACT numbers as your baseline:
 1 large egg (50g):           72 kcal |  6.3g protein |  0.4g carbs |  4.8g fat |  0g fiber |  71mg sodium
 2 large eggs (100g):        143 kcal | 12.6g protein |  0.7g carbs |  9.5g fat |  0g fiber | 142mg sodium
 2-egg plain omelet (~105g): 180 kcal | 13g protein   |  1g carbs   | 13g fat   |  0g fiber | 160mg sodium
 100g cooked chicken breast: 165 kcal | 31g protein   |  0g carbs   |  3.6g fat |  0g fiber |  74mg sodium
 100g cooked white rice:     130 kcal |  2.7g protein | 28g carbs   |  0.3g fat | 0.4g fiber |  1mg sodium
 1 cup whole milk (244g):    149 kcal |  8g protein   | 11.7g carbs |  8g fat   |  0g fiber | 105mg sodium
 1 medium banana (118g):     105 kcal |  1.3g protein | 27g carbs   |  0.4g fat | 3.1g fiber |  1mg sodium
 1 slice white bread (30g):   79 kcal |  2.7g protein | 15g carbs   |  1g fat   | 0.6g fiber | 147mg sodium
 1 tbsp olive oil (14g):     119 kcal |  0g protein   |  0g carbs   | 13.5g fat |  0g fiber |   0mg sodium
 100g cheddar cheese:        403 kcal | 25g protein   |  1.3g carbs | 33g fat   |  0g fiber | 621mg sodium`;

const IMAGE_PROMPT = `Analyze the food shown in this image and return its nutritional data.

Return this exact JSON structure:
{
  "name": "<concise name, 2-5 words>",
  "amountGrams": <total weight in grams as a number>,
  "description": "<1 sentence: what it is and the estimated serving size>",
  "confidence": "<high|medium|low>",
  "nutrients": {
    "calories": <kcal as a number>,
    "protein": <grams>,
    "carbs": <total carbohydrates in grams, includes fiber and sugar>,
    "fat": <total fat in grams>,
    "fiber": <dietary fiber in grams>,
    "sugar": <total sugars in grams>,
    "sodium": <milligrams>
  }
}

Rules:
1. All values must be non-negative numbers. Never use null or strings.
2. Calorie formula: calories = (protein × 4) + ((carbs − fiber) × 4) + (fat × 9)
3. Estimate portion size from visual cues (plate size, utensils, context).
4. If the image does not show food, return all nutrients as 0 and confidence "low".`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiResult {
  name: string;
  amountGrams: number;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  nutrients: Nutrients;
  searchName: string; // kept for backwards compatibility, same as name
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function coerceNumber(val: unknown): number {
  const n = Number(val);
  return isNaN(n) || n < 0 ? 0 : n;
}

function parseResponse(raw: string): GeminiResult {
  const cleaned = raw.replace(/```(?:json)?\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);

  const protein = coerceNumber(parsed.nutrients?.protein);
  const carbs   = coerceNumber(parsed.nutrients?.carbs);
  const fat     = coerceNumber(parsed.nutrients?.fat);
  const fiber   = Math.min(coerceNumber(parsed.nutrients?.fiber), carbs);
  const sugar   = Math.min(coerceNumber(parsed.nutrients?.sugar), carbs);
  // Always recompute calories from macros to ensure formula consistency
  const calories = Math.round(protein * 4 + Math.max(0, carbs - fiber) * 4 + fat * 9);

  const name = String(parsed.name || 'Unknown food');

  return {
    name,
    searchName: name,
    amountGrams: coerceNumber(parsed.amountGrams) || 100,
    description: String(parsed.description || ''),
    confidence: ['high', 'medium', 'low'].includes(parsed.confidence)
      ? parsed.confidence
      : 'medium',
    nutrients: { calories, protein, carbs, fat, fiber, sugar, sodium: coerceNumber(parsed.nutrients?.sodium) },
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function analyzeFood(request: AnalyzeRequest): Promise<GeminiResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured.');

  const groq = new Groq({ apiKey });
  let raw: string;

  if (request.method === 'image' && request.imageBase64 && request.imageMime) {
    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${request.imageMime};base64,${request.imageBase64}` } },
            { type: 'text', text: IMAGE_PROMPT },
          ],
        },
      ],
      max_tokens: 512,
    });
    raw = response.choices[0]?.message?.content || '';
  } else {
    const text = request.text?.trim() || '';
    if (!text) throw new Error('No food description provided');

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: buildUserPrompt(text) },
      ],
      max_tokens: 512,
      temperature: 0.1, // low temperature = more consistent, factual responses
    });
    raw = response.choices[0]?.message?.content || '';
  }

  return parseResponse(raw);
}

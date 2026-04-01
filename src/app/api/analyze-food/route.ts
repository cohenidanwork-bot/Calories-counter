import { NextRequest, NextResponse } from 'next/server';
import { analyzeFood } from '@/lib/gemini';
import { lookupNutrients } from '@/lib/nutrition-db';
import { AnalyzeRequest, AnalyzeResponse, Nutrients } from '@/types/food';

/**
 * Returns false when a DB result looks implausible compared to what the AI
 * estimated — a sign the lookup matched the wrong food in the database.
 *
 * Catches cases like:
 *  - egg white (0.2g fat) returned instead of whole-egg dish (AI: 10g fat)
 *  - trace-calorie food returned instead of a real meal
 *  - massively over-dense food (e.g. coconut oil) returned for a light dish
 */
function isDbPlausible(db: Nutrients, ai: Nutrients): boolean {
  // DB fat < 1g but AI estimated meaningful fat → wrong food (e.g. egg white for omelet)
  if (ai.fat > 3 && db.fat < 1) return false;
  // DB calories less than 40% of AI estimate → completely wrong food
  if (ai.calories > 50 && db.calories < ai.calories * 0.4) return false;
  // DB calories more than 3× AI estimate → wrong food (e.g. cooking oil for a light dish)
  if (ai.calories > 50 && db.calories > ai.calories * 3) return false;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = (await req.json()) as AnalyzeRequest;

    if (!body.method || !['image', 'text', 'voice'].includes(body.method)) {
      return NextResponse.json(
        { success: false, error: 'Invalid method. Use image, text, or voice.' },
        { status: 400 }
      );
    }

    if (body.method === 'image' && (!body.imageBase64 || !body.imageMime)) {
      return NextResponse.json(
        { success: false, error: 'imageBase64 and imageMime required for image method.' },
        { status: 400 }
      );
    }

    if ((body.method === 'text' || body.method === 'voice') && !body.text?.trim()) {
      return NextResponse.json(
        { success: false, error: 'text field required for text/voice method.' },
        { status: 400 }
      );
    }

    const result = await analyzeFood(body);

    // Try database lookup to ground the AI's nutrient estimates
    const dbResult = await lookupNutrients(result.searchName, result.amountGrams);

    // Only use the DB result if it looks plausible relative to what the AI estimated.
    // If the DB matched the wrong food (e.g. egg white instead of a whole-egg dish),
    // fall back to the AI's own estimates which are more contextually aware.
    const useDb = dbResult != null && isDbPlausible(dbResult.nutrients, result.nutrients);

    return NextResponse.json({
      success: true,
      entry: {
        name: result.name,
        description: result.description,
        inputMethod: body.method,
        nutrients: useDb ? dbResult!.nutrients : result.nutrients,
        confidence: result.confidence,
        source: useDb ? 'database' : 'ai',
        amountGrams: result.amountGrams,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[analyze-food]', message);

    const isQuotaError = message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('too many requests');

    return NextResponse.json(
      { success: false, error: message },
      { status: isQuotaError ? 429 : 500 }
    );
  }
}

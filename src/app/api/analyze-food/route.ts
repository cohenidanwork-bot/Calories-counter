import { NextRequest, NextResponse } from 'next/server';
import { analyzeFood } from '@/lib/gemini';
import { AnalyzeRequest, AnalyzeResponse } from '@/types/food';

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

    return NextResponse.json({
      success: true,
      entry: {
        name: result.name,
        description: result.description,
        inputMethod: body.method,
        nutrients: result.nutrients,
        confidence: result.confidence,
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

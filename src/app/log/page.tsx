'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyzeRequest, AnalyzeResponse } from '@/types/food';
import { useFoodLog } from '@/hooks/useFoodLog';
import { LoggingTabs } from '@/components/logging/LoggingTabs';
import { TextInput } from '@/components/logging/TextInput';
import { ImageUploader } from '@/components/logging/ImageUploader';
import { VoiceRecorder } from '@/components/logging/VoiceRecorder';
import { NutrientPreview } from '@/components/logging/NutrientPreview';
import { PageHeader } from '@/components/layout/PageHeader';

export default function LogPage() {
  const router = useRouter();
  const { addEntry } = useFoodLog();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const analyze = async (req: AnalyzeRequest) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
    } catch {
      setResult({ success: false, error: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (result?.success && result.entry) {
      addEntry(result.entry);
      router.push('/');
    }
  };

  const handleReset = () => setResult(null);

  return (
    <main className="max-w-md mx-auto px-4 pt-6 pb-24">
      <PageHeader title="Log Food" subtitle="What did you eat?" backHref="/" />

      {result ? (
        <NutrientPreview result={result} onConfirm={handleConfirm} onReset={handleReset} />
      ) : (
        <LoggingTabs>
          {(tab) => (
            <>
              {tab === 'text' && (
                <TextInput
                  loading={loading}
                  onSubmit={(text) => analyze({ method: 'text', text })}
                />
              )}
              {tab === 'image' && (
                <ImageUploader
                  loading={loading}
                  onSubmit={(imageBase64, imageMime) =>
                    analyze({ method: 'image', imageBase64, imageMime })
                  }
                />
              )}
              {tab === 'voice' && (
                <VoiceRecorder
                  loading={loading}
                  onSubmit={(text) => analyze({ method: 'voice', text })}
                />
              )}
            </>
          )}
        </LoggingTabs>
      )}
    </main>
  );
}

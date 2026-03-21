'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface TextInputProps {
  onSubmit: (text: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  '2 scrambled eggs with toast',
  'Grilled chicken breast 150g with rice',
  'Large banana',
  'Caesar salad with croutons',
];

export function TextInput({ onSubmit, loading }: TextInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) onSubmit(text.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe what you ate... e.g. 'bowl of oatmeal with blueberries and honey'"
        rows={4}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none bg-gray-50"
        disabled={loading}
      />
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setText(ex)}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
      <Button type="submit" loading={loading} disabled={!text.trim()} className="w-full">
        Analyze Food
      </Button>
    </form>
  );
}

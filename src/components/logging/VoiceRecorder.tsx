'use client';

import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { Button } from '@/components/ui/Button';

interface VoiceRecorderProps {
  onSubmit: (text: string) => void;
  loading: boolean;
}

export function VoiceRecorder({ onSubmit, loading }: VoiceRecorderProps) {
  const { isListening, transcript, error, startListening, stopListening, resetTranscript, isSupported } = useVoiceRecording();

  if (!isSupported) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <p className="text-sm text-gray-500 font-medium">Voice not supported</p>
        <p className="text-xs text-gray-400 mt-1">Use Chrome or Safari for voice input</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mic button */}
      <div className="relative">
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
        )}
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={loading}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isListening
              ? 'bg-red-500 text-white scale-110'
              : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
          } disabled:opacity-50`}
        >
          {isListening ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        {isListening ? 'Listening... tap to stop' : 'Tap to start speaking'}
      </p>

      {/* Transcript display */}
      {transcript && (
        <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-400 mb-1">Transcript:</p>
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {transcript && !isListening && (
        <div className="flex gap-2 w-full">
          <Button
            variant="secondary"
            onClick={resetTranscript}
            className="flex-1"
            disabled={loading}
          >
            Clear
          </Button>
          <Button
            onClick={() => onSubmit(transcript)}
            loading={loading}
            className="flex-1"
          >
            Analyze
          </Button>
        </div>
      )}
    </div>
  );
}

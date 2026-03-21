'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ImageUploaderProps {
  onSubmit: (base64: string, mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif') => void;
  loading: boolean;
}

const MAX_SIZE_MB = 5;

export function ImageUploader({ onSubmit, loading }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingData, setPendingData] = useState<{ base64: string; mime: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' } | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }
    const mime = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setPreview(dataUrl);
      setPendingData({ base64, mime });
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const handleReset = () => {
    setPreview(null);
    setPendingData(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragOver ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-gray-500 mb-4">Take a photo or upload an image</p>
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.removeAttribute('capture');
                  inputRef.current.click();
                }
              }}
            >
              Upload Image
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.setAttribute('capture', 'environment');
                  inputRef.current.click();
                }
              }}
            >
              Take Photo
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Food preview" className="w-full max-h-64 object-cover" />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Button
            loading={loading}
            onClick={() => pendingData && onSubmit(pendingData.base64, pendingData.mime)}
            className="w-full"
          >
            Analyze Photo
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

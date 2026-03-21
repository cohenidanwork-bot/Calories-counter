'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, { title: string; detail: string }> = {
  Configuration: {
    title: 'Missing environment variables',
    detail:
      'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_SECRET must be set in your deployment environment.',
  },
  AccessDenied: {
    title: 'Access denied',
    detail: 'You declined the Google sign-in request. Please try again.',
  },
  OAuthSignin: {
    title: 'Google sign-in failed',
    detail: 'Could not start the Google sign-in flow. Check that GOOGLE_CLIENT_ID is correct and the redirect URI is added in Google Cloud Console.',
  },
  OAuthCallback: {
    title: 'Google callback error',
    detail: 'Google returned an error. Make sure the redirect URI https://<your-domain>/api/auth/callback/google is added in Google Cloud Console.',
  },
  Default: {
    title: 'Authentication error',
    detail: 'Something went wrong during sign-in. Please try again.',
  },
};

function AuthErrorContent() {
  const params = useSearchParams();
  const code = params.get('error') ?? 'Default';
  const info = ERROR_MESSAGES[code] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{info.title}</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 space-y-4">
          <p className="text-sm text-gray-600">{info.detail}</p>

          {code === 'Configuration' && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Required env vars</p>
              {[
                'NEXTAUTH_SECRET',
                'NEXTAUTH_URL',
                'GOOGLE_CLIENT_ID',
                'GOOGLE_CLIENT_SECRET',
              ].map((v) => (
                <code key={v} className="block text-xs bg-gray-100 rounded-lg px-3 py-1.5 text-gray-700 font-mono">
                  {v}
                </code>
              ))}
            </div>
          )}

          {(code === 'OAuthSignin' || code === 'OAuthCallback') && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Redirect URI to add in Google Cloud</p>
              <code className="block text-xs bg-gray-100 rounded-lg px-3 py-1.5 text-gray-700 font-mono break-all">
                https://your-domain.com/api/auth/callback/google
              </code>
            </div>
          )}

          <p className="text-xs text-gray-400">Error code: <span className="font-mono">{code}</span></p>
        </div>

        <Link href="/" className="block w-full py-3 rounded-2xl bg-green-500 text-white text-sm font-medium text-center hover:bg-green-600 transition-colors">
          Back to app
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}

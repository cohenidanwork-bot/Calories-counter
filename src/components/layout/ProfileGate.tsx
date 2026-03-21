'use client';

import { signIn } from 'next-auth/react';
import { useUser } from '@/context/UserContext';

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { userId, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <svg className="animate-spin w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (!userId) {
    return <SignInScreen />;
  }

  return <>{children}</>;
}

function SignInScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
            <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Calories Counter</h1>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            AI-powered nutrition tracking.<br />Log meals, set goals, save recipes.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="space-y-3 mb-8">
          {[
            { emoji: '🤖', text: 'AI analysis from text, photo or voice' },
            { emoji: '📊', text: 'Track calories, protein, carbs & fat' },
            { emoji: '📅', text: 'Browse your history day by day' },
            { emoji: '🍳', text: 'Save your personal recipes' },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
              <span className="text-xl">{emoji}</span>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>

        {/* Sign in button */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all font-medium text-gray-700 text-sm"
        >
          {/* Google logo */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-xs text-gray-300 mt-6">
          Your data is stored locally on this device
        </p>
        <p className="text-center text-xs text-gray-300 mt-1">
          If you see a server error, add{' '}
          <span className="font-mono">GOOGLE_CLIENT_ID</span>,{' '}
          <span className="font-mono">GOOGLE_CLIENT_SECRET</span> &amp;{' '}
          <span className="font-mono">NEXTAUTH_SECRET</span>{' '}
          to your environment variables.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { getInitials } from '@/lib/users';
import { AVATAR_COLORS } from '@/types/user';

export function ProfileGate({ children }: { children: React.ReactNode }) {
  const { user, allUsers, login, register } = useUser();

  if (user) return <>{children}</>;

  return <ProfileSelectScreen users={allUsers} onLogin={login} onRegister={register} />;
}

interface ProfileSelectScreenProps {
  users: ReturnType<typeof import('@/lib/users').getAllUsers>;
  onLogin: (id: string) => void;
  onRegister: (name: string) => void;
}

function ProfileSelectScreen({ users, onLogin, onRegister }: ProfileSelectScreenProps) {
  const [mode, setMode] = useState<'select' | 'create'>(users.length === 0 ? 'create' : 'select');
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState(users.length % AVATAR_COLORS.length);

  const handleCreate = () => {
    if (!name.trim()) return;
    onRegister(name.trim());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Calories Counter</h1>
          <p className="text-sm text-gray-400 mt-1">
            {mode === 'select' ? 'Choose your profile' : 'Create your profile'}
          </p>
        </div>

        {mode === 'select' && users.length > 0 ? (
          <div className="space-y-3">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => onLogin(u.id)}
                className="w-full flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: u.color }}
                >
                  {getInitials(u.name)}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">Tap to continue</p>
                </div>
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}

            <button
              onClick={() => setMode('create')}
              className="w-full flex items-center gap-4 border-2 border-dashed border-gray-200 rounded-2xl px-4 py-3 hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">Add new profile</p>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 transition-colors"
                style={{ backgroundColor: AVATAR_COLORS[colorIndex] }}
              >
                {name ? getInitials(name) : '?'}
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {AVATAR_COLORS.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setColorIndex(i)}
                    className={`w-6 h-6 rounded-full transition-transform ${colorIndex === i ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Your name</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="w-full py-3 rounded-xl bg-green-500 text-white font-medium text-sm hover:bg-green-600 transition-colors disabled:opacity-40"
            >
              Get started
            </button>

            {users.length > 0 && (
              <button onClick={() => setMode('select')} className="w-full text-sm text-gray-400 hover:text-gray-600">
                Back to profiles
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

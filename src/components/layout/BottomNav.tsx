'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { useUser } from '@/context/UserContext';
import { getInitials } from '@/lib/users';

const NAV_LINKS = [
  {
    href: '/',
    label: 'Today',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/log',
    label: 'Log Food',
    icon: (_active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/recipes',
    label: 'Recipes',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Goals',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function ProfileSwitcherSheet({ onClose }: { onClose: () => void }) {
  const { user, allUsers, login, logout, register } = useUser();
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    register(newName.trim());
    setCreatingNew(false);
    setNewName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Switch Profile</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
          {allUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => { login(u.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                u.id === user?.id ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: u.color }}>
                {getInitials(u.name)}
              </div>
              <span className="flex-1 text-left text-sm font-medium text-gray-900">{u.name}</span>
              {u.id === user?.id && (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-2">
          {creatingNew ? (
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New profile name"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <button onClick={handleCreate} disabled={!newName.trim()} className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-40">Add</button>
              <button onClick={() => setCreatingNew(false)} className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-500">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setCreatingNew(true)} className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors">
              + Add new profile
            </button>
          )}
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [showSwitcher, setShowSwitcher] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-md mx-auto flex items-center">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors',
                  active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {link.icon(active)}
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            );
          })}

          {/* User avatar / profile switcher */}
          <button
            onClick={() => setShowSwitcher(true)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5"
          >
            {user ? (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: user.color }}
              >
                {getInitials(user.name)}
              </div>
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            <span className="text-xs font-medium text-gray-400">Profile</span>
          </button>
        </div>
      </nav>

      {showSwitcher && <ProfileSwitcherSheet onClose={() => setShowSwitcher(false)} />}
    </>
  );
}

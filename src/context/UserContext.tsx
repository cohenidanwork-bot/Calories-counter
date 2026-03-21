'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface UserContextValue {
  userId: string | null;
  userName: string | null;
  userImage: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const value: UserContextValue = {
    userId: session?.user?.id ?? null,
    userName: session?.user?.name ?? null,
    userImage: session?.user?.image ?? null,
    isLoading: status === 'loading',
    logout: () => signOut({ callbackUrl: '/' }),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

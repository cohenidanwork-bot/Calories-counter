'use client';

import { createContext, useContext, ReactNode } from 'react';

const LOCAL_USER_ID = 'local';

interface UserContextValue {
  userId: string;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  return (
    <UserContext.Provider value={{ userId: LOCAL_USER_ID, isLoading: false }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}

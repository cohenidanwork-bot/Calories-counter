'use client';

import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '@/context/UserContext';
import { ProfileGate } from '@/components/layout/ProfileGate';
import { BottomNav } from '@/components/layout/BottomNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserProvider>
        <ProfileGate>
          {children}
          <BottomNav />
        </ProfileGate>
      </UserProvider>
    </SessionProvider>
  );
}

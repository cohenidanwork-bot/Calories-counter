'use client';

import { UserProvider } from '@/context/UserContext';
import { ProfileGate } from '@/components/layout/ProfileGate';
import { BottomNav } from '@/components/layout/BottomNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ProfileGate>
        {children}
        <BottomNav />
      </ProfileGate>
    </UserProvider>
  );
}

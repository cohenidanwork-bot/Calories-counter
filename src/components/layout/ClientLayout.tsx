'use client';

import { UserProvider } from '@/context/UserContext';
import { BottomNav } from '@/components/layout/BottomNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      {children}
      <BottomNav />
    </UserProvider>
  );
}

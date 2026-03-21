import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'Calories Counter',
  description: 'AI-powered calorie and nutrition tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}

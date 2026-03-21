import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    '[NextAuth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables.'
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: clientId && clientSecret
    ? [
        GoogleProvider({
          clientId,
          clientSecret,
        }),
      ]
    : [],
  callbacks: {
    jwt({ token, account }) {
      if (account?.providerAccountId) {
        token.userId = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.userId) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/auth-error',
  },
};

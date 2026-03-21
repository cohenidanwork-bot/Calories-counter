import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt({ token, account }) {
      // Persist the Google account's providerAccountId (stable sub/ID) in the JWT
      if (account?.providerAccountId) {
        token.userId = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      // Expose userId on the session so client components can read it
      if (session.user && token.userId) {
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};

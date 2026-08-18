import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      id: "unified",
      name: "Unified",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const emailStr = (credentials.email as string).trim().toLowerCase();
        const passStr = credentials.password as string;

        // 1. Check if user is in Admin table first
        const admin = await prisma.admin.findUnique({
          where: { email: emailStr },
        });

        if (admin) {
          const validAdmin = await bcrypt.compare(passStr, admin.passwordHash);
          if (validAdmin) {
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role || "admin",
            };
          }
        }

        // 2. Check if user is in Customer table
        const customer = await prisma.customer.findUnique({
          where: { email: emailStr },
        });

        if (customer) {
          const validCustomer = await bcrypt.compare(passStr, customer.passwordHash);
          if (validCustomer) {
            return {
              id: customer.id,
              email: customer.email,
              name: customer.name,
              role: "customer",
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role =
          token.role as string;
        (session.user as { role?: string; id?: string }).id =
          token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/compte/connexion",
  },
  session: { strategy: "jwt" },
});

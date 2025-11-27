import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig, // Inherit edge-safe config
    adapter: PrismaAdapter(db),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await db.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) {
                    return null;
                }

                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) {
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        // Re-declare callbacks here to ensure they run with full context if needed
        // or to perform DB lookups that can't happen on Edge.
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            // Logic from your original file:
            if (user) {
                token.id = user.id as string;
                return token;
            }

            // We can use 'db' here because this file runs on Node.js
            const dbUser = await db.user.findUnique({
                where: { email: token.email! },
            });

            if (!dbUser) {
                return token;
            }

            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            };
        },
    },
});
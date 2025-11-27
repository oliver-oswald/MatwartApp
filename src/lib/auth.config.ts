import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    // We list providers here as an empty array to satisfy the interface.
    // We will populate them in auth.ts
    providers: [],
    callbacks: {
        // This 'authorized' callback is used by Middleware to protect routes
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            const isOnBrowsePage = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/browse");
            const isOnLoginPage = nextUrl.pathname.startsWith("/login");

            if (isOnBrowsePage) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isOnLoginPage) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/", nextUrl));
                }
                return true;
            }
            return true;
        },
        // Simple JWT callback for edge compatibility (DB lookups happen in auth.ts)
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAdmin = auth?.user?.role === "ADMIN";

            const isOnBrowsePage = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/browse");
            const isOnAdminPage = nextUrl.pathname.startsWith("/admin");
            const isOnLoginPage = nextUrl.pathname.startsWith("/login");

            if (isOnAdminPage) {
                if (!isLoggedIn) return false;
                if (!isAdmin) return Response.redirect(new URL("/", nextUrl));
                return true;
            }

            if (isOnBrowsePage) {
                return isLoggedIn;
            } else if (isOnLoginPage) {
                if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
                return true;
            }
            return true;
        },
        async jwt({ token }) {
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "ADMIN" | "USER";
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
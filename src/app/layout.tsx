import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar"
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Matwart App",
    template: "%s | Matwart App",
  },
  description: "Buche Zelte, Kochgeschirr und Ausrüstung für dein nächstes Lager einfach online.",
  openGraph: {
    title: "Matwart App",
    description: "Buche Zelte, Kochgeschirr und Ausrüstung einfach online.",
    url: "/",
    siteName: "Matwart App",
    locale: "de_CH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Matwart App",
    description: "Buche Zelte, Kochgeschirr und Ausrüstung einfach online.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className="bg-earth-50 text-earth-900 antialiased h-screen overflow-hidden">
    <Providers>
    <div className="flex flex-col h-screen bg-earth-50 font-sans">
        <Navbar />
        <main className="flex-1 overflow-hidden relative">
            {children}
        </main>
    </div>
    </Providers>
    </body>
    </html>
  );
}

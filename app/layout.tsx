// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bingio",
  description: "Your emotionally intelligent movie assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        {/* Header (visual only) */}
        <header className="app-header" role="banner">
          <div className="header-inner">
            <div className="header-logo">
              <div className="logo-wrap">
                <Image src="/logo.png" alt="Bingio" width={40} height={40} />
              </div>
              <div className="header-title">
                <div className="title">Chat with Bingio</div>
                <div className="subtitle">Your mood-tuned movie companion</div>
              </div>
            </div>

            <div className="header-controls" role="toolbar" aria-label="Header actions">
              <button className="btn" title="New chat">+ New</button>
              {/* theme toggle button remains — if you had an id / script it still works */}
              <button id="theme-toggle" aria-label="Toggle theme" className="btn">Theme</button>
            </div>
          </div>
        </header>

        {/* prevents content from hiding behind fixed header */}
        <div className="header-spacer" />

        <main id="app-root">
          {children}
        </main>

        {/* Composer / input + footer are handled by your page (we kept spacing) */}
        <div className="app-footer" aria-hidden>
          © {new Date().getFullYear()} Granth &amp; Nikita &nbsp; <span style={{opacity:0.85}}>Terms of Use · Powered by Ringel.AI</span>
        </div>

        {/* theme toggle script you added earlier will still run (unchanged) */}
      </body>
    </html>
  );
}

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
        {/* Preconnect fonts for performance */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>

      {/* 
        We set the body class with font variables. The actual dark-mode class
        is toggled on the root <html> element by the inline script below.
      */}
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        {/* Inline small header — minimal and brand-focused */}
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
          <div
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.02), transparent)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow" style={{ background: "linear-gradient(180deg,var(--accent),var(--primary))" }}>
                {/* replace /logo.png if you use another path */}
                <Image src="/logo.png" alt="Bingio" width={40} height={40} className="object-cover" />
              </div>

              <div className="leading-tight">
                <div className="text-sm font-semibold">Chat with Bingio</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Your mood-tuned movie companion</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* New chat / other buttons can be added here if desired */}
              <button
                id="theme-toggle"
                aria-label="Toggle dark mode"
                className="inline-flex items-center justify-center p-2 rounded-md border"
                style={{
                  borderColor: "var(--input)",
                  background: "transparent",
                }}
                title="Toggle theme"
              >
                {/* The icon will be swapped by the script based on theme. */}
                <svg id="theme-toggle-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* subtle divider */}
          <div style={{ height: 1, background: "var(--border)", opacity: 0.6 }} />
        </div>

        {/* important: add a top spacer so page content does not hide below the fixed header */}
        <div style={{ height: 72 }} />

        {/* main app children */}
        <div id="app-root">{children}</div>

        {/* bottom spacer if needed (keeps footer visible) */}
        <div style={{ height: 8 }} />

        {/* Inline script to set initial theme and hook the toggle button.
            - Reads localStorage.theme (values "light"|"dark") or falls back to prefers-color-scheme.
            - Adds/removes the `dark` class on <html>.
            - Stores the user's selection when toggled.
            This script is intentionally small and dependency-free.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var root = document.documentElement;
    var toggleBtn = document.getElementById('theme-toggle');
    var icon = document.getElementById('theme-toggle-icon');

    function applyTheme(theme) {
      if (theme === 'dark') {
        root.classList.add('dark');
        if (icon) icon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>';
      } else {
        root.classList.remove('dark');
        if (icon) icon.innerHTML = '<path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
      }
    }

    // initial theme resolution: localStorage -> prefers-color-scheme -> default light
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch(e) { stored = null; }
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var initial = stored === 'dark' || (stored === null && prefersDark) ? 'dark' : 'light';
    applyTheme(initial);

    // attach toggler
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        try {
          var isDark = document.documentElement.classList.toggle('dark');
          try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(e) {}
          applyTheme(isDark ? 'dark' : 'light');
        } catch (e) { console.error(e); }
      });
    }
  } catch (err) {
    console.error('Theme toggle script error', err);
  }
})();
`,
          }}
        />

      </body>
    </html>
  );
}

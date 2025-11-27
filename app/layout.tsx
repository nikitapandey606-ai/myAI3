import "./globals.css";

export const metadata = {
  title: "Bingio",
  description: "Emotion-aware movie & series recommendation assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="root">
          {children}
        </div>
      </body>
    </html>
  );
}

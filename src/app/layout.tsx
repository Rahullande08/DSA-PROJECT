import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recursion Studio: ASCII Edition — Watch Recursion Unfold",
  description: "A high-density, cinematic developer laboratory engineered for deep mental models and complex algorithmic recursion visualization.",
  keywords: ["recursion", "algorithm visualizer", "call stack", "ascii sweep", "computer science", "data structures", "interactive learning"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
      </head>
      <body className="min-h-screen bg-canvas text-text-primary selection:bg-accent-blue selection:text-canvas font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#08090B",
        panel: "#0D1015",
        container: "#11151B",
        "container-high": "#191F28",
        border: "#252B34",
        "border-focus": "#6B8CFF",
        "accent-blue": "#6B8CFF",
        "accent-purple": "#8B5CF6",
        "accent-mint": "#77E2B8",
        "accent-amber": "#E9BC72",
        "accent-coral": "#F87171",
        "text-primary": "#F4F6FA",
        "text-secondary": "#A1A9B6",
        "text-muted": "#707987",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "glow-blue": "0 0 20px -3px rgba(107, 140, 255, 0.35)",
        "glow-purple": "0 0 20px -3px rgba(139, 92, 246, 0.35)",
        "glow-mint": "0 0 20px -3px rgba(119, 226, 184, 0.35)",
        "glow-amber": "0 0 20px -3px rgba(233, 188, 114, 0.35)",
        "glow-coral": "0 0 20px -3px rgba(248, 113, 113, 0.35)",
      },
      animation: {
        "sweep-pulse": "sweepPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "frame-enter": "frameEnter 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.2s ease-out forwards",
      },
      keyframes: {
        sweepPulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(0.98)" },
        },
        frameEnter: {
          "0%": { opacity: "0", transform: "translateY(-8px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

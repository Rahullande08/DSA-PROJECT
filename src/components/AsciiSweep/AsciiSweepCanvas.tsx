"use client";

import React, { useEffect, useRef, useCallback } from "react";

export interface AsciiSweepOptions {
  angle?: number;             // Sweep angle in degrees (default: 45)
  duration?: number;          // Duration in ms (default: 850)
  band?: number;              // Wavefront band width in character cells (default: 16)
  softness?: number;          // Edge softness (0 to 1, default: 0.4)
  turbulence?: number;        // Jitter & character offset (0 to 1, default: 0.15)
  trail?: number;             // Character phosphor persistence trail (default: 0.6)
  scale?: number;             // Character font size in px (default: 13)
  spacing?: number;           // Cell grid spacing in px (default: 14)
  charset?: "ascii" | "matrix" | "binary" | "math" | "hex" | string;
  glyphs?: string;            // Custom glyph pool string
  color?: string;             // Base accent color (default: "#3B82F6")
  tint?: string;              // Leading edge highlight color (default: "#93C5FD")
  glow?: boolean | number;    // Phosphor glow intensity (default: true)
  aberration?: boolean | number; // Chromatic aberration (default: true)
  flicker?: boolean | number; // Character glyph flicker frequency (default: 0.2)
  density?: number;           // Character fill density (0 to 1, default: 0.95)
  displace?: number;          // Wave normal displacement (default: 4)
  contrast?: number;          // Contrast multiplier (default: 1.2)
  brightness?: number;        // Brightness multiplier (default: 1.1)
  invert?: boolean;           // Invert wave propagation direction
  threshold?: number;         // Alpha cutoff threshold (default: 0.05)
  fade?: boolean;             // Fade edge envelope (default: true)
  blend?: GlobalCompositeOperation; // Composite blend mode (default: "source-over")
  background?: string;        // Optional background clear color
  directional?: boolean;      // Reverse sweep direction on backward index change
}

export interface AsciiSweepCanvasProps extends AsciiSweepOptions {
  isActive: boolean;
  onComplete?: () => void;
  direction?: "forward" | "reverse";
  colorMode?: "blue" | "purple" | "mint" | "amber" | "coral";
  durationMs?: number;        // Legacy alias for duration
  className?: string;
}

const CHARSETS: Record<string, string> = {
  ascii: "01<>[]{}/*+=#~-|_\\!?:;%@$0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  matrix: "0123456789:・=*+-<>¦|çﾘｸzn{}[]",
  binary: "01010110 01101001 01100010 01101111",
  math: "∑∏√∫≈≠≤≥∂∇∈∉⊂⊃∪∩∧∨¬⇒⇔∀∃∄F(n)=F(n-1)+F(n-2)",
  hex: "0123456789ABCDEF0x7ffd000xdeadbeef",
};

const COLOR_MODES: Record<string, { base: string; tint: string; glow: string }> = {
  blue: { base: "rgba(59, 130, 246, ", tint: "rgba(147, 197, 253, ", glow: "rgba(96, 165, 250, 0.4)" },
  purple: { base: "rgba(168, 85, 247, ", tint: "rgba(216, 180, 254, ", glow: "rgba(192, 132, 252, 0.4)" },
  mint: { base: "rgba(16, 185, 129, ", tint: "rgba(167, 243, 208, ", glow: "rgba(52, 211, 153, 0.4)" },
  amber: { base: "rgba(245, 158, 11, ", tint: "rgba(253, 230, 138, ", glow: "rgba(251, 191, 36, 0.4)" },
  coral: { base: "rgba(239, 68, 68, ", tint: "rgba(254, 202, 202, ", glow: "rgba(248, 113, 113, 0.4)" },
};

export const AsciiSweepCanvas: React.FC<AsciiSweepCanvasProps> = ({
  isActive,
  onComplete,
  direction = "forward",
  colorMode = "blue",
  angle = 45,
  duration,
  durationMs,
  band = 16,
  softness = 0.4,
  turbulence = 0.15,
  trail = 0.55,
  scale = 13,
  spacing = 14,
  charset = "ascii",
  glyphs,
  color,
  tint,
  glow = true,
  aberration = true,
  flicker = 0.2,
  density = 0.95,
  displace = 3,
  contrast = 1.2,
  brightness = 1.1,
  invert = false,
  blend = "source-over",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const actualDuration = duration || durationMs || 850;
  const flickerVal = typeof flicker === "number" ? flicker : flicker ? 0.2 : 0;
  const turbulenceVal = typeof turbulence === "number" ? turbulence : turbulence ? 0.15 : 0;

  // Select active glyph set
  const glyphPool = glyphs || (typeof charset === "string" && CHARSETS[charset] ? CHARSETS[charset] : CHARSETS.ascii);

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!isActive) return;

    if (prefersReducedMotion) {
      const t = setTimeout(() => {
        if (onCompleteRef.current) onCompleteRef.current();
      }, 50);
      return () => clearTimeout(t);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Handle high DPI display
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const clientWidth = Math.max(parent.clientWidth || 800, 300);
    const clientHeight = Math.max(parent.clientHeight || 400, 200);

    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;
    canvas.style.width = `${clientWidth}px`;
    canvas.style.height = `${clientHeight}px`;

    ctx.scale(dpr, dpr);

    const charSize = spacing || 14;
    const cols = Math.ceil(clientWidth / charSize) + 2;
    const rows = Math.ceil(clientHeight / charSize) + 2;

    // Prepopulate character matrix
    const grid: string[][] = [];
    const flickerOffsets: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      const flickRow: number[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(glyphPool[Math.floor(Math.random() * glyphPool.length)]);
        flickRow.push(Math.random());
      }
      grid.push(row);
      flickRow.push(Math.random());
      flickerOffsets.push(flickRow);
    }

    // Color definitions
    const palette = COLOR_MODES[colorMode] || COLOR_MODES.blue;
    const baseColorPrefix = color ? `rgba(${hexToRgb(color)}, ` : palette.base;
    const tintColorPrefix = tint ? `rgba(${hexToRgb(tint)}, ` : palette.tint;

    let startTime: number | null = null;
    const isReverse = direction === "reverse" || invert;

    // Calculate diagonal geometry
    const rad = ((isReverse ? angle + 180 : angle) * Math.PI) / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    // Bounding projection length across grid
    const totalProj = Math.abs(cols * cosA) + Math.abs(rows * sinA) + band * 2;
    const startProj = -band;

    const render = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / actualDuration, 1);

      ctx.clearRect(0, 0, clientWidth, clientHeight);
      ctx.globalCompositeOperation = blend;

      // Current wave front position in projection units
      const currentPos = isReverse
        ? totalProj - progress * (totalProj - startProj)
        : startProj + progress * (totalProj - startProj);

      ctx.font = `bold ${scale}px "JetBrains Mono", Consolas, monospace`;
      ctx.textBaseline = "top";

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Projection of cell (c, r) onto wave angle normal
          const proj = c * cosA + r * sinA;
          const dist = isReverse ? currentPos - proj : proj - currentPos;

          // Inside the sweeping wave band
          if (dist >= -band && dist <= band * 1.5) {
            // Intensity distribution with softness envelope
            let intensity = 0;
            if (dist < 0) {
              // Leading edge (sharp ascent)
              intensity = Math.pow(1 + dist / band, 1 - softness * 0.5);
            } else {
              // Trailing edge (decay trail)
              intensity = Math.pow(Math.max(0, 1 - dist / (band * (1 + trail))), 1 + (1 - softness));
            }

            if (intensity <= 0.02) continue;

            // Density cull
            if (Math.random() > density && intensity < 0.8) continue;

            // Turbulence / Jitter offset
            let renderX = c * charSize;
            let renderY = r * charSize;

            if (turbulenceVal > 0) {
              const turbJitter = (Math.sin(r * 3.7 + c * 2.1 + elapsed * 0.015) * displace * turbulenceVal);
              renderX += turbJitter * sinA;
              renderY -= turbJitter * cosA;
            }

            // Glyph flicker
            let char = grid[r][c];
            if (flickerVal > 0 && Math.random() < flickerVal * 0.3) {
              char = glyphPool[Math.floor(Math.random() * glyphPool.length)];
              grid[r][c] = char;
            }

            // Alpha calculation with contrast & brightness boost
            const alpha = Math.min(Math.max(0, intensity * brightness * contrast), 1);

            // Chromatic aberration on high-intensity leading edge
            const isLeadingEdge = Math.abs(dist) < 2.5 && aberration;

            if (isLeadingEdge) {
              // Red-Cyan RGB chromatic split
              ctx.fillStyle = `rgba(244, 114, 182, ${alpha * 0.6})`;
              ctx.fillText(char, renderX - 1.5, renderY);

              ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.6})`;
              ctx.fillText(char, renderX + 1.5, renderY);

              // Bright white leading peak
              ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(alpha * 1.3, 1)})`;
              ctx.fillText(char, renderX, renderY);
            } else {
              // Base phosphor color
              const isPeak = intensity > 0.7;
              ctx.fillStyle = isPeak
                ? `${tintColorPrefix}${alpha})`
                : `${baseColorPrefix}${alpha * 0.85})`;

              if (glow && isPeak) {
                ctx.shadowColor = palette.glow;
                ctx.shadowBlur = 6;
              } else {
                ctx.shadowBlur = 0;
              }

              ctx.fillText(char, renderX, renderY);
            }
          }
        }
      }

      ctx.shadowBlur = 0;

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, clientWidth, clientHeight);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    isActive,
    direction,
    colorMode,
    angle,
    actualDuration,
    band,
    softness,
    turbulence,
    trail,
    scale,
    spacing,
    glyphPool,
    color,
    tint,
    glow,
    aberration,
    flicker,
    density,
    displace,
    contrast,
    brightness,
    invert,
    blend,
    prefersReducedMotion,
  ]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none z-40 transition-opacity duration-300 ${className}`}
    />
  );
};

// Helper to convert hex to rgb string for alpha concatenation
function hexToRgb(hex: string): string {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return "59, 130, 246";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

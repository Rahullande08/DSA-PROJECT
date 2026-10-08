"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { AsciiSweepCanvas, AsciiSweepOptions } from "./AsciiSweepCanvas";

export interface AsciiSweepProps extends AsciiSweepOptions {
  children: React.ReactNode;
  index?: number;
  alternate?: boolean;
  directional?: boolean;
  className?: string;
  onSweepComplete?: () => void;
  colorMode?: "blue" | "purple" | "mint" | "amber" | "coral";
}

export const AsciiSweep: React.FC<AsciiSweepProps> = ({
  children,
  index = 0,
  alternate = false,
  directional = true,
  duration = 850,
  colorMode = "blue",
  className = "",
  onSweepComplete,
  ...options
}) => {
  const childArray = useMemo(() => React.Children.toArray(children), [children]);
  const [displayedIndex, setDisplayedIndex] = useState<number>(index);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  
  const prevIndexRef = useRef<number>(index);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isFirstMount = useRef<boolean>(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setDisplayedIndex(index);
      prevIndexRef.current = index;
      return;
    }

    if (index !== prevIndexRef.current) {
      const isReverse = directional ? index < prevIndexRef.current : false;
      setDirection(isReverse ? "reverse" : "forward");
      prevIndexRef.current = index;

      setIsSweeping(true);

      // Swap content at mid-point (45% of duration) so new content is revealed behind character wave
      const swapTimer = setTimeout(() => {
        setDisplayedIndex(index);
      }, duration * 0.42);

      return () => clearTimeout(swapTimer);
    }
  }, [index, directional, duration]);

  const handleSweepComplete = () => {
    setIsSweeping(false);
    if (onSweepComplete) {
      onSweepComplete();
    }
  };

  const activeChild = childArray[displayedIndex] || childArray[0] || null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
    >
      {/* Active Panel Content */}
      <div className="w-full h-full">
        {activeChild}
      </div>

      {/* Sweeping ASCII Character Grid Overlay */}
      <AsciiSweepCanvas
        isActive={isSweeping}
        onComplete={handleSweepComplete}
        direction={direction}
        duration={duration}
        colorMode={colorMode}
        {...options}
      />
    </div>
  );
};

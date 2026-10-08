"use client";

import React, { useEffect } from "react";
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Zap, 
  Flag 
} from "lucide-react";

interface ControlTransportProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  onStepChange: (index: number) => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  branchingLabel?: string;
}

export const ControlTransport: React.FC<ControlTransportProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  speed,
  onStepChange,
  onPlayToggle,
  onSpeedChange,
  onReset,
  branchingLabel,
}) => {
  // Keyboard Shortcuts (Arrow keys & Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "SELECT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        onPlayToggle();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (currentStepIndex < totalSteps - 1) {
          onStepChange(currentStepIndex + 1);
        }
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (currentStepIndex > 0) {
          onStepChange(currentStepIndex - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStepIndex, totalSteps, onPlayToggle, onStepChange]);

  return (
    <div className="rounded-lg border border-border bg-panel p-3 shadow-lg flex flex-wrap items-center justify-between gap-4">
      {/* Playback Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Reset */}
        <button
          onClick={onReset}
          title="Reset to start (Step 0)"
          className="p-2 rounded bg-container border border-border hover:border-accent-blue text-text-secondary hover:text-text-primary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Step Prev */}
        <button
          onClick={() => onStepChange(Math.max(currentStepIndex - 1, 0))}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-container border border-border hover:border-accent-blue text-text-primary text-xs font-mono disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        {/* Play / Pause Sweep */}
        <button
          onClick={onPlayToggle}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-mono text-xs font-semibold tracking-wide transition-all ${
            isPlaying
              ? "bg-accent-amber text-canvas shadow-glow-amber"
              : "bg-accent-blue text-canvas shadow-glow-blue hover:bg-accent-blue/90"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Sweep</span>
            </>
          )}
        </button>

        {/* Step Next */}
        <button
          onClick={() => onStepChange(Math.min(currentStepIndex + 1, totalSteps - 1))}
          disabled={currentStepIndex >= totalSteps - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-container border border-border hover:border-accent-blue text-text-primary text-xs font-mono disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Jump to Base Case */}
        <button
          onClick={() => onStepChange(Math.floor(totalSteps / 2))}
          title="Jump to Base Case"
          className="p-2 rounded bg-container border border-border hover:border-accent-coral text-accent-coral transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
        </button>

        {/* Jump to Final End */}
        <button
          onClick={() => onStepChange(totalSteps - 1)}
          title="Jump to Final Unwind"
          className="p-2 rounded bg-container border border-border hover:border-accent-mint text-accent-mint transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Step Scrubber & Indicator */}
      <div className="flex-1 min-w-[200px] flex items-center gap-3">
        <span className="text-xs font-mono text-text-muted whitespace-nowrap">
          Step <strong className="text-text-primary font-bold">{currentStepIndex + 1}</strong> of {totalSteps}
        </span>

        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={currentStepIndex}
          onChange={(e) => onStepChange(Number(e.target.value))}
          className="flex-1 accent-accent-blue cursor-pointer h-1.5 bg-container rounded appearance-none border border-border"
        />
      </div>

      {/* Branching Info & Speed Controls */}
      <div className="flex items-center gap-3">
        {branchingLabel && (
          <span className="text-[11px] font-mono text-text-muted hidden md:inline truncate max-w-[220px]">
            {branchingLabel}
          </span>
        )}

        {/* Speed Toggles */}
        <div className="flex items-center bg-container border border-border rounded p-0.5">
          <span className="px-2 text-[10px] font-mono text-text-muted uppercase font-bold">
            SPEED:
          </span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                speed === s
                  ? "bg-accent-blue text-canvas font-bold"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

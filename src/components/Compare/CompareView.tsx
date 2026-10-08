"use client";

import React, { useState, useEffect } from "react";
import { GitCompare, Play, Pause, RotateCcw, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import { fibonacciDef, fibonacciMemoDef } from "../../lib/algorithms";

export const CompareView: React.FC = () => {
  const [n, setN] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const naiveSteps = fibonacciDef.generateSteps({ n });
  const memoSteps = fibonacciMemoDef.generateSteps({ n });
  const maxSteps = Math.max(naiveSteps.length, memoSteps.length);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= maxSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, [isPlaying, maxSteps]);

  const currNaive = naiveSteps[Math.min(stepIndex, naiveSteps.length - 1)];
  const currMemo = memoSteps[Math.min(stepIndex, memoSteps.length - 1)];

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-container border border-border text-xs font-mono text-accent-purple mb-2">
            <GitCompare className="w-3.5 h-3.5" />
            <span>ALGORITHMIC EFFICIENCY BENCHMARK</span>
          </div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Naive Recursion vs. Memoization
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Observe the exponential explosion of naive Fibonacci vs. the instant $O(1)$ cache hits of top-down DP.
          </p>
        </div>

        {/* Input Stepper & Play Transport */}
        <div className="flex items-center gap-3 bg-panel p-2 rounded-lg border border-border">
          <div className="flex items-center gap-2 bg-container px-3 py-1.5 rounded border border-border font-mono text-xs">
            <span className="text-text-muted font-bold">n =</span>
            {[3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setN(val);
                  setStepIndex(0);
                  setIsPlaying(false);
                }}
                className={`px-2 py-0.5 rounded ${
                  n === val
                    ? "bg-accent-blue text-canvas font-bold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-accent-blue hover:bg-accent-blue/90 text-canvas font-mono text-xs font-bold shadow-glow-blue transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause" : "Race Simulation"}</span>
          </button>

          <button
            onClick={() => {
              setStepIndex(0);
              setIsPlaying(false);
            }}
            className="p-2 rounded bg-container border border-border text-text-muted hover:text-text-primary"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Naive Fibonacci O(2^n) */}
        <div className="p-5 rounded-xl border border-border bg-panel flex flex-col justify-between space-y-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-coral" />
                <h3 className="font-mono text-sm font-bold text-text-primary">
                  Naive Fibonacci : O(2^n)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-accent-coral/15 text-accent-coral border border-accent-coral/30">
                EXPONENTIAL EXPLOSION
              </span>
            </div>

            <p className="text-xs text-text-secondary mt-2">
              Repeats identical subproblems without remembering past answers.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 my-3 text-[11px] font-mono">
              <div className="p-2 rounded bg-container border border-border">
                <div className="text-text-muted text-[9px]">TOTAL CALLS</div>
                <div className="text-accent-coral font-bold text-base">
                  {currNaive.totalCalls}
                </div>
              </div>
              <div className="p-2 rounded bg-container border border-border">
                <div className="text-text-muted text-[9px]">STACK DEPTH</div>
                <div className="text-text-primary font-bold text-base">
                  {currNaive.currentStackDepth}
                </div>
              </div>
              <div className="p-2 rounded bg-container border border-border">
                <div className="text-text-muted text-[9px]">CACHE HITS</div>
                <div className="text-text-muted font-bold text-base">0 (None)</div>
              </div>
            </div>

            {/* Current Step Description */}
            <div className="p-3 rounded bg-canvas border border-border text-xs font-mono text-text-secondary min-h-[60px]">
              {currNaive.description}
            </div>
          </div>

          <div className="p-3 rounded bg-container border border-border/80 text-[11px] font-mono text-accent-coral">
            Redundant calculation of identical branches causes exponential slowdown.
          </div>
        </div>

        {/* Right: Memoized Fibonacci O(n) */}
        <div className="p-5 rounded-xl border border-accent-mint/40 bg-panel flex flex-col justify-between space-y-4 shadow-glow-mint">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-mint animate-pulse" />
                <h3 className="font-mono text-sm font-bold text-text-primary">
                  Memoized Fibonacci : O(n)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-accent-mint/15 text-accent-mint border border-accent-mint/30">
                DYNAMIC PROGRAMMING
              </span>
            </div>

            <p className="text-xs text-text-secondary mt-2">
              Stores previously computed values in an isolated hash table.
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 my-3 text-[11px] font-mono">
              <div className="p-2 rounded bg-container border border-border">
                <div className="text-text-muted text-[9px]">TOTAL CALLS</div>
                <div className="text-accent-mint font-bold text-base">
                  {currMemo.totalCalls}
                </div>
              </div>
              <div className="p-2 rounded bg-container border border-border">
                <div className="text-text-muted text-[9px]">STACK DEPTH</div>
                <div className="text-text-primary font-bold text-base">
                  {currMemo.currentStackDepth}
                </div>
              </div>
              <div className="p-2 rounded bg-container border border-border">
                <div className="text-text-muted text-[9px]">MEMO TABLE</div>
                <div className="text-accent-mint font-bold text-xs truncate">
                  {currMemo.customData?.memoTable
                    ? Object.keys(currMemo.customData.memoTable).length + " entries"
                    : "Empty"}
                </div>
              </div>
            </div>

            {/* Current Step Description */}
            <div className="p-3 rounded bg-canvas border border-border text-xs font-mono text-text-secondary min-h-[60px]">
              {currMemo.description}
            </div>
          </div>

          <div className="p-3 rounded bg-container border border-accent-mint/30 text-[11px] font-mono text-accent-mint flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Subtree branches pruned via instant O(1) cache lookups.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

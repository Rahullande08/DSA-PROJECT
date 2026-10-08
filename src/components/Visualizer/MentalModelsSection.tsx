"use client";

import React from "react";
import { Sparkles, StopCircle, Layers, ArrowUpRight } from "lucide-react";

export const MentalModelsSection: React.FC = () => {
  return (
    <div className="rounded-lg border border-border bg-panel p-5 shadow-lg mt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-accent-blue" />
        <h3 className="font-mono text-sm font-semibold text-text-primary tracking-tight">
          Deep Mental Models: Recursion Under the Hood
        </h3>
      </div>

      {/* 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Model 01 */}
        <div className="p-4 rounded-lg bg-container border border-border/80 flex flex-col justify-between hover:border-accent-coral/60 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-accent-coral">
                01
              </span>
              <h4 className="font-mono text-xs font-semibold text-text-primary">
                The Base Case
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              The stop condition that terminates the infinite recursion loop. Without it, call frames accumulate until memory exhaustion, triggering a{" "}
              <code className="text-accent-coral font-mono text-[11px] bg-accent-coral/10 px-1 py-0.5 rounded">
                RecursionError: maximum recursion depth exceeded
              </code>
              .
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-accent-coral">
            <span>Stop Condition</span>
            <span>Invariant</span>
          </div>
        </div>

        {/* Model 02 */}
        <div className="p-4 rounded-lg bg-container border border-border/80 flex flex-col justify-between hover:border-accent-amber/60 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-accent-amber">
                02
              </span>
              <h4 className="font-mono text-xs font-semibold text-text-primary">
                The Call Stack
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Each function invocation allocates an isolated activation frame containing its local parameters <code className="text-accent-amber font-mono text-[11px]">(n)</code>, register state, and return instruction address. The caller pauses suspended while the child executes.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-accent-amber">
            <span>LIFO Stacking</span>
            <span>Suspension</span>
          </div>
        </div>

        {/* Model 03 */}
        <div className="p-4 rounded-lg bg-container border border-border/80 flex flex-col justify-between hover:border-accent-mint/60 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-accent-mint">
                03
              </span>
              <h4 className="font-mono text-xs font-semibold text-text-primary">
                Stack Unwinding
              </h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Once the base case yields a concrete value, frames pop off in reverse LIFO order. Each suspended caller resolves its pending operation and propagates its newly synthesized result back up to its ancestor.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-accent-mint">
            <span>Upward Return</span>
            <span>Synthesis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

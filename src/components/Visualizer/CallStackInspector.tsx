"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  HelpCircle,
  ArrowDown,
  Activity,
  Clock,
  CheckCircle2,
  CornerDownRight,
  Code2,
  Cpu,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ExecutionStep, StackFrame } from "../../types/recursion";

interface CallStackInspectorProps {
  currentStep: ExecutionStep;
}

export const CallStackInspector: React.FC<CallStackInspectorProps> = ({
  currentStep,
}) => {
  const frames = currentStep.frames;
  // LIFO: top of the stack is the last pushed frame (frames[frames.length - 1])
  const displayFrames = [...frames].reverse();

  // Selected frame for deep inspection (persists across inspection without mutating execution)
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to top frame strictly within internal container
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [currentStep.stepIndex, frames.length]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* 1. LIFO Call Stack Container */}
      <div className="rounded-lg border border-border bg-panel overflow-hidden flex flex-col flex-1 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-container border-b border-border">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-accent-blue" />
            <span className="font-mono text-xs font-semibold text-text-primary tracking-tight">
              Live Stack Inspector <span className="text-text-muted font-normal">(LIFO Call Stack)</span>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-panel border border-border">
              <span className="text-text-muted">STACK DEPTH:</span>
              <span className="text-accent-blue font-bold">
                {currentStep.currentStackDepth} / {currentStep.maxDepthReached || currentStep.currentStackDepth}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-accent-blue/10 border border-accent-blue/30 text-[10px] text-accent-blue font-bold uppercase">
              TOP: ACTIVE
            </span>
          </div>
        </div>

        {/* Stack Frames List */}
        <div
          ref={scrollContainerRef}
          style={{ overflowAnchor: "none", contain: "paint layout" }}
          className="p-3 flex-1 overflow-y-auto space-y-2.5 bg-canvas/40 min-h-[220px]"
        >
          {displayFrames.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-text-muted">
              <Layers className="w-10 h-10 stroke-1 mb-2.5 opacity-30 text-accent-blue" />
              <p className="text-xs font-mono font-semibold text-text-secondary">
                Call Stack is Clean / Empty
              </p>
              <p className="text-[11px] text-text-muted mt-1 max-w-xs">
                All activation records have returned and unwound, or execution is at start/reset.
              </p>
            </div>
          ) : (
            displayFrames.map((frame, index) => {
              const isTop = index === 0;
              const isBase = frame.state === "base";
              const isWaiting = frame.state === "waiting";
              const isReturning = frame.state === "returning";
              const isSelected = selectedFrameId === frame.id;

              return (
                <div
                  key={frame.id}
                  onClick={() =>
                    setSelectedFrameId(isSelected ? null : frame.id)
                  }
                  className={`relative p-3 rounded-md border transition-all duration-200 cursor-pointer ${
                    isTop
                      ? "border-accent-blue bg-container shadow-glow-blue ring-1 ring-accent-blue/40"
                      : isWaiting
                      ? "border-dashed border-accent-amber/60 bg-panel/90 hover:border-accent-amber"
                      : isReturning || isBase
                      ? "border-accent-mint bg-container/90 shadow-glow-mint"
                      : "border-border bg-panel hover:border-text-muted"
                  }`}
                >
                  {/* Left accent bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l ${
                      isTop
                        ? "bg-accent-blue"
                        : isWaiting
                        ? "bg-accent-amber"
                        : isReturning || isBase
                        ? "bg-accent-mint"
                        : "bg-border"
                    }`}
                  />

                  {/* Frame Top Row: Function signature, Call ID, State Badge */}
                  <div className="flex items-center justify-between gap-2 pl-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-text-primary">
                        {frame.callLabel || `${frame.funcName}(${Object.entries(frame.args || {}).map(([k, v]) => `${k}=${v}`).join(", ")})`}
                      </span>

                      {frame.callId && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-panel border border-border text-text-muted">
                          {frame.callId}
                        </span>
                      )}
                    </div>

                    {/* Frame State Badge */}
                    <div className="flex items-center gap-1.5">
                      {isTop && !isBase && !isReturning && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-accent-blue/15 text-accent-blue border border-accent-blue/40">
                          <Activity className="w-2.5 h-2.5 animate-pulse" />
                          ACTIVE
                        </span>
                      )}
                      {isWaiting && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-accent-amber/15 text-accent-amber border border-accent-amber/40">
                          <Clock className="w-2.5 h-2.5" />
                          WAITING
                        </span>
                      )}
                      {isBase && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-accent-coral/15 text-accent-coral border border-accent-coral/40">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          BASE CASE
                        </span>
                      )}
                      {isReturning && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-accent-mint/15 text-accent-mint border border-accent-mint/40">
                          <ArrowDown className="w-2.5 h-2.5" />
                          RETURNING
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-text-muted/70 hidden sm:inline">
                        {frame.memoryAddr}
                      </span>
                    </div>
                  </div>

                  {/* Frame Middle Row: Executing Source Line & Local Variables */}
                  <div className="mt-2 pl-1.5 space-y-1 text-[11px] font-mono">
                    {frame.lineSnippet && (
                      <div className="flex items-center gap-1.5 text-text-secondary bg-panel/60 px-2 py-1 rounded border border-border/50">
                        <Code2 className="w-3 h-3 text-accent-blue shrink-0" />
                        <span className="text-text-muted shrink-0">
                          Line {frame.currentLine || 1}:
                        </span>
                        <span className="text-text-primary font-semibold truncate">
                          {frame.lineSnippet}
                        </span>
                      </div>
                    )}

                    {/* Local Variables */}
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        <Cpu className="w-3 h-3 text-accent-mint shrink-0" />
                        <span className="text-[10px] uppercase font-bold text-text-muted">
                          Locals:
                        </span>
                        <span className="text-text-primary font-medium">
                          {Object.entries(frame.locals || frame.args || {})
                            .map(([k, v]) => `${k} = ${v}`)
                            .join(", ") || "None"}
                        </span>
                      </div>

                      {frame.callerLabel && (
                        <span className="text-[10px] text-text-muted truncate hidden md:inline">
                          Caller: {frame.callerLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pending operation / Return state info */}
                  {frame.pendingOp && (
                    <div className="mt-1.5 pl-1.5 text-[11px] font-mono text-text-secondary flex items-center justify-between border-t border-border/40 pt-1">
                      <span className="text-text-muted text-[10px] uppercase font-bold">
                        Pending Op:
                      </span>
                      <span className="text-accent-amber font-medium">
                        {frame.pendingOp}
                      </span>
                    </div>
                  )}

                  {frame.returnValue !== undefined && (
                    <div className="mt-1 pl-1.5 text-[11px] font-mono text-accent-mint flex items-center justify-between border-t border-border/40 pt-1">
                      <span className="text-[10px] uppercase font-bold">
                        Return Value:
                      </span>
                      <span className="font-bold px-1.5 py-0.2 rounded bg-accent-mint/15 border border-accent-mint/30">
                        {String(frame.returnValue)}
                      </span>
                    </div>
                  )}

                  {/* Expanded Frame Deep Inspector */}
                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-border/80 pl-1.5 text-[10px] font-mono space-y-1.5 bg-canvas/60 p-2.5 rounded">
                      <div className="flex items-center justify-between text-accent-blue font-bold">
                        <span>ACTIVATION RECORD DETAIL</span>
                        <span>DEPTH #{frame.depth}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-text-muted">
                        <div>
                          <strong>Frame ID:</strong> {frame.callId || frame.id}
                        </div>
                        <div>
                          <strong>Function:</strong> {frame.funcName}
                        </div>
                        <div>
                          <strong>Memory Addr:</strong> {frame.memoryAddr}
                        </div>
                        <div>
                          <strong>Caller:</strong> {frame.callerLabel || "Root"}
                        </div>
                        <div className="col-span-2">
                          <strong>State:</strong>{" "}
                          <span className="text-text-primary uppercase font-bold">
                            {frame.state}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Stack Footer Telemetry */}
        <div className="px-3 py-2 bg-container border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5 text-accent-mint">
            <ArrowDown className="w-3 h-3" />
            <span>Top of stack executes first (LIFO order)</span>
          </div>
          <span>
            Active Frames:{" "}
            <strong className="text-text-primary">
              {frames.length}
            </strong>
          </span>
        </div>
      </div>

      {/* 2. "What is happening right now?" Live Explainer Card */}
      <div className="rounded-lg border border-border bg-panel p-3.5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent-blue" />
            <h4 className="font-mono text-xs font-semibold text-text-primary">
              What is happening right now?
            </h4>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              currentStep.conditionCheck?.includes("TRUE") || currentStep.conditionCheck?.includes("BASE")
                ? "bg-accent-coral/20 text-accent-coral border border-accent-coral/40"
                : currentStep.conditionCheck?.includes("WAIT") || currentStep.description.includes("WAITING") || currentStep.description.includes("pause")
                ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/40"
                : "bg-accent-blue/20 text-accent-blue border border-accent-blue/40"
            }`}
          >
            {currentStep.conditionCheck?.includes("TRUE") || currentStep.conditionCheck?.includes("BASE")
              ? "BASE CASE HIT"
              : currentStep.description.includes("WAITING") || currentStep.description.includes("pause")
              ? "WAITING FOR CHILD RETURN"
              : currentStep.frames.length === 0
              ? "EXECUTION UNWOUND / CLEAN"
              : "EXECUTING INSTRUCTION"}
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed font-mono mb-3">
          {currentStep.description}
        </p>

        {/* 3-Column Parameter & Condition Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/80 text-[11px] font-mono">
          <div className="p-2 rounded bg-container border border-border/60">
            <div className="text-text-muted uppercase text-[9px] font-bold tracking-wider mb-0.5">
              ACTIVE PARAMETER
            </div>
            <div className="text-text-primary font-semibold truncate">
              {currentStep.frames.length > 0
                ? Object.entries(currentStep.frames[currentStep.frames.length - 1].args || {})
                    .map(([k, v]) => `${k} = ${v}`)
                    .join(", ")
                : "None (Stack Clean)"}
            </div>
          </div>

          <div className="p-2 rounded bg-container border border-border/60">
            <div className="text-text-muted uppercase text-[9px] font-bold tracking-wider mb-0.5">
              CONDITION CHECK
            </div>
            <div className="text-accent-amber font-semibold truncate">
              {currentStep.conditionCheck || "In Progress"}
            </div>
          </div>

          <div className="p-2 rounded bg-container border border-border/60">
            <div className="text-text-muted uppercase text-[9px] font-bold tracking-wider mb-0.5">
              NEXT ACTION
            </div>
            <div className="text-accent-blue font-semibold truncate">
              {currentStep.nextAction || "Continue"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


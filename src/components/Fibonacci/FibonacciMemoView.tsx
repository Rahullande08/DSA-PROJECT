"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  GitBranch, 
  Layers, 
  Sparkles, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  Database, 
  ChevronRight,
  ChevronLeft,
  Terminal,
  Activity,
  Check
} from "lucide-react";
import { fibonacciDef, fibonacciMemoDef } from "../../lib/algorithms";
import { AsciiSweepCanvas } from "../AsciiSweep/AsciiSweepCanvas";
import { FibonacciCallTree } from "./FibonacciCallTree";

interface FibonacciMemoViewProps {
  onOpenQA?: () => void;
  onUpdateContext?: (ctx: any) => void;
}

export const FibonacciMemoView: React.FC<FibonacciMemoViewProps> = ({
  onOpenQA,
  onUpdateContext,
}) => {
  const [mode, setMode] = useState<"naive" | "memo">("memo");
  const [n, setN] = useState<number>(4);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [highlightRedundant, setHighlightRedundant] = useState<boolean>(true);
  const [pruneCached, setPruneCached] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);

  // Generate steps for memo or naive
  const algo = mode === "memo" ? fibonacciMemoDef : fibonacciDef;
  const steps = useMemo(() => {
    return algo.generateSteps({ n });
  }, [algo, n]);

  // Compute naive comparison steps for metrics
  const naiveSteps = useMemo(() => {
    return fibonacciDef.generateSteps({ n });
  }, [n]);

  // Bound step index safely
  const safeStepIdx = Math.min(Math.max(stepIndex, 0), Math.max(steps.length - 1, 0));
  const currentStep = steps[safeStepIdx] || steps[0];

  // Reset step index and playback on input or mode change
  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
    setSelectedNodeId(undefined);
  }, [mode, n]);

  useEffect(() => {
    if (onUpdateContext && currentStep) {
      onUpdateContext({
        algorithm: mode === "memo" ? "Memoized Fibonacci" : "Naive Fibonacci",
        n,
        stepIndex: safeStepIdx,
        totalSteps: steps.length,
        activeLine: currentStep.activeLine,
        activeNodeLabel: currentStep.activeTreeNodeId ? currentStep.treeNodes[currentStep.activeTreeNodeId]?.label : undefined,
        currentStackDepth: currentStep.currentStackDepth,
        callStackFrames: currentStep.frames.map((f) => ({
          callLabel: f.callLabel,
          state: f.state,
          returnValue: f.returnValue,
          pendingOp: f.pendingOp,
          memoryAddr: f.memoryAddr,
          args: f.args,
        })),
        stepDescription: currentStep.description,
        conditionCheck: currentStep.conditionCheck,
        nextAction: currentStep.nextAction,
        resultTarget: currentStep.resultTarget,
      });
    }
  }, [currentStep, safeStepIdx, mode, n, steps.length, onUpdateContext]);

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = Math.max(1100 / speed, 250);
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [isPlaying, speed, steps.length]);

  const triggerAsciiSweep = () => {
    setIsSweeping(true);
  };

  // Find step jump targets
  const baseCaseStepIdx = useMemo(() => {
    return steps.findIndex((s) => s.activeLine === 3 || s.activeLine === 5 || s.frames.some((f) => f.state === "base"));
  }, [steps]);

  const cacheHitStepIdx = useMemo(() => {
    if (mode === "memo") {
      return steps.findIndex((s) => s.activeLine === 3 || (s.customData?.cacheHits && s.customData.cacheHits > 0));
    }
    // In naive, find first redundant subproblem resolution
    return steps.findIndex((s) => s.activeTreeNodeId && s.treeNodes[s.activeTreeNodeId]?.isRedundant);
  }, [steps, mode]);

  // Python snippet lines
  const codeLines = algo.codeSnippets.python.split("\n");

  // Format active frames for LIFO inspection (top frame first)
  const displayFrames = [...(currentStep.frames || [])].reverse();

  // Memo cache entries
  const memoTable: Record<number, number> = currentStep.customData?.memoTable || {};
  const cacheKeys = Object.keys(memoTable).map(Number).sort((a, b) => a - b);

  return (
    <div className="max-w-[1780px] mx-auto px-4 lg:px-6 py-6 space-y-5 relative">
      {/* ASCII Sweep Overlay Canvas */}
      <AsciiSweepCanvas
        isActive={isSweeping}
        onComplete={() => setIsSweeping(false)}
        colorMode={mode === "memo" ? "purple" : "blue"}
        durationMs={850}
      />

      {/* Breadcrumb & Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          {/* Breadcrumb & Badge */}
          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
            <span className="text-text-muted">Learn / Recursion /</span>
            <span className="text-text-primary font-semibold">Fibonacci & Memoization</span>
            <span className="px-2 py-0.5 rounded bg-[#11151B] border border-border text-accent-blue font-bold text-[10px] uppercase ml-2">
              TREE COMPLEXITY LAB • O(2^n) → O(n)
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight">
            Binary Branching & Memoization
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Witness the exponential 2ⁿ call explosion of naive fib(n) versus O(n) linear caching with real-time execution trace.
          </p>
        </div>

        {/* Top Right Controls Matching Stitch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#11151B] border border-border rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => {
                setMode("naive");
                setStepIndex(0);
                triggerAsciiSweep();
              }}
              className={`px-3 py-1 rounded transition-colors ${
                mode === "naive"
                  ? "bg-[#1f2022] text-text-primary font-bold border border-border"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Naive fib(n)
            </button>
            <button
              onClick={() => {
                setMode("memo");
                setStepIndex(0);
                triggerAsciiSweep();
              }}
              className={`px-3 py-1 rounded transition-colors ${
                mode === "memo"
                  ? "bg-[#1f2022] text-text-primary font-bold border border-border"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Memoized fib(n, memo={"{}"})
            </button>
          </div>

          {/* N input selector */}
          <div className="flex items-center gap-1 bg-[#11151B] px-2 py-1 rounded border border-border text-xs font-mono">
            <span className="text-text-muted font-bold">N=</span>
            {[0, 1, 2, 3, 4, 5, 6].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setN(val);
                  setStepIndex(0);
                  triggerAsciiSweep();
                }}
                className={`w-5 h-5 rounded flex items-center justify-center font-bold transition-colors ${
                  n === val
                    ? "bg-accent-blue text-canvas"
                    : "text-text-muted hover:text-text-primary hover:bg-[#1f2022]"
                }`}
              >
                {val}
              </button>
            ))}
          </div>

          {/* Sweep Compare Button */}
          <button
            onClick={triggerAsciiSweep}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#11151B] hover:bg-[#191F28] border border-accent-blue text-accent-blue font-mono text-xs font-semibold shadow-glow-blue transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Sweep Compare - ASCII</span>
          </button>

          <span className="px-2 py-1 rounded bg-[#11151B] border border-border text-[10px] font-mono font-bold uppercase text-text-muted">
            GUIDED EXPLORE
          </span>
        </div>
      </div>

      {/* Main 2-Column Split: Code & Explanation Left, Execution Stack Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Code Editor + Trace Explanation + In-Memory Cache */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* Code Panel */}
          <div className="rounded-lg border border-border bg-[#0D1015] overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-3 py-2 bg-[#11151B] border-b border-border text-xs font-mono">
              <div className="flex items-center gap-1 bg-[#0D1015] border border-border rounded p-0.5">
                <span className="px-2.5 py-0.5 rounded bg-[#1f2022] text-text-primary font-medium">
                  Python Source
                </span>
                <span className="px-2.5 py-0.5 rounded text-text-muted">
                  {mode === "memo" ? "Memo Cache (Hashmap)" : "Binary Tree Invariant"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse" />
                <span>fibonacci_{mode}.py</span>
              </div>
            </div>

            {/* Dynamic Code lines highlighting active step */}
            <div className="p-3 font-mono text-xs leading-relaxed bg-[#08090B]/60 space-y-1">
              {codeLines.map((lineText, idx) => {
                const lineNum = idx + 1;
                const isActive = currentStep.activeLine === lineNum;

                let badge = null;
                if (mode === "memo") {
                  if (lineNum === 2) badge = "CACHE CHECK";
                  else if (lineNum === 3) badge = "HIT RETRIEVED";
                  else if (lineNum === 4 || lineNum === 5) badge = "BASE CASE";
                  else if (lineNum === 6) badge = "DUAL RECURSION";
                  else if (lineNum === 7) badge = "MEMO STORE & RETURN";
                } else {
                  if (lineNum === 2) badge = "BASE CONDITION";
                  else if (lineNum === 3) badge = "BASE RETURN";
                  else if (lineNum === 4) badge = "DUAL BRANCH DISPATCH";
                }

                return (
                  <div
                    key={lineNum}
                    className={`flex items-center justify-between px-2 py-0.5 rounded transition-all duration-200 ${
                      isActive
                        ? "bg-accent-blue/15 border-l-2 border-accent-blue shadow-inner"
                        : "hover:bg-[#11151B]/40 text-text-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-right text-[11px] text-text-muted select-none">
                        {isActive ? <span className="text-accent-blue font-bold">▶</span> : lineNum}
                      </span>
                      <pre className={`m-0 ${isActive ? "text-text-primary font-bold" : ""}`}>
                        {lineText}
                      </pre>
                    </div>

                    {badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          isActive
                            ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/40"
                            : "bg-[#11151B] text-text-muted border border-border/50"
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Trace Explanation Card */}
          <div className="rounded-lg border border-border bg-[#0D1015] p-3.5 shadow-lg">
            <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
                <span className="font-semibold text-text-primary">Trace Explanation</span>
              </div>
              <span className="text-[11px] text-text-muted">
                STACK DEPTH: <strong className="text-accent-blue">Level {currentStep.currentStackDepth}</strong> / {currentStep.maxDepthReached || 1}
              </span>
            </div>
            <p className="text-xs text-text-secondary font-mono leading-relaxed">
              {currentStep.description}
            </p>
            {currentStep.conditionCheck && (
              <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-accent-mint bg-[#11151B] px-2.5 py-1 rounded border border-border">
                <span className="text-text-muted">Condition:</span>
                <code>{currentStep.conditionCheck}</code>
              </div>
            )}
          </div>

          {/* In-Memory Cache Card (or Redundant Invariant for Naive) */}
          <div className="rounded-lg border border-border bg-[#0D1015] p-3.5 shadow-lg">
            <div className="flex items-center justify-between mb-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-accent-mint" />
                <span className="font-semibold text-text-primary">
                  {mode === "memo" ? (
                    <>In-Memory Cache <code className="text-accent-mint">memo = {"{}"}</code></>
                  ) : (
                    <>Subproblem Redundancy Analysis <code className="text-accent-purple">O(2^n) Explosion</code></>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                {mode === "memo" ? (
                  <>
                    <span>Hits: <strong className="text-accent-mint font-bold">{currentStep.customData?.cacheHits ?? 0}</strong></span>
                    <span>Calls Saved: <strong className="text-accent-purple font-bold">{currentStep.customData?.callsSaved ?? 0} frames</strong></span>
                  </>
                ) : (
                  <>
                    <span>Total Invocations: <strong className="text-accent-blue font-bold">{currentStep.totalCalls}</strong></span>
                    <span>Unwound: <strong className="text-accent-mint font-bold">{currentStep.unwoundCount}</strong></span>
                  </>
                )}
              </div>
            </div>

            {/* Key Value Cards */}
            {mode === "memo" ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                {cacheKeys.length === 0 ? (
                  <div className="col-span-full py-2 text-center text-text-muted text-xs">
                    Cache table empty (populates as subproblems resolve)
                  </div>
                ) : (
                  cacheKeys.map((key) => {
                    const val = memoTable[key];
                    const isBase = key <= 1;
                    return (
                      <div
                        key={key}
                        className={`p-2 rounded bg-[#11151B] border flex justify-between items-center transition-all ${
                          isBase ? "border-border" : "border-accent-purple/60 shadow-glow-purple"
                        }`}
                      >
                        <span className="text-text-muted font-bold">KEY [{key}]</span>
                        <span className={`font-bold ${isBase ? "text-text-primary" : "text-accent-purple"}`}>
                          {val} <span className="text-[9px] text-accent-mint">{isBase ? "BASE" : "CACHED"}</span>
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                {Array.from({ length: Math.min(n + 1, 6) }, (_, i) => {
                  const subproblemN = n - i;
                  if (subproblemN < 0) return null;
                  const occurrences = Object.values(currentStep.treeNodes).filter((node) => node.n === subproblemN).length;
                  const isRedun = occurrences > 1;

                  return (
                    <div
                      key={subproblemN}
                      className={`p-2 rounded bg-[#11151B] border flex justify-between items-center ${
                        isRedun ? "border-accent-purple/60 text-accent-purple" : "border-border text-text-primary"
                      }`}
                    >
                      <span className="text-text-muted">fib({subproblemN})</span>
                      <span className="font-bold">
                        {occurrences}× {isRedun && <span className="text-[9px] bg-accent-purple/20 px-1 rounded">REDUN</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Gradient progress bar */}
            <div className="mt-3 h-1.5 w-full bg-[#11151B] rounded overflow-hidden flex">
              <div
                style={{ width: `${Math.min(((safeStepIdx + 1) / steps.length) * 100, 100)}%` }}
                className="bg-accent-blue transition-all duration-300"
              />
              <div
                style={{ width: `${mode === "memo" ? Math.min((cacheKeys.length / (n + 1)) * 100, 100) : 0}%` }}
                className="bg-accent-mint transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Dynamic Execution Stack LIFO */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-[#0D1015] overflow-hidden shadow-lg flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#11151B] border-b border-border text-xs font-mono">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-accent-blue" />
                <span className="font-semibold text-text-primary">
                  Execution Stack <span className="text-text-muted">LIFO (TOP ↓)</span>
                </span>
              </div>
              <span className="text-text-muted text-[11px]">
                {currentStep.currentStackDepth} active frames
              </span>
            </div>

            {/* Dynamic Stack Frames List */}
            <div className="p-3 space-y-2 bg-[#08090B]/60 flex-1 font-mono text-xs overflow-y-auto max-h-[340px]">
              {displayFrames.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center text-text-muted">
                  <Layers className="w-8 h-8 stroke-1 mb-2 opacity-40 text-text-muted" />
                  <p className="text-xs">Stack is currently empty</p>
                  <p className="text-[11px] text-text-muted/70 mt-1">
                    {safeStepIdx === steps.length - 1 ? "All frames unwound on completion." : "Press Resume to begin execution."}
                  </p>
                </div>
              ) : (
                displayFrames.map((frame, index) => {
                  const isTop = index === 0;
                  const isBase = frame.state === "base";
                  const isWaiting = frame.state === "waiting";
                  const isReturning = frame.state === "returning";

                  return (
                    <div
                      key={frame.id}
                      className={`p-2.5 rounded border transition-all duration-200 ${
                        isTop
                          ? "border-accent-blue bg-[#11151B] shadow-glow-blue"
                          : isWaiting
                          ? "border-dashed border-accent-amber/50 bg-[#0D1015]"
                          : isReturning || isBase
                          ? "border-accent-mint bg-[#11151B] shadow-glow-mint"
                          : "border-border bg-[#0D1015]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-primary">
                          {frame.callLabel}
                        </span>
                        {isTop && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-accent-blue/20 text-accent-blue border border-accent-blue/40">
                            ACTIVE FRAME
                          </span>
                        )}
                        {isWaiting && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-accent-amber/20 text-accent-amber border border-accent-amber/40">
                            WAITING
                          </span>
                        )}
                        {isBase && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-accent-coral/20 text-accent-coral border border-accent-coral/40">
                            BASE CASE MET
                          </span>
                        )}
                        {isReturning && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-accent-mint/20 text-accent-mint border border-accent-mint/40">
                            RETURNING
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-text-muted mt-1">
                        <span>
                          {frame.returnValue !== undefined ? (
                            <>Returns: <strong className="text-accent-mint">{frame.returnValue}</strong></>
                          ) : frame.pendingOp ? (
                            <span className="text-accent-blue">{frame.pendingOp}</span>
                          ) : (
                            <span>Args: n={frame.args?.n}</span>
                          )}
                        </span>
                        <span>{frame.memoryAddr}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Stack Footprint Footer */}
            <div className="p-3 bg-[#11151B] border-t border-border font-mono text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-text-muted">
                <span>Stack Memory Footprint</span>
                <span className="text-text-primary font-bold">
                  {currentStep.currentStackDepth * 32} Bytes ({((currentStep.currentStackDepth * 32) / 1024).toFixed(2)} KB)
                </span>
              </div>
              <div className="w-full h-1 bg-[#1f2022] rounded overflow-hidden">
                <div
                  style={{ width: `${Math.min((currentStep.currentStackDepth / (n + 1)) * 100, 100)}%` }}
                  className="bg-accent-blue h-full transition-all duration-200"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-accent-mint">
                <span>MAX DEPTH PEAK: {currentStep.maxDepthReached || 1}</span>
                <span>SAFE: NO STACK OVERFLOW</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Branching Call Tree (Visual AST) */}
      <FibonacciCallTree
        currentStep={currentStep}
        highlightRedundant={highlightRedundant}
        pruneCached={pruneCached}
        onNodeSelect={(nodeId) => {
          setSelectedNodeId(nodeId);
          // Find first step where this node is active or running
          const targetIdx = steps.findIndex(
            (s) => s.activeTreeNodeId === nodeId || s.treeNodes[nodeId]?.status === "running"
          );
          if (targetIdx !== -1) {
            setStepIndex(targetIdx);
          }
        }}
        selectedNodeId={selectedNodeId}
      />

      {/* Playback Transport Bar Matching Stitch */}
      <div className="p-3 bg-[#11151B] border border-border rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          {/* Reset */}
          <button 
            onClick={() => {
              setStepIndex(0);
              setIsPlaying(false);
              triggerAsciiSweep();
            }}
            className="p-1.5 rounded bg-[#0D1015] border border-border text-text-muted hover:text-text-primary hover:bg-[#1f2022] transition-colors"
            title="Reset to Step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Back */}
          <button
            onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
            disabled={safeStepIdx === 0}
            className="p-1.5 rounded bg-[#0D1015] border border-border text-text-muted hover:text-text-primary disabled:opacity-40 transition-colors"
            title="Step Back"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-blue text-canvas font-bold shadow-glow-blue transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "Pause" : "Resume Sweep"}</span>
          </button>

          {/* Step Forward */}
          <button
            onClick={() => setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))}
            disabled={safeStepIdx >= steps.length - 1}
            className="p-1.5 rounded bg-[#0D1015] border border-border text-text-muted hover:text-text-primary disabled:opacity-40 transition-colors"
            title="Step Forward"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Jump to Base Cases */}
          {baseCaseStepIdx !== -1 && (
            <button
              onClick={() => setStepIndex(baseCaseStepIdx)}
              className="px-2.5 py-1.5 rounded bg-[#0D1015] border border-border text-text-secondary hover:text-text-primary hover:bg-[#1f2022] transition-colors"
            >
              Jump to Base Case
            </button>
          )}

          {/* Jump to Cache Hit / Redundancy */}
          {cacheHitStepIdx !== -1 && (
            <button
              onClick={() => {
                setStepIndex(cacheHitStepIdx);
                triggerAsciiSweep();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#0D1015] border border-accent-mint text-accent-mint hover:bg-accent-mint/10 transition-colors"
            >
              <Zap className="w-3 h-3" />
              <span>{mode === "memo" ? "Jump to Cache Hit" : "Jump to Redundancy"}</span>
            </button>
          )}
        </div>

        {/* Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-[11px]">
            Step <strong className="text-text-primary">{safeStepIdx + 1}</strong> of {steps.length}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(steps.length - 1, 0)}
            value={safeStepIdx}
            onChange={(e) => setStepIndex(Number(e.target.value))}
            className="accent-accent-purple w-28 sm:w-40 h-1.5 bg-[#1f2022] rounded appearance-none cursor-pointer"
          />
          <div className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
            {([0.5, 1, 2] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1 rounded transition-colors ${
                  speed === s ? "text-accent-blue font-bold" : "hover:text-text-primary"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Metric Cards at Bottom Matching Stitch Screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl border border-border bg-[#0D1015] flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">
              CALL VOLUME EXPLOSION
            </div>
            <div className="flex items-baseline gap-2">
              <span className="line-through text-text-muted text-sm">
                {naiveSteps[naiveSteps.length - 1]?.totalCalls || Math.pow(2, n)} calls
              </span>
              <span className="text-accent-mint font-bold text-lg">
                → {currentStep.totalCalls} calls
              </span>
            </div>
            <div className="text-[11px] text-accent-mint mt-0.5">
              {mode === "memo" && naiveSteps[naiveSteps.length - 1]?.totalCalls
                ? `${(
                    ((naiveSteps[naiveSteps.length - 1].totalCalls - steps[steps.length - 1].totalCalls) /
                      naiveSteps[naiveSteps.length - 1].totalCalls) *
                    100
                  ).toFixed(1)}% execution reduction`
                : "Exponential O(2^n) branching"}
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-[#11151B] border border-border flex items-center justify-center text-accent-mint">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-[#0D1015] flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">
              TIME COMPLEXITY TRANSITION
            </div>
            <div className="flex items-baseline gap-2">
              <span className="line-through text-text-muted text-sm">O(2^{n})</span>
              <span className="text-accent-purple font-bold text-lg">
                → {mode === "memo" ? "O(n)" : "O(2^n)"}
              </span>
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              {mode === "memo" ? "Linear branch resolution" : "Full exponential tree expansion"}
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-[#11151B] border border-border flex items-center justify-center text-accent-purple">
            <GitBranch className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-[#0D1015] flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">
              CALL STACK DEPTH
            </div>
            <div className="text-text-primary font-bold text-lg">
              O(n) <span className="text-xs font-normal text-text-muted">Max Depth: {currentStep.maxDepthReached || 1} frames</span>
            </div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              Constant auxiliary space O(n)
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-[#11151B] border border-border flex items-center justify-center text-accent-blue">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

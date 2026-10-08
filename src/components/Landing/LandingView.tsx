"use client";

import React, { useState } from "react";
import { 
  Play, 
  Terminal, 
  Layers, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  Cpu,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { AlgorithmId } from "../../types/recursion";
import { AsciiSweepCanvas } from "../AsciiSweep/AsciiSweepCanvas";

interface LandingViewProps {
  onStartExploring: () => void;
  onSelectAlgo: (algo: AlgorithmId) => void;
}

const MOCKUP_STEPS = [
  {
    step: 1,
    line: 1,
    lineText: "def factorial(n):",
    desc: "Invoking factorial(4). Stacking root frame.",
    frames: [
      { label: "factorial(4)", state: "ROOT CALL", pending: "evaluating (n <= 1)", addr: "0x7ffd01", color: "blue" },
    ],
  },
  {
    step: 2,
    line: 4,
    lineText: "▶ return n * factorial(n - 1)",
    desc: "factorial(4) pauses at line 4: waiting for factorial(3).",
    frames: [
      { label: "factorial(3)", state: "ACTIVE", pending: "3 * factorial(2)", addr: "0x7ffd02", color: "blue" },
      { label: "factorial(4)", state: "WAITING", pending: "4 * factorial(3)", addr: "0x7ffd01", color: "amber" },
    ],
  },
  {
    step: 3,
    line: 4,
    lineText: "▶ return n * factorial(n - 1)",
    desc: "factorial(3) pauses: waiting for factorial(2).",
    frames: [
      { label: "factorial(2)", state: "ACTIVE", pending: "2 * factorial(1)", addr: "0x7ffd03", color: "blue" },
      { label: "factorial(3)", state: "WAITING", pending: "3 * factorial(2)", addr: "0x7ffd02", color: "amber" },
      { label: "factorial(4)", state: "ROOT CALL", pending: "4 * factorial(3)", addr: "0x7ffd01", color: "mint" },
    ],
  },
  {
    step: 4,
    line: 3,
    lineText: "return 1  # Base Case Hit!",
    desc: "factorial(1) matches base condition (1 <= 1) -> Returns 1.",
    frames: [
      { label: "factorial(1)", state: "BASE HIT", pending: "returns 1", addr: "0x7ffd04", color: "mint" },
      { label: "factorial(2)", state: "WAITING", pending: "2 * [1]", addr: "0x7ffd03", color: "amber" },
      { label: "factorial(3)", state: "WAITING", pending: "3 * [2]", addr: "0x7ffd02", color: "amber" },
      { label: "factorial(4)", state: "ROOT CALL", pending: "4 * [6]", addr: "0x7ffd01", color: "mint" },
    ],
  },
  {
    step: 5,
    line: 4,
    lineText: "return 4 * 6 = 24 [RESOLVED]",
    desc: "Unwind complete! Final result = 24 synthesized.",
    frames: [
      { label: "factorial(4)", state: "RESOLVED", pending: "Result: 24", addr: "0x7ffd01", color: "mint" },
    ],
  },
];

export const LandingView: React.FC<LandingViewProps> = ({
  onStartExploring,
  onSelectAlgo,
}) => {
  const [mockStepIdx, setMockStepIdx] = useState(2); // Step 3
  const [isSweeping, setIsSweeping] = useState(false);

  const currentMock = MOCKUP_STEPS[mockStepIdx];

  const triggerSweep = () => {
    setIsSweeping(true);
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-8 space-y-16 relative">
      {/* ASCII Sweep Overlay */}
      <AsciiSweepCanvas
        isActive={isSweeping}
        onComplete={() => setIsSweeping(false)}
        colorMode="blue"
        durationMs={850}
      />

      {/* 1. HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4">
        {/* Hero Left Copy */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#11151B] border border-border text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
            <span className="text-text-muted">ASCII SWEEP ENGINE • PYTHON 3.12 CORE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-[1.08]">
            Recursion, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent-purple to-accent-mint">
              made visible.
            </span>
          </h1>

          <p className="text-base text-text-secondary leading-relaxed max-w-xl">
            Understand what happens inside a recursive call. Watch frames stack up in real-time memory, follow return values upward, and master algorithmic mental models one step at a time.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                triggerSweep();
                onStartExploring();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-blue hover:bg-accent-blue/90 text-canvas font-bold text-sm shadow-glow-blue transition-all group"
            >
              <span>START EXPLORING</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                triggerSweep();
                onSelectAlgo("fibonacci");
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#11151B] hover:bg-[#191F28] border border-border text-text-primary font-mono text-xs font-semibold transition-colors"
            >
              <Terminal className="w-4 h-4 text-accent-purple" />
              <span>Explore Tree Branching</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted pt-4 border-t border-border/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-mint" />
              Zero boilerplate
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-blue" />
              Interactive LIFO stack
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-purple" />
              ASCII sweep transitions
            </span>
          </div>
        </div>

        {/* Hero Right: Live Interactive Terminal Preview Mockup */}
        <div className="lg:col-span-6">
          <div className="rounded-xl border border-border bg-[#0D1015] shadow-2xl overflow-hidden">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#11151B] border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent-coral/80" />
                <div className="w-3 h-3 rounded-full bg-accent-amber/80" />
                <div className="w-3 h-3 rounded-full bg-accent-mint/80" />
                <span className="text-xs font-mono text-text-muted ml-2">
                  recursion_visualizer.py — Live Demo
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#08090B] border border-border text-accent-mint">
                STACK: {currentMock.frames.length}/4
              </span>
            </div>

            {/* Split Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 p-4 gap-4 bg-[#08090B]/80 font-mono text-xs">
              {/* Code Preview Left */}
              <div className="space-y-1.5 p-3 rounded bg-[#0D1015] border border-border">
                <div className="text-[10px] text-text-muted font-bold mb-2 flex items-center justify-between">
                  <span>SOURCE</span>
                  <span className="text-accent-blue">LINE: {currentMock.line}</span>
                </div>
                <div className={currentMock.line === 1 ? "text-accent-blue font-bold" : "text-text-muted"}>1  def factorial(n):</div>
                <div className={currentMock.line === 2 ? "text-accent-blue font-bold" : "text-text-muted"}>2      if n &lt;= 1:</div>
                <div className={currentMock.line === 3 ? "text-accent-mint font-bold" : "text-text-muted"}>3          return 1</div>
                <div className={currentMock.line === 4 ? "text-text-primary bg-accent-blue/20 px-1 py-0.5 rounded border-l-2 border-accent-blue font-bold" : "text-text-muted"}>
                  4  ▶ return n * factorial(n - 1)
                </div>
                <div className="text-[11px] text-accent-amber mt-3 pt-2 border-t border-border/50 truncate">
                  {currentMock.desc}
                </div>
              </div>

              {/* Stack Preview Right */}
              <div className="space-y-2">
                <div className="text-[10px] text-text-muted font-bold flex items-center justify-between">
                  <span>MEMORY CALL STACK (LIFO)</span>
                  <span className="text-accent-mint">TOP FRAME</span>
                </div>

                {currentMock.frames.map((f, i) => (
                  <div
                    key={f.label}
                    className={`p-2 rounded border text-[11px] ${
                      i === 0
                        ? "border-accent-blue bg-[#11151B] text-text-primary shadow-glow-blue"
                        : i === 1
                        ? "border-dashed border-accent-amber/60 bg-[#0D1015] text-text-secondary"
                        : "border-border bg-[#0D1015]/60 text-text-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{f.label}</span>
                      <span className={`text-[9px] px-1 py-0.2 rounded uppercase ${
                        i === 0 ? "bg-accent-blue/20 text-accent-blue" : "bg-border text-text-muted"
                      }`}>
                        {f.state}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      {f.pending}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Preview Transport */}
            <div className="px-4 py-2.5 bg-[#11151B] border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMockStepIdx((prev) => Math.max(prev - 1, 0))}
                  disabled={mockStepIdx === 0}
                  className="p-1 rounded hover:bg-[#1f2022] text-text-muted hover:text-text-primary disabled:opacity-30"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMockStepIdx((prev) => Math.min(prev + 1, MOCKUP_STEPS.length - 1))}
                  disabled={mockStepIdx === MOCKUP_STEPS.length - 1}
                  className="p-1 rounded hover:bg-[#1f2022] text-text-muted hover:text-text-primary disabled:opacity-30"
                  title="Next Step"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] ml-1">Step {mockStepIdx + 1} of {MOCKUP_STEPS.length}</span>
              </div>

              <button
                onClick={() => {
                  triggerSweep();
                  onStartExploring();
                }}
                className="flex items-center gap-1.5 text-accent-blue font-bold hover:underline"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Full Visualizer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE CORE MENTAL MODELS */}
      <div className="space-y-6 pt-8">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent-blue mb-1">
            CORE PRINCIPLES
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Three Core Mental Models of Recursive Thought
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Most programmers struggle with recursion because they attempt to trace every branch manually. Recursion Studio isolates the three invariants that make recursion predictable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="p-5 rounded-xl border border-border bg-[#0D1015] hover:border-accent-blue/60 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-accent-blue">
                MODEL 01
              </span>
              <Layers className="w-4 h-4 text-accent-blue" />
            </div>
            <h3 className="text-base font-bold text-text-primary">
              Every call has a frame.
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Visualize the active function, local variable bindings, and execution point. When a call triggers its child, it suspends—waiting patiently on the stack with its state frozen in time.
            </p>
            <div className="p-3 rounded bg-[#11151B] border border-border/80 font-mono text-[11px] space-y-1">
              <div className="text-text-muted flex justify-between">
                <span>STACK/FRAME READY</span>
                <span className="text-accent-blue">ACTIVE</span>
              </div>
              <div className="text-text-primary font-bold">n = 4</div>
              <div className="text-[10px] text-text-muted">frame_addr: 0x7ffd01</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-xl border border-border bg-[#0D1015] hover:border-accent-coral/60 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-accent-coral">
                MODEL 02
              </span>
              <ShieldCheck className="w-4 h-4 text-accent-coral" />
            </div>
            <h3 className="text-base font-bold text-text-primary">
              Every recursion has a stop.
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Understand base cases through clear visual feedback. Meet boundary conditions and watch execution reverse before stack overflow occurs. Continuous recursion descent is ceased.
            </p>
            <div className="p-3 rounded bg-[#11151B] border border-border/80 font-mono text-[11px] space-y-1">
              <div className="text-text-muted flex justify-between">
                <span>BOUNDARY GUARD</span>
                <span className="text-accent-coral">BASE HIT</span>
              </div>
              <div className="text-accent-coral font-bold">if n &lt;= 1: return 1 (HALT DESCENT)</div>
              <div className="text-[10px] text-text-muted">max stack reached: 4 frames</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-xl border border-border bg-[#0D1015] hover:border-accent-mint/60 transition-all space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-accent-mint">
                MODEL 03
              </span>
              <GitBranch className="w-4 h-4 text-accent-mint" />
            </div>
            <h3 className="text-base font-bold text-text-primary">
              Every result has a way back.
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Watch return values unwind pending calculations in reverse order. As each frame pops off, it hands its synthesized answer back to the caller above it, weaving individual pieces into the final answer.
            </p>
            <div className="p-3 rounded bg-[#11151B] border border-border/80 font-mono text-[11px] space-y-1">
              <div className="text-text-muted flex justify-between">
                <span>UNWIND CASCADE</span>
                <span className="text-accent-mint">LIFO RETURN</span>
              </div>
              <div className="text-accent-mint font-bold">f(4) = 4 * 6 = 24</div>
              <div className="text-[10px] text-text-muted">all frames popped clean</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STUDY CLASSICAL RECURSIVE PATTERNS */}
      <div className="space-y-6 pt-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent-purple mb-1">
            INTERACTIVE ALGORITHMS
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Study Classical Recursive Patterns
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Explore linear call chains vs. branching tree structures, inspect stack depths, and observe memory footprints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pattern 1: Factorial */}
          <div className="p-6 rounded-xl border border-border bg-[#0D1015] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-accent-blue" />
                <h3 className="font-mono text-base font-bold text-text-primary">
                  Factorial(n)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-text-muted bg-[#11151B] px-2 py-0.5 rounded border border-border">
                LINEAR RECURSION
              </span>
            </div>

            <p className="text-xs text-text-secondary">
              The canonical single-frame chain demonstration. Shows single-stack descent where maximum memory depth is directly proportional to input size.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
              <span className="px-2 py-0.5 rounded bg-[#11151B] border border-border">Time: O(n)</span>
              <span className="px-2 py-0.5 rounded bg-[#11151B] border border-border">Space: O(n) stack</span>
              <span className="px-2 py-0.5 rounded bg-[#11151B] border border-border">Branches: 1</span>
            </div>

            <div className="p-3 rounded bg-[#08090B] border border-border font-mono text-xs text-text-muted overflow-x-auto">
              <div className="text-text-primary font-semibold mb-1">Execution Chain Graph:</div>
              <div>factorial(4) →</div>
              <div>&nbsp;&nbsp;factorial(3) →</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;factorial(2) →</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;factorial(1) = return 1 [Base]</div>
              <div className="text-accent-mint">&nbsp;&nbsp;&nbsp;&nbsp;return 2 * 1 = 2</div>
              <div className="text-accent-mint">&nbsp;&nbsp;return 3 * 2 = 6</div>
              <div className="text-accent-mint">return 4 * 6 = 24</div>
            </div>

            <button
              onClick={() => {
                triggerSweep();
                onSelectAlgo("factorial");
                onStartExploring();
              }}
              className="w-full py-2.5 rounded-lg bg-[#11151B] hover:bg-[#191F28] border border-border text-accent-blue font-mono text-xs font-bold transition-colors"
            >
              Launch Factorial Demo →
            </button>
          </div>

          {/* Pattern 2: Fibonacci */}
          <div className="p-6 rounded-xl border border-border bg-[#0D1015] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-accent-purple" />
                <h3 className="font-mono text-base font-bold text-text-primary">
                  Fibonacci(n)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-text-muted bg-[#11151B] px-2 py-0.5 rounded border border-border">
                BINARY BRANCHING
              </span>
            </div>

            <p className="text-xs text-text-secondary">
              Tree recursion that explodes exponentially without memoization. Recursion Studio illuminates why O(2^n) is created via redundant subproblems.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
              <span className="px-2 py-0.5 rounded bg-[#11151B] border border-border">Time: O(2^n)</span>
              <span className="px-2 py-0.5 rounded bg-[#11151B] border border-border">Space: O(n)</span>
              <span className="px-2 py-0.5 rounded bg-[#11151B] border border-border">Branches: 2</span>
            </div>

            <div className="p-3 rounded bg-[#08090B] border border-border font-mono text-xs text-text-muted overflow-x-auto">
              <div className="text-text-primary font-semibold mb-1">Binary Call Tree (Redundant Subproblems):</div>
              <div className="text-accent-purple font-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fib(4)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↙&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↘</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;fib(3)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-accent-amber font-bold">fib(2)*</span></div>
              <div>&nbsp;&nbsp;&nbsp;↙&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↘&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↙&nbsp;&nbsp;&nbsp;↘</div>
              <div><span className="text-accent-amber font-bold">fib(2)*</span>&nbsp;&nbsp;fib(1)&nbsp;&nbsp;&nbsp;&nbsp;fib(1)&nbsp;fib(0)</div>
              <div className="text-accent-amber text-[10px] mt-1">* fib(2) computed multiple times!</div>
            </div>

            <button
              onClick={() => {
                triggerSweep();
                onSelectAlgo("fibonacci");
              }}
              className="w-full py-2.5 rounded-lg bg-[#11151B] hover:bg-[#191F28] border border-border text-accent-purple font-mono text-xs font-bold transition-colors"
            >
              Inspect Tree Branching →
            </button>
          </div>
        </div>
      </div>

      {/* 4. ASCII SWEEP TRANSITION SECTION */}
      <div className="rounded-xl border border-border bg-[#0D1015] p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent-blue">
            DISCIPLINE / SYSTEM TRACE
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            The ASCII Sweep Transition.
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Switching between code, call stacks, and execution trees often disrupts mental spatial awareness. Our proprietary ASCII sweep engine resonates monospace character matrices across renderers.
          </p>

          <div className="space-y-3 font-mono text-xs text-text-muted">
            <div className="flex items-start gap-2">
              <span className="text-accent-blue font-bold">01</span>
              <span>
                <strong className="text-text-primary">Zero Latency Jitter</strong>: Instantaneous script updates bypass interactive pauses, maintaining system cadence.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-mint font-bold">02</span>
              <span>
                <strong className="text-text-primary">Luminous State Wave</strong>: Returns sweep upward with active highlighted rows, establishing topological order.
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#08090B] rounded-lg border border-border p-4 font-mono text-xs text-text-primary overflow-x-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border text-[11px] text-text-muted">
            <span>ASCII MODE: Execution Tree & State Trace</span>
            <button
              onClick={triggerSweep}
              className="text-accent-blue hover:text-accent-blue/80 flex items-center gap-1 font-bold"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Trigger Sweep</span>
            </button>
          </div>
          <pre className="text-accent-blue/90 leading-relaxed font-mono whitespace-pre">
{`├── factorial(4) : depth=1 [SUSPENDED]
│   ├── mult: f(4) * factorial(3)
│   ├── factorial(3) : depth=2 [SUSPENDED]
│   │   ├── mult: f(3) * factorial(2)
│   │   ├── factorial(2) : depth=3 [SUSPENDED]
│   │   │   ├── mult: f(2) * factorial(1)
│   │   │   ├── factorial(1) : BASE HIT -> 1 [RESOLVED]
│   │   │   └── return 2 * 1 = 2 [RESOLVED]
│   │   └── return 3 * 2 = 6 [RESOLVED]
└── return 4 * 6 = 24 [FINAL RESULT COMPLETE]`}
          </pre>
        </div>
      </div>

      {/* 5. CALL TO ACTION FOOTER */}
      <div className="text-center py-12 space-y-4 border-t border-border/60">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11151B] border border-border text-xs font-mono text-text-muted">
          <span>● READY FOR PYTHON 3.12 / JS / C++</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
          Master recursion from first principles.
        </h2>
        <p className="text-sm text-text-secondary max-w-lg mx-auto">
          Ditch print-statements and confusing mental models. Trace execution frames, observe call-stack unwinding, and debug recursion code with crystalline clarity.
        </p>
        <div className="pt-2">
          <button
            onClick={() => {
              triggerSweep();
              onStartExploring();
            }}
            className="px-8 py-3.5 rounded-lg bg-accent-blue hover:bg-accent-blue/90 text-canvas font-bold text-sm shadow-glow-blue transition-all"
          >
            Open Interactive Visualizer Now →
          </button>
        </div>
      </div>
    </div>
  );
};

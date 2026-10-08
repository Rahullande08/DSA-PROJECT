"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Layers, 
  ShieldAlert, 
  ArrowDownUp, 
  GitFork, 
  Cpu, 
  CheckCircle,
  HelpCircle,
  Code2
} from "lucide-react";

export const LearnView: React.FC = () => {
  const [activeLesson, setActiveLesson] = useState<number>(0);

  const lessons = [
    {
      id: "mental_models",
      title: "1. The Anatomy of a Recursive Call",
      icon: Layers,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Recursion is not magic—it is simply a function that invokes itself with a smaller input subproblem. Every recursion consists of two fundamental pillars:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            <div className="p-4 rounded bg-container border border-accent-coral/40">
              <h4 className="font-mono text-xs font-bold text-accent-coral mb-1">
                1. The Base Case (The Guard)
              </h4>
              <p className="text-xs text-text-secondary">
                The explicit termination condition that stops recursion. It returns a known, concrete constant value (e.g. <code>n &lt;= 1 return 1</code>) without making any further recursive calls.
              </p>
            </div>

            <div className="p-4 rounded bg-container border border-accent-blue/40">
              <h4 className="font-mono text-xs font-bold text-accent-blue mb-1">
                2. The Recursive Step (The Leap)
              </h4>
              <p className="text-xs text-text-secondary">
                The logic that reduces the problem size (e.g. <code>n - 1</code>, <code>n / 2</code>) and invokes itself, combining the subproblem’s returned answer to produce the larger answer.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-panel border border-border font-mono text-xs text-text-muted space-y-2">
            <div className="text-text-primary font-bold">Standard Template:</div>
            <pre className="text-accent-blue leading-relaxed">
{`def solve(n):
    # 1. Base Case Guard
    if n <= 0:
        return BASE_VALUE
        
    # 2. Recursive Transition
    sub_answer = solve(n - 1)
    return combine(n, sub_answer)`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: "call_stack",
      title: "2. The Call Stack & Activation Records",
      icon: Cpu,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            When your computer runs a program, memory for function calls is allocated on the <strong>Call Stack</strong> using a Last-In, First-Out (LIFO) protocol.
          </p>

          <div className="p-4 rounded bg-container border border-border space-y-2 text-xs font-mono">
            <div className="text-accent-mint font-bold">Activation Record (Stack Frame) Contents:</div>
            <ul className="list-disc list-inside space-y-1 text-text-secondary pl-2">
              <li><strong>Function Arguments</strong>: Exact parameters passed to this call (e.g. <code>n = 3</code>).</li>
              <li><strong>Local Variables</strong>: Any variables scoped within the function.</li>
              <li><strong>Return Address</strong>: The exact instruction line in memory where execution will resume when this call finishes.</li>
              <li><strong>Caller Link</strong>: Pointer back to the parent frame that issued the call.</li>
            </ul>
          </div>

          <div className="p-3 rounded bg-accent-amber/10 border border-accent-amber/30 text-xs text-text-secondary flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-accent-amber flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-accent-amber">Why Stack Overflows Happen:</strong> If your base case is missing or unreachable, frames pile up indefinitely until memory is exhausted (e.g. Python default limit: 1000 frames).
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "unwinding",
      title: "3. Stack Unwinding & Synthesis",
      icon: ArrowDownUp,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Many learners understand how recursion goes <em>down</em>, but miss how it comes back <em>up</em>. This return phase is called <strong>Stack Unwinding</strong>.
          </p>

          <div className="p-4 rounded bg-panel border border-border font-mono text-xs space-y-2">
            <div className="text-accent-mint font-bold">The Two Phases of Recursion:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded bg-container border border-border">
                <div className="text-accent-blue font-bold mb-1">Phase 1: Winding (Down)</div>
                <p className="text-[11px] text-text-muted">
                  Calls stack up. Execution pauses at the recursive call line in every frame. No multiplications or sums have taken place yet!
                </p>
              </div>
              <div className="p-3 rounded bg-container border border-border">
                <div className="text-accent-mint font-bold mb-1">Phase 2: Unwinding (Up)</div>
                <p className="text-[11px] text-text-muted">
                  Base case fires. Frames pop off one by one in reverse order, executing their delayed operations and passing answers upward.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "tail_recursion",
      title: "4. Tail Recursion vs Tree Recursion",
      icon: GitFork,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Not all recursive calls behave the same. The topology of recursion depends on how many calls are made per frame:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded bg-container border border-border space-y-2">
              <div className="text-accent-blue font-bold">Linear / Tail Recursion</div>
              <p className="text-[11px] text-text-secondary">
                At most one recursive call per frame (e.g. Factorial, Binary Search). Stack depth is O(n) or O(log n). Can be optimized by compilers into loops via Tail Call Optimization (TCO).
              </p>
            </div>

            <div className="p-4 rounded bg-container border border-border space-y-2">
              <div className="text-accent-purple font-bold">Tree Recursion</div>
              <p className="text-[11px] text-text-secondary">
                Two or more recursive calls per frame (e.g. Fibonacci, Merge Sort, Hanoi). Creates an exponential branch tree O(2^n). Requires memoization or dynamic programming to tame.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-container border border-border text-xs font-mono text-accent-blue mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>ALGORITHMIC MENTAL MODELS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
          Mastering Recursion Under the Hood
        </h1>
        <p className="text-sm text-text-secondary mt-1 max-w-2xl">
          Comprehensive curriculum explaining memory layouts, activation frames, recurrence relations, and call stack invariants.
        </p>
      </div>

      {/* Grid Layout: Sidebar of Lessons & Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lesson Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          {lessons.map((lesson, idx) => {
            const Icon = lesson.icon;
            const isActive = activeLesson === idx;

            return (
              <button
                key={lesson.id}
                onClick={() => setActiveLesson(idx)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? "border-accent-blue bg-container text-text-primary shadow-glow-blue"
                    : "border-border bg-panel text-text-secondary hover:bg-container hover:text-text-primary"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${isActive ? "bg-accent-blue/20 text-accent-blue" : "bg-container text-text-muted"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold">
                    {lesson.title}
                  </span>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />}
              </button>
            );
          })}
        </div>

        {/* Main Lesson Content (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-xl border border-border bg-panel shadow-lg">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
            <h2 className="text-xl font-bold text-text-primary">
              {lessons[activeLesson].title}
            </h2>
          </div>

          {lessons[activeLesson].content}
        </div>
      </div>
    </div>
  );
};

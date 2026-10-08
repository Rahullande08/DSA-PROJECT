"use client";

import React, { useState } from "react";
import { Header } from "../components/Header";
import { LandingView } from "../components/Landing/LandingView";
import { VisualizerView } from "../components/Visualizer/VisualizerView";
import { FibonacciMemoView } from "../components/Fibonacci/FibonacciMemoView";
import { PracticeView } from "../components/Practice/PracticeView";
import { QAAssistant } from "../components/QAAssistant/QAAssistant";
import { AsciiSweep } from "../components/AsciiSweep";
import { AlgorithmId } from "../types/recursion";
import { RuntimeContext } from "../lib/qaKnowledge";
import { MessageSquare } from "lucide-react";

const TAB_INDEX_MAP: Record<"overview" | "visualizer" | "fibonacci" | "practice", number> = {
  overview: 0,
  visualizer: 1,
  fibonacci: 2,
  practice: 3,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "visualizer" | "fibonacci" | "practice">("visualizer");
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmId>("factorial");
  const [isQAOpen, setIsQAOpen] = useState<boolean>(false);
  const [runtimeContext, setRuntimeContext] = useState<RuntimeContext | undefined>(undefined);

  const activeTabIndex = TAB_INDEX_MAP[activeTab] ?? 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] text-text-primary selection:bg-accent-blue selection:text-canvas">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedAlgo={selectedAlgo}
        setSelectedAlgo={setSelectedAlgo}
        onOpenQA={() => setIsQAOpen(true)}
      />

      {/* Main Viewport Screen Switcher with Dynamic Directional ASCII Sweep */}
      <main className="flex-1 relative">
        <AsciiSweep
          index={activeTabIndex}
          directional={true}
          duration={850}
          colorMode={activeTab === "fibonacci" ? "purple" : activeTab === "practice" ? "mint" : "blue"}
          className="min-h-[calc(100vh-120px)]"
        >
          {/* Panel 0: Overview */}
          <LandingView
            onStartExploring={() => setActiveTab("visualizer")}
            onSelectAlgo={(algo) => {
              setSelectedAlgo(algo);
              if (algo === "fibonacci" || algo === "fibonacci_memo") {
                setActiveTab("fibonacci");
              } else {
                setActiveTab("visualizer");
              }
            }}
          />

          {/* Panel 1: Factorial / Linear Visualizer */}
          <VisualizerView
            selectedAlgo={selectedAlgo}
            setSelectedAlgo={setSelectedAlgo}
            onOpenQA={() => setIsQAOpen(true)}
            onUpdateContext={(ctx) => setRuntimeContext(ctx)}
          />

          {/* Panel 2: Fibonacci & Memoization */}
          <FibonacciMemoView
            onOpenQA={() => setIsQAOpen(true)}
            onUpdateContext={(ctx) => setRuntimeContext(ctx)}
          />

          {/* Panel 3: Practice & Challenges */}
          <PracticeView />
        </AsciiSweep>
      </main>

      {/* Floating Ask AI Button for Quick Learner Help */}
      <button
        onClick={() => setIsQAOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent-blue hover:bg-accent-blue/90 text-canvas font-mono text-xs font-bold shadow-2xl shadow-accent-blue/40 border border-accent-blue/50 transition-all hover:scale-105"
      >
        <MessageSquare className="w-4 h-4 fill-current" />
        <span>Ask AI Tutor</span>
      </button>

      {/* Interactive Two-Way Q&A Assistant Drawer */}
      <QAAssistant
        isOpen={isQAOpen}
        onClose={() => setIsQAOpen(false)}
        currentAlgo={selectedAlgo}
        runtimeContext={runtimeContext}
      />

      {/* System Telemetry Footer */}
      <footer className="border-t border-border bg-[#0D1015] py-3.5 px-4 lg:px-8 text-[11px] font-mono text-text-muted mt-auto">
        <div className="max-w-[1780px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
              <span>ASCII Trace Engine v2.4</span>
            </span>
            <span>•</span>
            <span>Memory: Clean</span>
            <span>•</span>
            <span>Stack: {runtimeContext?.currentStackDepth || 0} frames</span>
            <span>•</span>
            <span className="text-accent-mint">ENGINE: READY</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab("overview")} className="hover:text-text-primary">Home</button>
            <span>•</span>
            <button onClick={() => setActiveTab("visualizer")} className="hover:text-text-primary">Factorial Visualizer</button>
            <span>•</span>
            <button onClick={() => setActiveTab("fibonacci")} className="hover:text-text-primary">Fibonacci Tree</button>
            <span>•</span>
            <button onClick={() => setActiveTab("practice")} className="hover:text-text-primary">Stack Quiz</button>
            <span>•</span>
            <span>© 2026 RecursionStudio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

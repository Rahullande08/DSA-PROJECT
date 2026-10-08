"use client";

import React from "react";
import { AlgorithmId } from "../types/recursion";
import { 
  ChevronDown,
  User,
  Terminal,
  Code,
  MessageSquare,
  Sparkles
} from "lucide-react";

interface HeaderProps {
  activeTab: "overview" | "visualizer" | "fibonacci" | "practice";
  setActiveTab: (tab: "overview" | "visualizer" | "fibonacci" | "practice") => void;
  selectedAlgo: AlgorithmId;
  setSelectedAlgo: (algo: AlgorithmId) => void;
  onOpenQA?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedAlgo,
  setSelectedAlgo,
  onOpenQA,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#08090B] px-4 lg:px-6 py-2">
      <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-6">
          {/* Brand */}
          <button 
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2 text-left group"
          >
            <span className="font-bold text-text-primary text-[15px] tracking-tight">
              RecursionStudio
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase rounded bg-[#11151B] border border-border text-text-muted">
              V2.4 • ASCII SWEEP
            </span>
          </button>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === "overview"
                  ? "bg-[#1f2022] text-text-primary font-semibold border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveTab("visualizer")}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === "visualizer"
                  ? "bg-[#1f2022] text-text-primary font-semibold border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Interactive Visualizer
            </button>

            <button
              onClick={() => setActiveTab("fibonacci")}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === "fibonacci"
                  ? "bg-[#1f2022] text-text-primary font-semibold border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Fibonacci & Memoization
            </button>

            <button
              onClick={() => setActiveTab("practice")}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === "practice"
                  ? "bg-[#1f2022] text-text-primary font-semibold border border-border"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Practice & Challenges
            </button>
          </nav>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2.5">
          {/* Algo Dropdown */}
          <div className="relative hidden sm:block">
            <select
              value={selectedAlgo}
              onChange={(e) => {
                const val = e.target.value as AlgorithmId;
                setSelectedAlgo(val);
                if (val === "fibonacci" || val === "fibonacci_memo") {
                  setActiveTab("fibonacci");
                } else {
                  setActiveTab("visualizer");
                }
              }}
              className="appearance-none bg-[#11151B] hover:bg-[#191F28] border border-border focus:border-accent-blue text-text-primary text-xs font-mono py-1.5 pl-3 pr-7 rounded transition-colors cursor-pointer outline-none"
            >
              <option value="factorial">ALGO Factorial(n)</option>
              <option value="fibonacci">ALGO Fibonacci(n)</option>
              <option value="fibonacci_memo">ALGO Memoized Fibonacci</option>
              <option value="binary_search">ALGO Binary Search</option>
              <option value="hanoi">ALGO Tower of Hanoi</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Ask AI Tutor Trigger */}
          {onOpenQA && (
            <button
              onClick={onOpenQA}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#11151B] hover:bg-[#191F28] border border-border text-accent-blue text-[11px] font-mono transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          )}

          <span className="hidden lg:inline-block px-2.5 py-1 rounded bg-[#11151B] border border-border text-[11px] font-mono text-text-secondary">
            Guided Explore
          </span>

          {/* Engine Ready Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#11151B] border border-border text-[11px] font-mono text-accent-mint">
            <span className="w-2 h-2 rounded-full bg-accent-mint" />
            <span>ENGINE: READY</span>
          </div>

          {/* Terminal / Code Icon */}
          <button
            onClick={() => setActiveTab(activeTab === "visualizer" ? "overview" : "visualizer")}
            className="p-1.5 rounded bg-[#11151B] border border-border hover:border-accent-blue text-text-muted hover:text-text-primary transition-colors"
            title="Toggle Visualizer"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          {/* User Icon */}
          <div className="w-7 h-7 rounded-full bg-[#11151B] border border-border flex items-center justify-center text-text-muted">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </header>
  );
};

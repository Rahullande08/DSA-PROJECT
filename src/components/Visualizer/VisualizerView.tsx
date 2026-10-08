"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Zap, 
  Minus, 
  Plus, 
  Terminal, 
  Layers, 
  Network, 
  Cpu,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { AlgorithmId, ExecutionStep } from "../../types/recursion";
import { ALGORITHMS } from "../../lib/algorithms";
import { CodeEditor } from "./CodeEditor";
import { CallStackInspector } from "./CallStackInspector";
import { TreeVisualizer } from "./TreeVisualizer";
import { ControlTransport } from "./ControlTransport";
import { MentalModelsSection } from "./MentalModelsSection";
import { AsciiSweepCanvas } from "../AsciiSweep/AsciiSweepCanvas";

interface VisualizerViewProps {
  selectedAlgo: AlgorithmId;
  setSelectedAlgo: (algo: AlgorithmId) => void;
  onOpenQA?: () => void;
  onUpdateContext?: (ctx: any) => void;
}

export const VisualizerView: React.FC<VisualizerViewProps> = ({
  selectedAlgo,
  setSelectedAlgo,
  onOpenQA,
  onUpdateContext,
}) => {
  const algoDef = ALGORITHMS[selectedAlgo] || ALGORITHMS.factorial;

  const [params, setParams] = useState<Record<string, any>>(algoDef.defaultParams);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const workbenchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setParams(algoDef.defaultParams);
  }, [selectedAlgo]);

  const steps: ExecutionStep[] = useMemo(() => {
    return algoDef.generateSteps(params);
  }, [algoDef, params]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeSubTab, setActiveSubTab] = useState<"source_stack" | "tree" | "registers">("source_stack");

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (onUpdateContext && currentStep) {
      onUpdateContext({
        algorithm: algoDef.name,
        n: params.n || 4,
        stepIndex: currentStepIndex,
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
  }, [currentStepIndex, steps, algoDef.name, params.n, onUpdateContext]);

  // Auto-scroll workbench into view when playback begins or on explicit trigger
  const scrollToWorkbench = (smooth = true) => {
    if (workbenchRef.current) {
      const rect = workbenchRef.current.getBoundingClientRect();
      const isComfortablyVisible = rect.top >= 60 && rect.bottom <= window.innerHeight + 150;
      if (!isComfortablyVisible) {
        workbenchRef.current.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "start",
        });
      }
    }
  };

  // Auto-play interval timer with smooth view tracking
  useEffect(() => {
    if (!isPlaying) return;

    scrollToWorkbench(true);

    const intervalTime = Math.max(1200 / speed, 250);
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, speed, steps.length]);

  const currentStep = steps[currentStepIndex] || steps[0];

  const handleAdjustParam = (name: string, delta: number, min = 1, max = 7) => {
    const val = Number(params[name] || 4) + delta;
    if (val >= min && val <= max) {
      setParams((prev) => ({ ...prev, [name]: val }));
      triggerSweep();
    }
  };

  const triggerSweep = () => {
    setIsSweeping(true);
  };

  const handleNodeClick = (nodeId: string) => {
    // Jump to the first step where this node is active or resolved
    const targetIdx = steps.findIndex(
      (s) => s.activeTreeNodeId === nodeId || s.treeNodes[nodeId]?.status === "running"
    );
    if (targetIdx !== -1) {
      setCurrentStepIndex(targetIdx);
      scrollToWorkbench(true);
    }
  };

  const currentN = params.n || params.target || 4;

  return (
    <div ref={workbenchRef} className="max-w-[1780px] mx-auto px-4 lg:px-6 py-6 space-y-5 relative scroll-mt-16">
      {/* Authentic ASCII Sweep Canvas */}
      <AsciiSweepCanvas
        isActive={isSweeping}
        onComplete={() => setIsSweeping(false)}
        colorMode="blue"
        durationMs={850}
      />

      {/* Top Breadcrumbs & Hero Headline */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
            <span className="text-text-muted">Learn / Recursion /</span>
            <span className="text-text-primary font-semibold">Interactive Visualizer</span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-blue/15 border border-accent-blue/40 text-accent-blue font-bold text-[10px] ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
              ASCII SWEEP ENGINE ACTIVE
            </span>
            <span className="px-2 py-0.5 rounded bg-[#11151B] border border-border text-text-muted text-[10px]">
              MEM: ISOLATED SANDBOX
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight">
            Watch recursion unfold.
          </h1>
          <p className="text-xs text-text-secondary mt-1 max-w-2xl">
            See recursion. Understand every call. Follow the code, explore the stack, and watch every return value come to life.
          </p>
        </div>

        {/* Algorithm Quick Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0D1015] p-2 rounded-lg border border-border">
          {/* Algo Pills */}
          <div className="flex items-center bg-[#11151B] border border-border rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => {
                setSelectedAlgo("factorial");
                triggerSweep();
              }}
              className={`px-3 py-1 rounded transition-colors ${
                selectedAlgo === "factorial"
                  ? "bg-[#1f2022] text-text-primary font-bold border border-border"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Factorial(n)
            </button>
            <button
              onClick={() => {
                setSelectedAlgo("fibonacci");
                triggerSweep();
              }}
              className={`px-3 py-1 rounded transition-colors ${
                selectedAlgo === "fibonacci"
                  ? "bg-[#1f2022] text-text-primary font-bold border border-border"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Fibonacci(n)
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-1.5 bg-[#11151B] px-2.5 py-1 rounded border border-border font-mono text-xs">
            <span className="text-text-muted font-bold">n =</span>
            <button
              onClick={() => handleAdjustParam("n", -1, 1, 7)}
              className="p-0.5 rounded hover:bg-[#1f2022] text-text-secondary hover:text-text-primary"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center font-bold text-text-primary">
              {currentN}
            </span>
            <button
              onClick={() => handleAdjustParam("n", 1, 1, 7)}
              className="p-0.5 rounded hover:bg-[#1f2022] text-text-secondary hover:text-text-primary"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* SWEEP TRACE button (with Auto-Scroll) */}
          <button
            onClick={() => {
              triggerSweep();
              setCurrentStepIndex(0);
              setIsPlaying(true);
              scrollToWorkbench(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-blue hover:bg-accent-blue/90 text-canvas font-mono text-xs font-bold shadow-glow-blue transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>SWEEP TRACE</span>
          </button>

          {/* Ask Tutor Action */}
          {onOpenQA && (
            <button
              onClick={onOpenQA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#11151B] hover:bg-[#191F28] border border-border text-accent-mint font-mono text-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Tutor</span>
            </button>
          )}

          <span className="px-2 py-1 rounded bg-[#11151B] border border-border text-[10px] font-mono font-bold uppercase text-text-muted">
            GUIDED EXPLORE
          </span>
        </div>
      </div>

      {/* Sub-view switcher bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#11151B] p-1 rounded-md border border-border">
          <button
            onClick={() => {
              setActiveSubTab("source_stack");
              triggerSweep();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeSubTab === "source_stack"
                ? "bg-[#1f2022] text-text-primary font-bold shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-accent-blue" />
            <span>Source & Call Stack</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("tree");
              triggerSweep();
              const el = document.getElementById("recursion-tree-visualizer");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeSubTab === "tree"
                ? "bg-[#1f2022] text-text-primary font-bold shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <Network className="w-3.5 h-3.5 text-accent-purple" />
            <span>Full Recursion Tree</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab("registers");
              triggerSweep();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              activeSubTab === "registers"
                ? "bg-[#1f2022] text-text-primary font-bold shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-accent-mint" />
            <span>Register State</span>
          </button>
        </div>

        {/* Telemetry Status Right */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-mint" />
            <span>Unwind Returns Resolved:</span>
            <strong className="text-accent-mint font-bold">
              {currentStep.unwoundCount}
            </strong>
          </span>
          <span>|</span>
          <span>
            Max Call Depth:{" "}
            <strong className="text-text-primary font-bold">
              {currentStep.maxDepthReached}
            </strong>
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid: Code Editor on Left, Call Stack on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 flex flex-col min-h-[380px]">
          <CodeEditor algorithm={algoDef} currentStep={currentStep} />
        </div>

        <div className="lg:col-span-7 flex flex-col min-h-[380px]">
          <CallStackInspector currentStep={currentStep} />
        </div>
      </div>

      {/* Recursion Call Tree & Unwind Trace Canvas */}
      <TreeVisualizer
        currentStep={currentStep}
        algoCategory={algoDef.category}
        onNodeClick={handleNodeClick}
      />

      {/* Playback Transport Bar */}
      <ControlTransport
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        speed={speed}
        onStepChange={(idx) => {
          setCurrentStepIndex(idx);
          scrollToWorkbench(true);
        }}
        onPlayToggle={() => setIsPlaying(!isPlaying)}
        onSpeedChange={(s) => setSpeed(s)}
        onReset={() => {
          setCurrentStepIndex(0);
          setIsPlaying(false);
          triggerSweep();
        }}
        branchingLabel={`Branching: ${algoDef.name} (Step ${currentStepIndex + 1}/${steps.length})`}
      />

      {/* Deep Mental Models Section */}
      <MentalModelsSection />
    </div>
  );
};

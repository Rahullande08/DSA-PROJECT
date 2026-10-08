"use client";

import React, { useState } from "react";
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { ExecutionStep, TreeNode } from "../../types/recursion";
import { FibonacciCallTree } from "../Fibonacci/FibonacciCallTree";

interface TreeVisualizerProps {
  currentStep: ExecutionStep;
  algoCategory: string;
  onNodeClick?: (nodeId: string) => void;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({
  currentStep,
  algoCategory,
  onNodeClick,
}) => {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<"graph" | "ascii">("graph");

  const isBinaryTree =
    algoCategory.includes("Binary") ||
    algoCategory.includes("Dynamic") ||
    (currentStep.treeRootId && currentStep.treeRootId.startsWith("node_root"));

  if (isBinaryTree && viewMode !== "ascii") {
    return (
      <div id="recursion-tree-visualizer" className="scroll-mt-20">
        <FibonacciCallTree
          currentStep={currentStep}
          highlightRedundant={true}
          pruneCached={false}
          onNodeSelect={onNodeClick}
        />
      </div>
    );
  }

  const nodes = Object.values(currentStep.treeNodes);

  // Group nodes by depth for layout
  const nodesByDepth: Record<number, TreeNode[]> = {};
  nodes.forEach((node) => {
    if (!nodesByDepth[node.depth]) {
      nodesByDepth[node.depth] = [];
    }
    nodesByDepth[node.depth].push(node);
  });

  const sortedDepths = Object.keys(nodesByDepth)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div id="recursion-tree-visualizer" className="rounded-lg border border-border bg-[#0D1015] overflow-hidden flex flex-col shadow-lg scroll-mt-20">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#11151B] border-b border-border">
        <div className="flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-accent-blue" />
          <span className="font-mono text-xs font-semibold text-text-primary tracking-tight">
            Recursion Call Tree & Unwind Trace
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#191F28] border border-border text-text-muted">
            {algoCategory.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#0D1015] border border-border rounded p-0.5">
            <button
              onClick={() => setViewMode("graph")}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                viewMode === "graph"
                  ? "bg-[#1f2022] text-text-primary font-medium border border-border"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              Graph Canvas
            </button>
            <button
              onClick={() => setViewMode("ascii")}
              className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                viewMode === "ascii"
                  ? "bg-[#1f2022] text-text-primary font-medium border border-border"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              ASCII Mode
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-[#11151B] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-[#11151B] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded text-text-muted hover:text-text-primary hover:bg-[#11151B] transition-colors"
              title="Fit View"
            >
              <Maximize2 className="w-3 h-3" />
              <span>FIT VIEW</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        className="p-6 bg-[#08090B] min-h-[260px] max-h-[440px] overflow-auto flex items-center justify-center relative bg-grid-pattern"
        style={{
          overflowAnchor: "none",
          contain: "paint layout",
        }}
      >
        {viewMode === "ascii" ? (
          <div className="w-full h-full p-4 font-mono text-xs text-text-primary bg-[#0D1015] rounded border border-border overflow-x-auto whitespace-pre leading-relaxed">
            {currentStep.asciiSnapshot || "Initializing ASCII sweep tracer..."}
          </div>
        ) : (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            className="transition-transform duration-200 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 py-4 px-2"
          >
            {sortedDepths.length === 0 ? (
              <div className="text-text-muted text-xs font-mono">No active calls</div>
            ) : (
              sortedDepths.map((depth, dIdx) => {
                const depthNodes = nodesByDepth[depth] || [];

                return (
                  <div key={depth} className="flex flex-row md:flex-col items-center gap-4">
                    <div className="flex flex-col gap-3">
                      {depthNodes.map((node) => {
                        const isRunning = node.status === "running";
                        const isWaiting = node.status === "waiting";
                        const isBase = node.status === "base";
                        const isResolved = node.status === "resolved";

                        return (
                          <button
                            key={node.id}
                            onClick={() => onNodeClick && onNodeClick(node.id)}
                            className={`px-4 py-2.5 rounded-lg border text-center transition-all duration-300 min-w-[120px] cursor-pointer hover:scale-105 ${
                              isRunning
                                ? "border-accent-blue bg-[#11151B] shadow-glow-blue scale-105"
                                : isWaiting
                                ? "border-dashed border-accent-amber/70 bg-[#0D1015] text-text-secondary"
                                : isBase
                                ? "border-accent-coral bg-[#11151B] shadow-glow-coral"
                                : isResolved
                                ? "border-accent-mint bg-[#11151B] shadow-glow-mint"
                                : "border-border/50 bg-[#0D1015]/50 text-text-muted"
                            }`}
                          >
                            <div className="font-mono text-xs font-bold text-text-primary">
                              {node.label}
                            </div>
                            <div
                              className={`font-mono text-[11px] mt-0.5 ${
                                isResolved
                                  ? "text-accent-mint font-semibold"
                                  : isBase
                                  ? "text-accent-coral font-semibold"
                                  : isWaiting
                                  ? "text-accent-amber"
                                  : isRunning
                                  ? "text-accent-blue"
                                  : "text-text-muted"
                              }`}
                            >
                              {node.argsStr}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Arrow between levels */}
                    {dIdx < sortedDepths.length - 1 && (
                      <div className="flex items-center justify-center text-text-muted font-mono text-xs select-none">
                        <span className="hidden md:inline">→</span>
                        <span className="inline md:hidden">↓</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer Metrics Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border-t border-border bg-[#11151B] text-[11px] font-mono divide-y sm:divide-y-0 sm:divide-x divide-border">
        <div className="p-2.5">
          <div className="text-text-muted uppercase text-[9px] font-bold tracking-wider mb-0.5">
            TOTAL CALLS
          </div>
          <div className="text-text-primary font-bold">
            {currentStep.totalCalls} Invocations
          </div>
        </div>

        <div className="p-2.5">
          <div className="text-text-muted uppercase text-[9px] font-bold tracking-wider mb-0.5">
            CURRENT STACK
          </div>
          <div className="text-accent-blue font-bold">
            {currentStep.currentStackDepth} frames active
          </div>
        </div>

        <div className="p-2.5">
          <div className="text-text-muted uppercase text-[9px] font-bold tracking-wider mb-0.5">
            MAX MEMORY
          </div>
          <div className="text-text-secondary font-bold">
            {currentStep.maxDepthReached} frames peak
          </div>
        </div>

        <div className="p-2.5">
          <div className="text-text-muted uppercase text-[9px] font-bold tracking-wider mb-0.5">
            PENDING OPS
          </div>
          <div className="text-accent-amber font-bold">
            {currentStep.pendingOpsCount} operation(s)
          </div>
        </div>

        <div className="p-2.5 col-span-2 sm:col-span-1">
          <div className="text-text-muted uppercase text-[9px] font-bold tracking-wider mb-0.5">
            RESULT TARGET
          </div>
          <div className="text-accent-mint font-bold">
            {currentStep.resultTarget !== undefined
              ? String(currentStep.resultTarget)
              : "Resolving..."}
          </div>
        </div>
      </div>
    </div>
  );
};

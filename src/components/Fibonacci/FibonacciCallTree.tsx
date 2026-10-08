"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  GitBranch, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Check, 
  Zap, 
  Info, 
  Layers, 
  ChevronRight,
  Activity,
  RotateCcw
} from "lucide-react";
import { TreeNode, ExecutionStep } from "../../types/recursion";

interface FibonacciCallTreeProps {
  currentStep: ExecutionStep;
  highlightRedundant?: boolean;
  pruneCached?: boolean;
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
  className?: string;
}

interface NodeLayout {
  id: string;
  node: TreeNode;
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeWidth: number;
  children: NodeLayout[];
}

export const FibonacciCallTree: React.FC<FibonacciCallTreeProps> = ({
  currentStep,
  highlightRedundant = true,
  pruneCached = false,
  onNodeSelect,
  selectedNodeId: propSelectedNodeId,
  className = "",
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(propSelectedNodeId || null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeNodeRef = useRef<HTMLDivElement | null>(null);

  const NODE_WIDTH = 136;
  const NODE_HEIGHT = 64;
  const H_GAP = 18;
  const V_GAP = 96;

  // Sync prop selectedNodeId
  useEffect(() => {
    if (propSelectedNodeId !== undefined) {
      setSelectedNodeId(propSelectedNodeId);
    }
  }, [propSelectedNodeId]);

  // If active node changes and no manual selection, set selected
  useEffect(() => {
    if (currentStep.activeTreeNodeId && !selectedNodeId) {
      setSelectedNodeId(currentStep.activeTreeNodeId);
    }
  }, [currentStep.activeTreeNodeId]);

  // Smooth auto-scroll tracking active node strictly inside container without window reflow
  useEffect(() => {
    if (activeNodeRef.current && containerRef.current) {
      const container = containerRef.current;
      const el = activeNodeRef.current;

      const elLeft = el.offsetLeft;
      const elTop = el.offsetTop;
      const elWidth = el.offsetWidth;
      const elHeight = el.offsetHeight;

      // Scale-adjusted centering inside container only
      const targetScrollLeft = elLeft * zoom - (container.clientWidth - elWidth * zoom) / 2;
      const targetScrollTop = elTop * zoom - (container.clientHeight - elHeight * zoom) / 2;

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    }
  }, [currentStep.activeTreeNodeId, zoom]);

  const treeNodes = currentStep.treeNodes;
  const rootId = currentStep.treeRootId;

  // Compute hierarchical tree layout
  const { rootLayout, allLayouts, bounds } = useMemo(() => {
    if (!rootId || !treeNodes[rootId]) {
      return { rootLayout: null, allLayouts: new Map<string, NodeLayout>(), bounds: { width: 400, height: 300 } };
    }

    const layoutMap = new Map<string, NodeLayout>();

    // 1. Calculate subtree widths recursively
    function computeSubtree(id: string, depth = 1): NodeLayout {
      const node = treeNodes[id];
      if (!node) {
        return {
          id,
          node: { id, label: id, argsStr: "", depth, children: [], status: "idle" },
          x: 0,
          y: (depth - 1) * V_GAP,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          subtreeWidth: NODE_WIDTH + H_GAP,
          children: [],
        };
      }

      // Check if pruned due to memo cache
      const isPruned = pruneCached && node.cached;
      const childLayouts: NodeLayout[] = [];

      if (!isPruned && node.children && node.children.length > 0) {
        for (const childId of node.children) {
          if (treeNodes[childId]) {
            childLayouts.push(computeSubtree(childId, depth + 1));
          }
        }
      }

      let subtreeWidth = NODE_WIDTH + H_GAP;
      if (childLayouts.length > 0) {
        const totalChildrenWidth = childLayouts.reduce((sum, c) => sum + c.subtreeWidth, 0);
        subtreeWidth = Math.max(subtreeWidth, totalChildrenWidth);
      }

      const layout: NodeLayout = {
        id,
        node,
        x: 0,
        y: (depth - 1) * V_GAP,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        subtreeWidth,
        children: childLayouts,
      };

      layoutMap.set(id, layout);
      return layout;
    }

    const root = computeSubtree(rootId, 1);

    // 2. Assign absolute x coordinates
    function assignPositions(layout: NodeLayout, startX: number) {
      if (layout.children.length === 0) {
        layout.x = startX + (layout.subtreeWidth - layout.width) / 2;
      } else if (layout.children.length === 1) {
        const child = layout.children[0];
        assignPositions(child, startX);
        layout.x = child.x + (child.width - layout.width) / 2;
      } else {
        let curX = startX;
        for (const child of layout.children) {
          assignPositions(child, curX);
          curX += child.subtreeWidth;
        }
        const firstChild = layout.children[0];
        const lastChild = layout.children[layout.children.length - 1];
        layout.x = (firstChild.x + lastChild.x) / 2;
      }
    }

    const PADDING_X = 60;
    const PADDING_Y = 40;
    assignPositions(root, PADDING_X);

    // Calculate bounding box
    let minX = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    layoutMap.forEach((l) => {
      if (l.x < minX) minX = l.x;
      if (l.x + l.width > maxX) maxX = l.x + l.width;
      if (l.y + l.height > maxY) maxY = l.y + l.height;
    });

    const totalWidth = Math.max(maxX + PADDING_X, 600);
    const totalHeight = Math.max(maxY + PADDING_Y + 40, 320);

    return {
      rootLayout: root,
      allLayouts: layoutMap,
      bounds: { width: totalWidth, height: totalHeight },
    };
  }, [treeNodes, rootId, pruneCached]);

  // Extract selected node details
  const activeSelectedNode = selectedNodeId && treeNodes[selectedNodeId] ? treeNodes[selectedNodeId] : null;

  // Handle clicking node
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    if (onNodeSelect) {
      onNodeSelect(nodeId);
    }
  };

  return (
    <div
      className={`rounded-lg border border-border bg-[#0D1015] overflow-hidden flex flex-col shadow-xl relative transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 shadow-2xl bg-[#08090B]" : ""
      } ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-[#11151B] border-b border-border text-xs font-mono gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-accent-purple" />
          <span className="font-semibold text-text-primary">
            Dual Branching Call Tree (Visual AST)
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-purple/15 text-accent-purple border border-accent-purple/30">
            {allLayouts.size} INVOCATIONS
          </span>
          {currentStep.activeTreeNodeId && (
            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-blue/15 text-accent-blue border border-accent-blue/30">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
              <span>ACTIVE: {treeNodes[currentStep.activeTreeNodeId]?.label || currentStep.activeTreeNodeId}</span>
            </span>
          )}
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#0D1015] p-0.5 rounded border border-border">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.45))}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-[#1f2022] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-text-muted px-1 min-w-[32px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 1.8))}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-[#1f2022] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-1.5 py-0.5 text-[10px] font-mono rounded text-text-muted hover:text-text-primary hover:bg-[#1f2022] transition-colors"
              title="Reset Zoom"
            >
              100%
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded bg-[#0D1015] border border-border text-text-muted hover:text-text-primary hover:bg-[#1f2022] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Maximize Tree Canvas"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        ref={containerRef}
        className="relative bg-[#08090B] overflow-auto flex-1 min-h-[340px] max-h-[560px] bg-grid-pattern select-none p-4"
        style={{
          cursor: "grab",
          overflowAnchor: "none",
          contain: "paint layout",
        }}
      >
        {/* Floating Legend */}
        <div className="sticky top-2 left-2 z-30 inline-flex flex-wrap items-center gap-3 px-2.5 py-1.5 rounded-md bg-[#11151B]/90 backdrop-blur border border-border text-[10px] font-mono text-text-muted shadow-md">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-blue shadow-glow-blue animate-pulse" />
            <span>Active Frame</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-amber" />
            <span>Waiting Parent</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-mint" />
            <span>Resolved / Base</span>
          </span>
          {highlightRedundant && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-purple shadow-glow-purple" />
              <span>Redundant Call</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-border" />
            <span>Pending</span>
          </span>
        </div>

        {/* Tree Container scaled with zoom */}
        <div
          style={{
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
          className="relative transition-transform duration-150 mx-auto"
        >
          {/* SVG Connection Layer */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={bounds.width}
            height={bounds.height}
          >
            <defs>
              <linearGradient id="activeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#34D399" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {Array.from(allLayouts.values()).map((parentLayout) => {
              return parentLayout.children.map((childLayout) => {
                const startX = parentLayout.x + parentLayout.width / 2;
                const startY = parentLayout.y + parentLayout.height;
                const endX = childLayout.x + childLayout.width / 2;
                const endY = childLayout.y;

                const midY = startY + (endY - startY) * 0.5;
                const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

                const isChildActive = childLayout.node.status === "running";
                const isChildResolved = childLayout.node.status === "resolved" || childLayout.node.status === "base";
                const isChildWaiting = childLayout.node.status === "waiting";
                const isChildRedundant = highlightRedundant && childLayout.node.isRedundant;

                let strokeColor = "#272B35";
                let strokeWidth = 1.5;
                let strokeDash = "none";

                if (isChildActive) {
                  strokeColor = "#3B82F6";
                  strokeWidth = 2.5;
                } else if (isChildResolved) {
                  strokeColor = "#10B981";
                  strokeWidth = 2;
                } else if (isChildWaiting) {
                  strokeColor = "#F59E0B";
                  strokeWidth = 1.5;
                  strokeDash = "4 3";
                } else if (isChildRedundant) {
                  strokeColor = "#A855F7";
                  strokeWidth = 1.5;
                  strokeDash = "3 3";
                }

                // Branch pill label coordinate
                const labelX = (startX + endX) / 2;
                const labelY = (startY + endY) / 2;
                const branchText = childLayout.node.branch === "left" ? "n-1" : childLayout.node.branch === "right" ? "n-2" : "";

                return (
                  <g key={`${parentLayout.id}-${childLayout.id}`}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDash}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                    {branchText && (
                      <g transform={`translate(${labelX}, ${labelY})`}>
                        <rect
                          x="-11"
                          y="-7"
                          width="22"
                          height="14"
                          rx="4"
                          fill="#0D1015"
                          stroke={isChildActive ? "#3B82F6" : "#272B35"}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill={isChildActive ? "#60A5FA" : "#6B7280"}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {branchText}
                        </text>
                      </g>
                    )}
                  </g>
                );
              });
            })}
          </svg>

          {/* HTML Interactive Nodes Layer */}
          {Array.from(allLayouts.values()).map((layout) => {
            const { id, node, x, y, width, height } = layout;
            const isActive = currentStep.activeTreeNodeId === id || node.status === "running";
            const isWaiting = node.status === "waiting";
            const isBase = node.status === "base";
            const isResolved = node.status === "resolved";
            const isIdle = node.status === "idle";
            const isSelected = selectedNodeId === id;
            const isRedun = highlightRedundant && node.isRedundant;
            const isCached = node.cached;

            return (
              <div
                key={id}
                ref={isActive ? activeNodeRef : undefined}
                onClick={() => handleNodeClick(id)}
                style={{
                  position: "absolute",
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                }}
                className={`group cursor-pointer rounded-xl border font-mono transition-all duration-300 flex flex-col justify-between p-2 text-left select-none ${
                  isActive
                    ? "border-accent-blue bg-[#11151B] shadow-[0_0_22px_rgba(59,130,246,0.4)] ring-1 ring-accent-blue scale-105 z-20"
                    : isSelected
                    ? "border-accent-mint bg-[#11151B] ring-1 ring-accent-mint z-10 shadow-lg"
                    : isBase
                    ? "border-accent-coral/80 bg-[#11151B] shadow-[0_0_14px_rgba(255,107,107,0.25)] hover:border-accent-coral"
                    : isResolved
                    ? "border-accent-mint/70 bg-[#11151B] shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:border-accent-mint"
                    : isWaiting
                    ? "border-dashed border-accent-amber/70 bg-[#0D1015] hover:border-accent-amber"
                    : isRedun
                    ? "border-accent-purple/60 bg-[#11151B] shadow-[0_0_12px_rgba(168,85,247,0.2)] hover:border-accent-purple"
                    : "border-border/50 bg-[#0D1015]/60 hover:border-border hover:bg-[#11151B] opacity-75 hover:opacity-100"
                }`}
              >
                {/* Top Row: Function Signature + Branch/Redun Badge */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold truncate ${
                      isActive
                        ? "text-accent-blue"
                        : isBase
                        ? "text-accent-coral"
                        : isResolved
                        ? "text-accent-mint"
                        : isWaiting
                        ? "text-accent-amber"
                        : isRedun
                        ? "text-accent-purple"
                        : "text-text-primary"
                    }`}
                  >
                    {node.label}
                  </span>

                  {/* Status Badge */}
                  {isActive && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-bold uppercase bg-accent-blue/20 text-accent-blue border border-accent-blue/40 animate-pulse">
                      RUN
                    </span>
                  )}
                  {isBase && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-bold uppercase bg-accent-coral/20 text-accent-coral border border-accent-coral/30">
                      BASE
                    </span>
                  )}
                  {isCached && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-bold uppercase bg-accent-mint/20 text-accent-mint border border-accent-mint/30">
                      HIT
                    </span>
                  )}
                  {!isActive && !isBase && !isCached && isRedun && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-bold uppercase bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
                      #{node.redundantCount}
                    </span>
                  )}
                  {isWaiting && !isActive && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-bold uppercase bg-accent-amber/20 text-accent-amber border border-accent-amber/30">
                      WAIT
                    </span>
                  )}
                </div>

                {/* Bottom Row: Evaluated Value / State */}
                <div className="flex items-center justify-between text-[10px] font-mono truncate mt-0.5">
                  {node.returnValue !== undefined ? (
                    <span className="text-accent-mint font-semibold truncate">
                      {isBase ? `return ${node.returnValue}` : `= ${node.returnValue}`}
                    </span>
                  ) : isWaiting ? (
                    <span className="text-accent-amber truncate text-[9px]">
                      {node.leftResult !== undefined ? `L=${node.leftResult} R=?` : "Awaiting..."}
                    </span>
                  ) : isActive ? (
                    <span className="text-accent-blue animate-pulse text-[9px]">
                      Executing...
                    </span>
                  ) : (
                    <span className="text-text-muted text-[9px]">
                      Pending
                    </span>
                  )}

                  <span className="text-[9px] text-text-muted capitalize">
                    {node.branch === "root" ? "Root" : node.branch}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Node Inspector Drawer / Bottom Details */}
      {activeSelectedNode && (
        <div className="border-t border-border bg-[#11151B] p-3 text-xs font-mono">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50 mb-2">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-accent-blue" />
              <span className="font-semibold text-text-primary">
                Node Inspector: <strong className="text-accent-blue">{activeSelectedNode.label}</strong>
              </span>
              <span className="text-text-muted text-[11px]">
                (ID: <code className="text-text-secondary">{activeSelectedNode.id}</code>)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  activeSelectedNode.status === "running"
                    ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/40"
                    : activeSelectedNode.status === "base"
                    ? "bg-accent-coral/20 text-accent-coral border border-accent-coral/40"
                    : activeSelectedNode.status === "resolved"
                    ? "bg-accent-mint/20 text-accent-mint border border-accent-mint/40"
                    : activeSelectedNode.status === "waiting"
                    ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/40"
                    : "bg-[#1f2022] text-text-muted border border-border"
                }`}
              >
                Status: {activeSelectedNode.status.toUpperCase()}
              </span>

              {activeSelectedNode.isRedundant && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-purple/20 text-accent-purple border border-accent-purple/40">
                  REDUNDANT SUBPROBLEM #{activeSelectedNode.redundantCount}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-text-muted block text-[10px]">ARGUMENT (N)</span>
              <span className="font-bold text-text-primary">n = {activeSelectedNode.n}</span>
            </div>

            <div>
              <span className="text-text-muted block text-[10px]">BRANCH POSITION</span>
              <span className="font-bold text-text-secondary capitalize">
                {activeSelectedNode.branch === "root"
                  ? "Root Invocation"
                  : `${activeSelectedNode.branch} Child (n - ${activeSelectedNode.branch === "left" ? 1 : 2})`}
              </span>
            </div>

            <div>
              <span className="text-text-muted block text-[10px]">SUBPROBLEMS DISPATCHED</span>
              <span className="font-bold text-text-primary">
                {activeSelectedNode.n !== undefined && activeSelectedNode.n > 1
                  ? `fib(${activeSelectedNode.n - 1}) & fib(${activeSelectedNode.n - 2})`
                  : "None (Base Case)"}
              </span>
            </div>

            <div>
              <span className="text-text-muted block text-[10px]">RETURN VALUE</span>
              <span className="font-bold text-accent-mint">
                {activeSelectedNode.returnValue !== undefined
                  ? String(activeSelectedNode.returnValue)
                  : "Not calculated yet"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export type AlgorithmId =
  | "factorial"
  | "fibonacci"
  | "fibonacci_memo"
  | "hanoi"
  | "binary_search"
  | "merge_sort"
  | "power";

export interface StackFrame {
  id: string;
  callId?: string;
  callNumber?: number;
  callLabel: string;
  funcName: string;
  args: Record<string, any>;
  locals?: Record<string, any>;
  currentLine?: number;
  lineSnippet?: string;
  state: "calling" | "active" | "waiting" | "returning" | "popped" | "base" | "completed";
  pendingOp?: string;
  memoryAddr: string;
  returnValue?: any;
  depth: number;
  callerId?: string;
  callerLabel?: string;
  highlightLine?: number;
}

export interface TreeNode {
  id: string;
  label: string;
  argsStr: string;
  depth: number;
  parentId?: string;
  children: string[];
  status: "idle" | "running" | "waiting" | "base" | "resolved";
  returnValue?: any;
  cached?: boolean;
  x?: number;
  y?: number;
  n?: number;
  branch?: "left" | "right" | "root";
  leftResult?: number;
  rightResult?: number;
  callOrder?: number;
  redundantCount?: number;
  isRedundant?: boolean;
}

export interface ExecutionStep {
  stepIndex: number;
  totalSteps: number;
  activeLine: number;
  description: string;
  conditionCheck?: string;
  nextAction?: string;
  activeFrameId?: string;
  frames: StackFrame[];
  treeNodes: Record<string, TreeNode>;
  treeRootId: string;
  activeTreeNodeId?: string;
  unwoundCount: number;
  maxDepthReached: number;
  totalCalls: number;
  currentStackDepth: number;
  pendingOpsCount: number;
  resultTarget?: any;
  currentMemoryPeak: number;
  asciiSnapshot: string;
  customData?: Record<string, any>;
}

export interface AlgorithmDefinition {
  id: AlgorithmId;
  name: string;
  signature: string;
  category: "Linear Recursion" | "Binary Branching" | "Divide & Conquer" | "Dynamic Programming";
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  defaultParams: Record<string, any>;
  paramConfig: {
    name: string;
    label: string;
    type: "number" | "array";
    min?: number;
    max?: number;
    step?: number;
    default: any;
  }[];
  codeSnippets: {
    python: string;
    javascript: string;
    cpp: string;
  };
  generateSteps: (params: Record<string, any>) => ExecutionStep[];
}

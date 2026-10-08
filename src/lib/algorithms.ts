import { AlgorithmDefinition, AlgorithmId, ExecutionStep, StackFrame, TreeNode } from "../types/recursion";

// Helper to format memory address simulation
function makeAddr(depth: number, id: number): string {
  const hex = (0x7ffd00 + depth * 0x10 + id).toString(16);
  return `0x${hex}`;
}

// ----------------------------------------------------
// 1. FACTORIAL
// ----------------------------------------------------
export const factorialDef: AlgorithmDefinition = {
  id: "factorial",
  name: "Factorial",
  signature: "factorial(n)",
  category: "Linear Recursion",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n) stack",
  description:
    "The canonical linear recursion pattern. Demonstrates call frame stacking, base-case evaluation, and ascending multiplicative unwinding.",
  defaultParams: { n: 4 },
  paramConfig: [
    { name: "n", label: "n", type: "number", min: 0, max: 7, default: 4 },
  ],
  codeSnippets: {
    python: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
    javascript: `function factorial(n) {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}`,
    cpp: `int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}`,
  },
  generateSteps: (params) => {
    const rawN = params.n !== undefined ? Number(params.n) : 4;
    const n = Math.min(Math.max(isNaN(rawN) ? 4 : rawN, 0), 7);
    const steps: ExecutionStep[] = [];
    let callCounter = 0;
    const treeNodes: Record<string, TreeNode> = {};

    // Build static tree initial structure
    const minN = n === 0 ? 0 : 1;
    for (let i = n; i >= minN; i--) {
      const id = `fact_${i}`;
      treeNodes[id] = {
        id,
        label: `fact(${i})`,
        argsStr: i <= 1 ? "BASE: 1" : `${i} * ?`,
        depth: n - i + 1,
        parentId: i < n ? `fact_${i + 1}` : undefined,
        children: i > 1 ? [`fact_${i - 1}`] : [],
        status: "idle",
      };
    }

    const frames: StackFrame[] = [];
    let unwound = 0;
    let maxDepth = 0;

    const codeLines = [
      "def factorial(n):",
      "    if n <= 1:",
      "        return 1",
      "    return n * factorial(n - 1)",
    ];

    function snapshot(
      line: number,
      desc: string,
      condition?: string,
      next?: string,
      activeTreeId?: string,
      activeFrameId?: string
    ) {
      maxDepth = Math.max(maxDepth, frames.length);
      const pendingCount = frames.filter((f) => f.state === "waiting").length;

      // Generate ascii representation
      const asciiLines: string[] = [];
      asciiLines.push(`=== FACTORIAL RECURSION TRACE (n = ${n}) ===`);
      for (let i = n; i >= minN; i--) {
        const id = `fact_${i}`;
        const node = treeNodes[id];
        if (!node) continue;
        const indent = "  ".repeat(n - i);
        const marker = node.status === "running" ? "▶" : node.status === "resolved" ? "✓" : "•";
        const valStr = node.returnValue !== undefined ? ` = ${node.returnValue}` : "";
        asciiLines.push(`${indent}${marker} fact(${i}) [${node.status}]${valStr}`);
      }

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0, // updated at end
        activeLine: line,
        description: desc,
        conditionCheck: condition,
        nextAction: next,
        activeFrameId: activeFrameId || (frames.length > 0 ? frames[frames.length - 1].id : undefined),
        frames: JSON.parse(JSON.stringify(frames)),
        treeNodes: JSON.parse(JSON.stringify(treeNodes)),
        treeRootId: `fact_${n}`,
        activeTreeNodeId: activeTreeId,
        unwoundCount: unwound,
        maxDepthReached: maxDepth,
        totalCalls: callCounter,
        currentStackDepth: frames.length,
        pendingOpsCount: pendingCount,
        resultTarget: frames.length > 0 ? (frames[0].returnValue || "24 (at n=4)") : undefined,
        currentMemoryPeak: maxDepth,
        asciiSnapshot: asciiLines.join("\n"),
      });
    }

    function sim(currN: number, parentFrameId?: string, parentLabel?: string): number {
      callCounter++;
      const currentCall = callCounter;
      const currentDepth = frames.length + 1;
      const callId = `call-${currentCall}`;
      const frameId = `frame_fact_${currN}_c${currentCall}`;
      const treeId = `fact_${currN}`;

      // 1. Enter function: Allocate frame on stack
      treeNodes[treeId].status = "running";
      const newFrame: StackFrame = {
        id: frameId,
        callId: callId,
        callNumber: currentCall,
        callLabel: `factorial(n=${currN})`,
        funcName: "factorial",
        args: { n: currN },
        locals: { n: currN },
        currentLine: 1,
        lineSnippet: codeLines[0],
        state: "active",
        memoryAddr: makeAddr(currentDepth, currentCall),
        depth: currentDepth,
        callerId: parentFrameId,
        callerLabel: parentLabel || (parentFrameId ? `factorial(n=${currN + 1})` : "Main / Top-level"),
        pendingOp: currN > 1 ? `${currN} * factorial(${currN - 1})` : undefined,
      };
      frames.push(newFrame);

      snapshot(
        1,
        `Invoking factorial(${currN}) with argument n = ${currN}. Pushed activation record [${callId}] onto call stack.`,
        undefined,
        `Evaluate base condition (n <= 1)`,
        treeId,
        frameId
      );

      // 2. Check base case (Line 2)
      const isBase = currN <= 1;
      const topFrame = frames[frames.length - 1];
      topFrame.currentLine = 2;
      topFrame.lineSnippet = codeLines[1];

      snapshot(
        2,
        `Testing base condition (n <= 1): (${currN} <= 1) is ${isBase ? "TRUE (Base case reached)" : "FALSE (Proceed to recursive call)"}.`,
        `(${currN} <= 1) -> ${isBase}`,
        isBase ? `Return 1 directly to caller` : `Prepare recursive call factorial(${currN - 1})`,
        treeId,
        frameId
      );

      if (isBase) {
        // Base case return (Line 3)
        treeNodes[treeId].status = "base";
        treeNodes[treeId].returnValue = 1;
        treeNodes[treeId].argsStr = "BASE: 1";
        
        topFrame.currentLine = 3;
        topFrame.lineSnippet = codeLines[2];
        topFrame.state = "base";
        topFrame.returnValue = 1;
        topFrame.locals = { n: currN, returnValue: 1 };

        snapshot(
          3,
          `Base case reached! factorial(${currN}) returns 1. Stack unwinding begins.`,
          `return 1`,
          `POP frame [${callId}] from stack and return to caller`,
          treeId,
          frameId
        );

        unwound++;
        frames.pop();
        return 1;
      }

      // 3. Pause & make recursive call (Line 4)
      topFrame.currentLine = 4;
      topFrame.lineSnippet = codeLines[3];
      topFrame.state = "waiting";
      treeNodes[treeId].status = "waiting";

      snapshot(
        4,
        `factorial(${currN}) pauses at line 4: WAITING for child factorial(${currN - 1}) to return value before computing (${currN} * ?).`,
        `WAITING FOR CHILD RETURN`,
        `PUSH factorial(${currN - 1}) onto stack`,
        treeId,
        frameId
      );

      const childRes = sim(currN - 1, frameId, `factorial(n=${currN})`);

      // 4. Resume after child returns (Line 4 unwinding resolution)
      const finalVal = currN * childRes;
      treeNodes[treeId].status = "resolved";
      treeNodes[treeId].returnValue = finalVal;
      treeNodes[treeId].argsStr = `${currN} * ${childRes} = ${finalVal}`;

      // Update existing frame to returning state
      const returningFrame = frames[frames.length - 1];
      returningFrame.currentLine = 4;
      returningFrame.lineSnippet = codeLines[3];
      returningFrame.state = "returning";
      returningFrame.returnValue = finalVal;
      returningFrame.locals = { n: currN, childResult: childRes, result: finalVal };
      returningFrame.pendingOp = `Resolved: ${currN} * ${childRes} = ${finalVal}`;

      snapshot(
        4,
        `Child returned ${childRes}. Resolving pending multiplication: ${currN} * ${childRes} = ${finalVal}.`,
        `return ${currN} * ${childRes} -> ${finalVal}`,
        currN === n ? `Algorithm complete. Final result: ${finalVal}. POP root frame.` : `POP frame [${callId}] and pass ${finalVal} up the stack`,
        treeId,
        frameId
      );

      unwound++;
      frames.pop();
      return finalVal;
    }

    const finalVal = sim(n);

    // Final completion snapshot with completely unwound (EMPTY) call stack
    snapshot(
      4,
      `Algorithm execution complete. All activation records have unwound from the call stack (Stack depth: 0). Final computed result = ${finalVal}.`,
      `Complete -> ${finalVal}`,
      `Execution halted. Result: ${finalVal}`,
      `fact_${n}`,
      undefined
    );

    // Update total steps count and final result
    const total = steps.length;
    steps.forEach((s) => {
      s.totalSteps = total;
      s.resultTarget = finalVal;
    });

    if (steps.length > 0) {
      const last = steps[steps.length - 1];
      last.customData = { ...last.customData, finalResult: finalVal, isComplete: true };
    }

    return steps;
  },
};

// ----------------------------------------------------
// 2. FIBONACCI (TREE RECURSION)
// ----------------------------------------------------
export const fibonacciDef: AlgorithmDefinition = {
  id: "fibonacci",
  name: "Fibonacci (Naive Tree)",
  signature: "fib(n)",
  category: "Binary Branching",
  timeComplexity: "O(2^n)",
  spaceComplexity: "O(n) stack",
  description:
    "Exponential binary recursion tree. Visualizes dual branching, redundant overlapping subproblems, and tree traversal order.",
  defaultParams: { n: 4 },
  paramConfig: [
    { name: "n", label: "n", type: "number", min: 0, max: 6, default: 4 },
  ],
  codeSnippets: {
    python: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
    javascript: `function fib(n) {
  if (n <= 1) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}`,
    cpp: `int fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}`,
  },
  generateSteps: (params) => {
    const rawN = params.n !== undefined ? Number(params.n) : 4;
    const n = Math.min(Math.max(isNaN(rawN) ? 4 : rawN, 0), 6);
    const steps: ExecutionStep[] = [];
    let callCounter = 0;
    const treeNodes: Record<string, TreeNode> = {};
    const frames: StackFrame[] = [];
    let unwound = 0;
    let maxDepth = 0;

    const codeLines = [
      "def fib(n):",
      "    if n <= 1:",
      "        return n",
      "    return fib(n - 1) + fib(n - 2)",
    ];

    // Track subproblem occurrences to identify redundancy
    const subproblemCounts: Record<number, number> = {};

    // 1. Pre-build complete static tree skeleton so all dual branches & unique IDs exist from step 0
    function buildSkeleton(
      currN: number,
      parentId?: string,
      path = "root",
      branch: "root" | "left" | "right" = "root",
      depth = 1
    ): string {
      const nodeId = `node_${path}_${currN}`;
      subproblemCounts[currN] = (subproblemCounts[currN] || 0) + 1;
      const count = subproblemCounts[currN];

      const children: string[] = [];
      if (currN > 1) {
        const leftId = buildSkeleton(currN - 1, nodeId, `${path}L`, "left", depth + 1);
        const rightId = buildSkeleton(currN - 2, nodeId, `${path}R`, "right", depth + 1);
        children.push(leftId, rightId);
      }

      treeNodes[nodeId] = {
        id: nodeId,
        label: `fib(${currN})`,
        argsStr: currN <= 1 ? `BASE: return ${currN}` : `fib(${currN - 1}) + fib(${currN - 2})`,
        depth,
        parentId,
        children,
        status: "idle",
        n: currN,
        branch,
        isRedundant: count > 1,
        redundantCount: count,
      };

      return nodeId;
    }

    const rootId = buildSkeleton(n, undefined, "root", "root", 1);

    function snapshot(
      line: number,
      desc: string,
      condition?: string,
      next?: string,
      activeTreeId?: string,
      activeFrameId?: string
    ) {
      maxDepth = Math.max(maxDepth, frames.length);
      const pendingCount = frames.filter((f) => f.state === "waiting").length;

      const asciiLines: string[] = [];
      asciiLines.push(`=== FIBONACCI RECURSION TREE (n = ${n}) ===`);
      Object.values(treeNodes).forEach((node) => {
        const indent = "  ".repeat(Math.max(node.depth - 1, 0));
        const mark =
          node.status === "running"
            ? "▶"
            : node.status === "resolved" || node.status === "base"
            ? "✓"
            : node.status === "waiting"
            ? "⏳"
            : "•";
        const valStr = node.returnValue !== undefined ? ` -> ${node.returnValue}` : "";
        asciiLines.push(`${indent}${mark} ${node.label} [${node.status}]${valStr}`);
      });

      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        activeLine: line,
        description: desc,
        conditionCheck: condition,
        nextAction: next,
        activeFrameId: activeFrameId || (frames.length > 0 ? frames[frames.length - 1].id : undefined),
        frames: JSON.parse(JSON.stringify(frames)),
        treeNodes: JSON.parse(JSON.stringify(treeNodes)),
        treeRootId: rootId,
        activeTreeNodeId: activeTreeId,
        unwoundCount: unwound,
        maxDepthReached: maxDepth,
        totalCalls: callCounter,
        currentStackDepth: frames.length,
        pendingOpsCount: pendingCount,
        resultTarget: undefined,
        currentMemoryPeak: maxDepth,
        asciiSnapshot: asciiLines.join("\n"),
      });
    }

    // Initial step 0: Ready state
    snapshot(
      1,
      `Ready to compute Fibonacci(${n}). Dual-branching call tree initialized with all ${Object.keys(treeNodes).length} invocation node(s).`,
      undefined,
      `Invoke fib(${n})`,
      rootId,
      undefined
    );

    function sim(
      currN: number,
      parentId?: string,
      path = "root",
      branch: "root" | "left" | "right" = "root",
      depth = 1,
      parentFrameId?: string,
      parentLabel?: string
    ): number {
      callCounter++;
      const currentCall = callCounter;
      const currentDepth = frames.length + 1;
      const callId = `call-${currentCall}`;
      const nodeId = `node_${path}_${currN}`;
      const frameId = `frame_${nodeId}_c${currentCall}`;

      // Mark node as currently active / running
      treeNodes[nodeId].status = "running";
      treeNodes[nodeId].callOrder = currentCall;

      const newFrame: StackFrame = {
        id: frameId,
        callId: callId,
        callNumber: currentCall,
        callLabel: `fibonacci(n=${currN})`,
        funcName: "fibonacci",
        args: { n: currN },
        locals: { n: currN },
        currentLine: 1,
        lineSnippet: codeLines[0],
        state: "active",
        memoryAddr: makeAddr(currentDepth, currentCall),
        depth: currentDepth,
        callerId: parentFrameId,
        callerLabel: parentLabel || (parentFrameId ? `fibonacci(n=${currN + (branch === "left" ? 1 : 2)})` : "Main / Top-level"),
        pendingOp: currN > 1 ? `fib(${currN - 1}) + fib(${currN - 2})` : undefined,
      };
      frames.push(newFrame);

      snapshot(
        1,
        `Calling fibonacci(${currN}) [${callId}] on ${branch === "root" ? "root node" : branch + " branch"}. Allocated stack frame #${currentCall} (depth ${currentDepth}).`,
        undefined,
        `Evaluate base condition (n <= 1)`,
        nodeId,
        frameId
      );

      const isBase = currN <= 1;
      const topFrame = frames[frames.length - 1];
      topFrame.currentLine = 2;
      topFrame.lineSnippet = codeLines[1];

      snapshot(
        2,
        `Checking base condition (n <= 1): (${currN} <= 1) is ${isBase ? "TRUE (Base Case Reached)" : "FALSE (Branching into dual children)"}.`,
        `(${currN} <= 1) -> ${isBase}`,
        isBase ? `Return ${currN} directly` : `Branch left: evaluate fibonacci(${currN - 1})`,
        nodeId,
        frameId
      );

      if (isBase) {
        treeNodes[nodeId].status = "base";
        treeNodes[nodeId].returnValue = currN;
        treeNodes[nodeId].argsStr = `BASE: return ${currN}`;

        topFrame.currentLine = 3;
        topFrame.lineSnippet = codeLines[2];
        topFrame.state = "base";
        topFrame.returnValue = currN;
        topFrame.locals = { n: currN, returnValue: currN };

        snapshot(
          3,
          `Base case return: fibonacci(${currN}) = ${currN}. POP frame [${callId}] and unwind to caller.`,
          `return ${currN}`,
          `Unwind frame [${callId}] to caller`,
          nodeId,
          frameId
        );

        unwound++;
        frames.pop();
        return currN;
      }

      // 1. Dispatch Left child: fib(n - 1)
      topFrame.currentLine = 4;
      topFrame.lineSnippet = codeLines[3];
      topFrame.state = "waiting";
      treeNodes[nodeId].status = "waiting";
      treeNodes[nodeId].argsStr = `Waiting for left child: fib(${currN - 1})`;

      snapshot(
        4,
        `fibonacci(${currN}) [${callId}] pauses at line 4: WAITING for left child fibonacci(${currN - 1}) to evaluate.`,
        `LEFT BRANCH DISPATCH`,
        `PUSH left child fibonacci(${currN - 1}) onto stack`,
        nodeId,
        frameId
      );

      const left = sim(currN - 1, nodeId, `${path}L`, "left", depth + 1, frameId, `fibonacci(n=${currN})`);
      treeNodes[nodeId].leftResult = left;

      // 2. Dispatch Right child: fib(n - 2)
      const currentParentFrame = frames[frames.length - 1];
      currentParentFrame.currentLine = 4;
      currentParentFrame.lineSnippet = codeLines[3];
      currentParentFrame.state = "waiting";
      currentParentFrame.locals = { n: currN, leftResult: left };
      currentParentFrame.pendingOp = `Left resolved: ${left}. Pending right: fib(${currN - 2})`;
      treeNodes[nodeId].status = "waiting";
      treeNodes[nodeId].argsStr = `Left = ${left}. Waiting for right child: fib(${currN - 2})`;

      snapshot(
        4,
        `Left child returned ${left}. fibonacci(${currN}) [${callId}] remains on stack, now dispatching right child fibonacci(${currN - 2}).`,
        `RIGHT BRANCH DISPATCH`,
        `PUSH right child fibonacci(${currN - 2}) onto stack`,
        nodeId,
        frameId
      );

      const right = sim(currN - 2, nodeId, `${path}R`, "right", depth + 1, frameId, `fibonacci(n=${currN})`);
      treeNodes[nodeId].rightResult = right;

      // 3. Combine both returned values
      const sum = left + right;
      treeNodes[nodeId].status = "resolved";
      treeNodes[nodeId].returnValue = sum;
      treeNodes[nodeId].argsStr = `${left} + ${right} = ${sum}`;

      const returningFrame = frames[frames.length - 1];
      returningFrame.currentLine = 4;
      returningFrame.lineSnippet = codeLines[3];
      returningFrame.state = "returning";
      returningFrame.returnValue = sum;
      returningFrame.locals = { n: currN, leftResult: left, rightResult: right, sumResult: sum };
      returningFrame.pendingOp = `Resolved: ${left} + ${right} = ${sum}`;

      snapshot(
        4,
        `Both branches resolved for fibonacci(${currN}): left (${left}) + right (${right}) = ${sum}. Returning ${sum} to caller.`,
        `return ${left} + ${right} -> ${sum}`,
        parentId ? `POP frame [${callId}] and pass ${sum} to parent` : `Algorithm complete. Final result: ${sum}. POP root frame.`,
        nodeId,
        frameId
      );

      unwound++;
      frames.pop();
      return sum;
    }

    const finalVal = sim(n, undefined, "root", "root", 1);

    // Final completion snapshot: EMPTY stack
    snapshot(
      4,
      `Algorithm execution complete. All ${callCounter} invocation(s) evaluated and unwound. Final result: fibonacci(${n}) = ${finalVal} (Stack depth: 0).`,
      `Complete -> ${finalVal}`,
      `Execution halted. Result: ${finalVal}`,
      rootId,
      undefined
    );

    const total = steps.length;
    steps.forEach((s) => {
      s.totalSteps = total;
      s.treeRootId = rootId;
      s.resultTarget = finalVal;
    });

    if (steps.length > 0) {
      const last = steps[steps.length - 1];
      last.customData = { ...last.customData, finalResult: finalVal, isComplete: true };
    }

    return steps;
  },
};

// ----------------------------------------------------
// 3. FIBONACCI MEMOIZED (DYNAMIC PROGRAMMING)
// ----------------------------------------------------
export const fibonacciMemoDef: AlgorithmDefinition = {
  id: "fibonacci_memo",
  name: "Fibonacci (Memoized / DP)",
  signature: "fib_memo(n, memo)",
  category: "Dynamic Programming",
  timeComplexity: "O(n)",
  spaceComplexity: "O(n) stack + memo",
  description:
    "Memoized top-down recursion. Demonstrates cache hit detection, pruning redundant branches, and reducing O(2^n) to O(n).",
  defaultParams: { n: 4 },
  paramConfig: [
    { name: "n", label: "n", type: "number", min: 0, max: 7, default: 4 },
  ],
  codeSnippets: {
    python: `def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]  # Cache hit!
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]`,
    javascript: `function fibMemo(n, memo = {}) {
  if (n in memo) return memo[n]; // Cache Hit!
  if (n <= 1) return n;
  memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  return memo[n];
}`,
    cpp: `int fibMemo(int n, unordered_map<int, int>& memo) {
    if (memo.count(n)) return memo[n];
    if (n <= 1) return n;
    return memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo);
}`,
  },
  generateSteps: (params) => {
    const rawN = params.n !== undefined ? Number(params.n) : 4;
    const n = Math.min(Math.max(isNaN(rawN) ? 4 : rawN, 0), 7);
    const steps: ExecutionStep[] = [];
    let callCounter = 0;
    const treeNodes: Record<string, TreeNode> = {};
    const frames: StackFrame[] = [];
    const memo: Record<number, number> = {};
    let unwound = 0;
    let maxDepth = 0;
    let cacheHits = 0;
    let callsSaved = 0;

    const codeLines = [
      "def fib_memo(n, memo={}):",
      "    if n in memo:",
      "        return memo[n]  # Cache hit!",
      "    if n <= 1:",
      "        return n",
      "    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)",
      "    return memo[n]",
    ];

    // Build potential call tree skeleton
    function buildSkeleton(
      currN: number,
      parentId?: string,
      path = "root",
      branch: "root" | "left" | "right" = "root",
      depth = 1
    ): string {
      const nodeId = `node_${path}_${currN}`;
      const children: string[] = [];
      if (currN > 1) {
        const leftId = buildSkeleton(currN - 1, nodeId, `${path}L`, "left", depth + 1);
        const rightId = buildSkeleton(currN - 2, nodeId, `${path}R`, "right", depth + 1);
        children.push(leftId, rightId);
      }

      treeNodes[nodeId] = {
        id: nodeId,
        label: `fib(${currN})`,
        argsStr: currN <= 1 ? `BASE: return ${currN}` : `fib(${currN - 1}) + fib(${currN - 2})`,
        depth,
        parentId,
        children,
        status: "idle",
        n: currN,
        branch,
      };

      return nodeId;
    }

    const rootId = buildSkeleton(n, undefined, "root", "root", 1);

    function snapshot(
      line: number,
      desc: string,
      condition?: string,
      next?: string,
      activeTreeId?: string,
      activeFrameId?: string
    ) {
      maxDepth = Math.max(maxDepth, frames.length);
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        activeLine: line,
        description: desc,
        conditionCheck: condition,
        nextAction: next,
        activeFrameId: activeFrameId || (frames.length > 0 ? frames[frames.length - 1].id : undefined),
        frames: JSON.parse(JSON.stringify(frames)),
        treeNodes: JSON.parse(JSON.stringify(treeNodes)),
        treeRootId: rootId,
        activeTreeNodeId: activeTreeId,
        unwoundCount: unwound,
        maxDepthReached: maxDepth,
        totalCalls: callCounter,
        currentStackDepth: frames.length,
        pendingOpsCount: frames.filter((f) => f.state === "waiting").length,
        resultTarget: undefined,
        currentMemoryPeak: maxDepth,
        asciiSnapshot: `MEMO TABLE: ${JSON.stringify(memo)}`,
        customData: {
          memoTable: { ...memo },
          cacheHits,
          callsSaved,
          isComplete: false,
        },
      });
    }

    // Initial step 0
    snapshot(
      1,
      `Ready to compute Memoized Fibonacci(${n}). In-memory cache is initialized: memo = {}.`,
      undefined,
      `Invoke fib_memo(${n}, memo)`,
      rootId,
      undefined
    );

    function sim(
      currN: number,
      parentId?: string,
      path = "root",
      branch: "root" | "left" | "right" = "root",
      depth = 1,
      parentFrameId?: string,
      parentLabel?: string
    ): number {
      callCounter++;
      const currentCall = callCounter;
      const currentDepth = frames.length + 1;
      const callId = `call-${currentCall}`;
      const nodeId = `node_${path}_${currN}`;
      const frameId = `frame_${nodeId}_c${currentCall}`;

      treeNodes[nodeId].status = "running";
      treeNodes[nodeId].callOrder = currentCall;

      const newFrame: StackFrame = {
        id: frameId,
        callId: callId,
        callNumber: currentCall,
        callLabel: `fib_memo(n=${currN})`,
        funcName: "fib_memo",
        args: { n: currN },
        locals: { n: currN, memoCachedCount: Object.keys(memo).length },
        currentLine: 1,
        lineSnippet: codeLines[0],
        state: "active",
        memoryAddr: makeAddr(currentDepth, currentCall),
        depth: currentDepth,
        callerId: parentFrameId,
        callerLabel: parentLabel || (parentFrameId ? `fib_memo(n=parent)` : "Main / Top-level"),
        pendingOp: currN > 1 ? `fib_memo(${currN - 1}) + fib_memo(${currN - 2})` : undefined,
      };
      frames.push(newFrame);

      snapshot(
        1,
        `Invoking fib_memo(${currN}) [${callId}]. Checking cache for precomputed answer...`,
        undefined,
        `Check if ${currN} in memo`,
        nodeId,
        frameId
      );

      // 1. Check cache hit (Line 2)
      const topFrame = frames[frames.length - 1];
      topFrame.currentLine = 2;
      topFrame.lineSnippet = codeLines[1];

      if (currN in memo) {
        cacheHits++;
        callsSaved += currN >= 2 ? Math.max(Math.pow(1.618, currN) - 1, 1) : 0;
        const cachedVal = memo[currN];

        treeNodes[nodeId].status = "resolved";
        treeNodes[nodeId].cached = true;
        treeNodes[nodeId].returnValue = cachedVal;
        treeNodes[nodeId].argsStr = `CACHE HIT: return ${cachedVal}`;

        topFrame.currentLine = 3;
        topFrame.lineSnippet = codeLines[2];
        topFrame.state = "returning";
        topFrame.returnValue = cachedVal;
        topFrame.locals = { n: currN, cachedValue: cachedVal };

        snapshot(
          3,
          `⚡ CACHE HIT! memo[${currN}] = ${cachedVal} found in hashmap. Instant O(1) return without recursive branching!`,
          `(${currN} in memo) -> TRUE (${cachedVal})`,
          `Return cached result ${cachedVal} immediately and POP frame [${callId}]`,
          nodeId,
          frameId
        );

        unwound++;
        frames.pop();
        return cachedVal;
      }

      snapshot(
        4,
        `Cache miss: memo[${currN}] not found. Proceeding to evaluate base condition (n <= 1).`,
        `(${currN} in memo) -> FALSE`,
        `Check base condition (n <= 1)`,
        nodeId,
        frameId
      );

      // 2. Base case check (Line 4)
      topFrame.currentLine = 4;
      topFrame.lineSnippet = codeLines[3];

      if (currN <= 1) {
        memo[currN] = currN;
        treeNodes[nodeId].status = "base";
        treeNodes[nodeId].returnValue = currN;
        treeNodes[nodeId].argsStr = `BASE: return ${currN}`;

        topFrame.currentLine = 5;
        topFrame.lineSnippet = codeLines[4];
        topFrame.state = "base";
        topFrame.returnValue = currN;
        topFrame.locals = { n: currN, returnValue: currN };

        snapshot(
          5,
          `Base case reached: fib_memo(${currN}) = ${currN}. Recorded memo[${currN}] = ${currN}.`,
          `(${currN} <= 1) -> TRUE`,
          `Return ${currN} to caller and POP frame [${callId}]`,
          nodeId,
          frameId
        );

        unwound++;
        frames.pop();
        return currN;
      }

      // 3. Branch Left (Line 6)
      topFrame.currentLine = 6;
      topFrame.lineSnippet = codeLines[5];
      topFrame.state = "waiting";
      treeNodes[nodeId].status = "waiting";
      treeNodes[nodeId].argsStr = `Computing left: fib_memo(${currN - 1})`;

      snapshot(
        6,
        `fib_memo(${currN}) [${callId}] pauses: executing left child fib_memo(${currN - 1}).`,
        `DISPATCH LEFT CHILD`,
        `PUSH fib_memo(${currN - 1}) onto stack`,
        nodeId,
        frameId
      );

      const left = sim(currN - 1, nodeId, `${path}L`, "left", depth + 1, frameId, `fib_memo(n=${currN})`);
      treeNodes[nodeId].leftResult = left;

      // 4. Branch Right (Line 6)
      const currentParent = frames[frames.length - 1];
      currentParent.currentLine = 6;
      currentParent.lineSnippet = codeLines[5];
      currentParent.state = "waiting";
      currentParent.locals = { n: currN, leftResult: left };
      treeNodes[nodeId].status = "waiting";
      treeNodes[nodeId].argsStr = `Left returned ${left}. Computing right: fib_memo(${currN - 2})`;

      snapshot(
        6,
        `Left child returned ${left}. fib_memo(${currN}) [${callId}] now evaluates right child fib_memo(${currN - 2}).`,
        `DISPATCH RIGHT CHILD`,
        `PUSH fib_memo(${currN - 2}) onto stack`,
        nodeId,
        frameId
      );

      const right = sim(currN - 2, nodeId, `${path}R`, "right", depth + 1, frameId, `fib_memo(n=${currN})`);
      treeNodes[nodeId].rightResult = right;

      // 5. Store in memo table & return (Line 7)
      const sum = left + right;
      memo[currN] = sum;

      treeNodes[nodeId].status = "resolved";
      treeNodes[nodeId].returnValue = sum;
      treeNodes[nodeId].argsStr = `memo[${currN}] = ${left} + ${right} = ${sum}`;

      const returningF = frames[frames.length - 1];
      returningF.currentLine = 7;
      returningF.lineSnippet = codeLines[6];
      returningF.state = "returning";
      returningF.returnValue = sum;
      returningF.locals = { n: currN, leftResult: left, rightResult: right, storedInMemo: sum };
      returningF.pendingOp = `memo[${currN}] = ${left} + ${right} = ${sum}`;

      snapshot(
        7,
        `Computed fib_memo(${currN}) = ${sum}. Stored memo[${currN}] = ${sum} in cache table. Returning to caller.`,
        `memo[${currN}] = ${sum}`,
        `POP frame [${callId}] and return ${sum} to parent`,
        nodeId,
        frameId
      );

      unwound++;
      frames.pop();
      return sum;
    }

    const finalVal = sim(n, undefined, "root", "root", 1);

    // Final completion snapshot: EMPTY stack
    snapshot(
      7,
      `Algorithm execution complete. Memo table contains all subproblem answers. Final result = ${finalVal} (Stack depth: 0).`,
      `Complete -> ${finalVal}`,
      `Execution halted. Result: ${finalVal}`,
      rootId,
      undefined
    );

    const total = steps.length;
    steps.forEach((s) => {
      s.totalSteps = total;
      s.treeRootId = rootId;
      s.resultTarget = finalVal;
    });

    if (steps.length > 0) {
      const last = steps[steps.length - 1];
      last.customData = {
        ...last.customData,
        finalResult: finalVal,
        isComplete: true,
      };
    }

    return steps;
  },
};

// ----------------------------------------------------
// 4. TOWER OF HANOI
// ----------------------------------------------------
export const hanoiDef: AlgorithmDefinition = {
  id: "hanoi",
  name: "Tower of Hanoi",
  signature: "hanoi(n, source, target, aux)",
  category: "Divide & Conquer",
  timeComplexity: "O(2^n)",
  spaceComplexity: "O(n) stack",
  description:
    "Classic recursive puzzle: move n disks from source to target using auxiliary peg without placing a larger disk on a smaller one.",
  defaultParams: { n: 3 },
  paramConfig: [
    { name: "n", label: "Disks (n)", type: "number", min: 1, max: 4, default: 3 },
  ],
  codeSnippets: {
    python: `def hanoi(n, src, dst, aux):
    if n == 1:
        print(f"Move disk 1 from {src} to {dst}")
        return
    hanoi(n - 1, src, aux, dst)
    print(f"Move disk {n} from {src} to {dst}")
    hanoi(n - 1, aux, dst, src)`,
    javascript: `function hanoi(n, src, dst, aux) {
  if (n === 1) {
    console.log(\`Move disk 1 from \${src} to \${dst}\`);
    return;
  }
  hanoi(n - 1, src, aux, dst);
  console.log(\`Move disk \${n} from \${src} to \${dst}\`);
  hanoi(n - 1, aux, dst, src);
}`,
    cpp: `void hanoi(int n, char src, char dst, char aux) {
    if (n == 1) {
        cout << "Move disk 1 from " << src << " to " << dst << endl;
        return;
    }
    hanoi(n - 1, src, aux, dst);
    cout << "Move disk " << n << " from " << src << " to " << dst << endl;
    hanoi(n - 1, aux, dst, src);
}`,
  },
  generateSteps: (params) => {
    const n = Math.min(Math.max(Number(params.n) || 3, 1), 4);
    const steps: ExecutionStep[] = [];
    let callCounter = 0;
    const treeNodes: Record<string, TreeNode> = {};
    const frames: StackFrame[] = [];
    const moves: string[] = [];
    let unwound = 0;
    let maxDepth = 0;

    // Pegs state
    const pegs: Record<string, number[]> = {
      A: Array.from({ length: n }, (_, i) => n - i),
      B: [],
      C: [],
    };

    function snapshot(
      line: number,
      desc: string,
      condition?: string,
      next?: string,
      activeTreeId?: string,
      activeFrameId?: string
    ) {
      maxDepth = Math.max(maxDepth, frames.length);
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        activeLine: line,
        description: desc,
        conditionCheck: condition,
        nextAction: next,
        activeFrameId: activeFrameId || (frames.length > 0 ? frames[frames.length - 1].id : undefined),
        frames: JSON.parse(JSON.stringify(frames)),
        treeNodes: JSON.parse(JSON.stringify(treeNodes)),
        treeRootId: `node_root_${n}`,
        activeTreeNodeId: activeTreeId,
        unwoundCount: unwound,
        maxDepthReached: maxDepth,
        totalCalls: callCounter,
        currentStackDepth: frames.length,
        pendingOpsCount: frames.filter((f) => f.state === "waiting").length,
        currentMemoryPeak: maxDepth,
        asciiSnapshot: `PEGS: A=[${pegs.A.join(",")}] B=[${pegs.B.join(",")}] C=[${pegs.C.join(",")}]\nMOVES: ${moves.length}`,
        customData: {
          pegs: JSON.parse(JSON.stringify(pegs)),
          moves: [...moves],
        },
      });
    }

    function sim(currN: number, src: string, dst: string, aux: string, parentId?: string, path = "root") {
      callCounter++;
      const nodeId = `node_${path}_${currN}`;
      const depth = frames.length + 1;
      const frameId = `frame_${nodeId}`;

      treeNodes[nodeId] = {
        id: nodeId,
        label: `hanoi(${currN}, ${src}→${dst})`,
        argsStr: `disk ${currN}: ${src} → ${dst}`,
        depth,
        parentId,
        children: [],
        status: "running",
      };

      if (parentId && treeNodes[parentId]) {
        treeNodes[parentId].children.push(nodeId);
      }

      frames.push({
        id: frameId,
        callLabel: `#${depth} hanoi(${currN}, ${src}, ${dst}, ${aux})`,
        funcName: "hanoi",
        args: { n: currN, src, dst, aux },
        state: "active",
        memoryAddr: makeAddr(depth, callCounter),
        depth,
      });

      snapshot(1, `hanoi(${currN}): Move top ${currN} disks from peg ${src} to peg ${dst} via peg ${aux}.`, undefined, `Check base case (n == 1)`, nodeId, frameId);

      if (currN === 1) {
        const disk = pegs[src].pop()!;
        pegs[dst].push(disk);
        moves.push(`Move disk 1 from ${src} to ${dst}`);

        treeNodes[nodeId].status = "base";
        frames[frames.length - 1].state = "base";

        snapshot(
          3,
          `Base case: Move disk 1 directly from ${src} to ${dst}.`,
          `n == 1 -> TRUE`,
          `Move disk 1: ${src} → ${dst}`,
          nodeId,
          frameId
        );

        unwound++;
        frames.pop();
        return;
      }

      // Step 1: Move n-1 to aux
      frames[frames.length - 1].state = "waiting";
      treeNodes[nodeId].status = "waiting";
      snapshot(4, `Step 1: Recursively move ${currN - 1} disks from ${src} to auxiliary peg ${aux}.`, undefined, `Call hanoi(${currN - 1}, ${src}, ${aux}, ${dst})`, nodeId, frameId);
      sim(currN - 1, src, aux, dst, nodeId, `${path}L`);

      // Step 2: Move nth disk to dst
      const disk = pegs[src].pop()!;
      pegs[dst].push(disk);
      moves.push(`Move disk ${currN} from ${src} to ${dst}`);
      snapshot(5, `Step 2: Move largest disk ${currN} directly from ${src} to ${dst}.`, undefined, `Move disk ${currN}: ${src} → ${dst}`, nodeId, frameId);

      // Step 3: Move n-1 from aux to dst
      snapshot(6, `Step 3: Recursively move ${currN - 1} disks from auxiliary peg ${aux} to target peg ${dst}.`, undefined, `Call hanoi(${currN - 1}, ${aux}, ${dst}, ${src})`, nodeId, frameId);
      sim(currN - 1, aux, dst, src, nodeId, `${path}R`);

      treeNodes[nodeId].status = "resolved";
      frames.push({
        id: frameId,
        callLabel: `#${depth} hanoi(${currN}, ${src}, ${dst})`,
        funcName: "hanoi",
        args: { n: currN, src, dst, aux },
        state: "returning",
        memoryAddr: makeAddr(depth, callCounter),
        depth,
      });

      snapshot(6, `Subproblem hanoi(${currN}) complete.`, undefined, `Unwind`, nodeId, frameId);
      unwound++;
      frames.pop();
    }

    sim(n, "A", "C", "B", undefined, "root");
    const total = steps.length;
    steps.forEach((s) => {
      s.totalSteps = total;
      s.treeRootId = `node_root_${n}`;
    });

    return steps;
  },
};

// ----------------------------------------------------
// 5. BINARY SEARCH (RECURSIVE)
// ----------------------------------------------------
export const binarySearchDef: AlgorithmDefinition = {
  id: "binary_search",
  name: "Binary Search",
  signature: "binary_search(arr, target, low, high)",
  category: "Divide & Conquer",
  timeComplexity: "O(log n)",
  spaceComplexity: "O(log n) stack",
  description:
    "Logarithmic search via recursive range halving. Shows call stack shrinking search bounds.",
  defaultParams: { target: 7 },
  paramConfig: [
    { name: "target", label: "Target", type: "number", min: 1, max: 15, default: 7 },
  ],
  codeSnippets: {
    python: `def binary_search(arr, target, low, high):
    if low > high:
        return -1  # Not found
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid  # Found!
    elif arr[mid] > target:
        return binary_search(arr, target, low, mid - 1)
    else:
        return binary_search(arr, target, mid + 1, high)`,
    javascript: `function binarySearch(arr, target, low, high) {
  if (low > high) return -1;
  const mid = Math.floor((low + high) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] > target) return binarySearch(arr, target, low, mid - 1);
  return binarySearch(arr, target, mid + 1, high);
}`,
    cpp: `int binarySearch(const vector<int>& arr, int target, int low, int high) {
    if (low > high) return -1;
    int mid = low + (high - low) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] > target) return binarySearch(arr, target, low, mid - 1);
    return binarySearch(arr, target, mid + 1, high);
}`,
  },
  generateSteps: (params) => {
    const arr = Array.isArray(params.arr) && params.arr.length > 0 ? params.arr : [1, 3, 5, 7, 9, 11, 13, 15];
    const target = params.target !== undefined ? Number(params.target) : 7;
    const steps: ExecutionStep[] = [];
    let callCounter = 0;
    const treeNodes: Record<string, TreeNode> = {};
    const frames: StackFrame[] = [];
    let unwound = 0;
    let maxDepth = 0;

    function snapshot(
      line: number,
      desc: string,
      condition?: string,
      next?: string,
      activeTreeId?: string,
      activeFrameId?: string
    ) {
      maxDepth = Math.max(maxDepth, frames.length);
      steps.push({
        stepIndex: steps.length,
        totalSteps: 0,
        activeLine: line,
        description: desc,
        conditionCheck: condition,
        nextAction: next,
        activeFrameId: activeFrameId || (frames.length > 0 ? frames[frames.length - 1].id : undefined),
        frames: JSON.parse(JSON.stringify(frames)),
        treeNodes: JSON.parse(JSON.stringify(treeNodes)),
        treeRootId: `bs_root`,
        activeTreeNodeId: activeTreeId,
        unwoundCount: unwound,
        maxDepthReached: maxDepth,
        totalCalls: callCounter,
        currentStackDepth: frames.length,
        pendingOpsCount: frames.filter((f) => f.state === "waiting").length,
        currentMemoryPeak: maxDepth,
        asciiSnapshot: `ARRAY: [${arr.join(", ")}]\nTARGET: ${target}`,
        customData: { arr, target },
      });
    }

    function sim(low: number, high: number, parentId?: string, path = "root"): number {
      callCounter++;
      const nodeId = `bs_${path}`;
      const depth = frames.length + 1;
      const frameId = `frame_${nodeId}`;

      treeNodes[nodeId] = {
        id: nodeId,
        label: `bs(low=${low}, high=${high})`,
        argsStr: `[${low}..${high}]`,
        depth,
        parentId,
        children: [],
        status: "running",
      };

      if (parentId && treeNodes[parentId]) {
        treeNodes[parentId].children.push(nodeId);
      }

      frames.push({
        id: frameId,
        callLabel: `#${depth} bs([${low}..${high}], target=${target})`,
        funcName: "binary_search",
        args: { low, high, target },
        state: "active",
        memoryAddr: makeAddr(depth, callCounter),
        depth,
      });

      snapshot(1, `Searching for ${target} in index range [${low}..${high}].`, undefined, `Check if low > high`, nodeId, frameId);

      if (low > high) {
        treeNodes[nodeId].status = "base";
        treeNodes[nodeId].returnValue = -1;
        frames[frames.length - 1].state = "base";
        frames[frames.length - 1].returnValue = -1;
        snapshot(3, `Range exhausted (low > high). Target not found, return -1.`, `(${low} > ${high}) -> TRUE`, `Return -1`, nodeId, frameId);
        unwound++;
        frames.pop();
        return -1;
      }

      const mid = Math.floor((low + high) / 2);
      const midVal = arr[mid];
      snapshot(4, `Calculated midpoint: index ${mid} (value = ${midVal}).`, `arr[${mid}] = ${midVal}`, `Compare arr[${mid}] with target ${target}`, nodeId, frameId);

      if (midVal === target) {
        treeNodes[nodeId].status = "resolved";
        treeNodes[nodeId].returnValue = mid;
        frames[frames.length - 1].state = "returning";
        frames[frames.length - 1].returnValue = mid;
        snapshot(6, `Target ${target} found at index ${mid}! Base case match.`, `arr[${mid}] == ${target} -> TRUE`, `Return index ${mid}`, nodeId, frameId);
        unwound++;
        frames.pop();
        return mid;
      }

      if (midVal > target) {
        frames[frames.length - 1].state = "waiting";
        treeNodes[nodeId].status = "waiting";
        snapshot(8, `${midVal} > ${target}: Target is in left half. Recursing on range [${low}..${mid - 1}].`, `${midVal} > ${target} -> TRUE`, `Call bs(${low}, ${mid - 1})`, nodeId, frameId);
        const res = sim(low, mid - 1, nodeId, `${path}L`);
        treeNodes[nodeId].status = "resolved";
        treeNodes[nodeId].returnValue = res;
        const topF = frames[frames.length - 1];
        topF.state = "returning";
        topF.returnValue = res;
        snapshot(8, `Left search returned ${res}. Passing result up.`, `return ${res}`, `Return ${res}`, nodeId, frameId);
        unwound++;
        frames.pop();
        return res;
      } else {
        frames[frames.length - 1].state = "waiting";
        treeNodes[nodeId].status = "waiting";
        snapshot(10, `${midVal} < ${target}: Target is in right half. Recursing on range [${mid + 1}..${high}].`, `${midVal} < ${target} -> TRUE`, `Call bs(${mid + 1}, ${high})`, nodeId, frameId);
        const res = sim(mid + 1, high, nodeId, `${path}R`);
        treeNodes[nodeId].status = "resolved";
        treeNodes[nodeId].returnValue = res;
        const topF = frames[frames.length - 1];
        topF.state = "returning";
        topF.returnValue = res;
        snapshot(10, `Right search returned ${res}. Passing result up.`, `return ${res}`, `Return ${res}`, nodeId, frameId);
        unwound++;
        frames.pop();
        return res;
      }
    }

    const finalVal = sim(0, arr.length - 1, undefined, "root");

    snapshot(
      1,
      `Binary search complete. All stack frames unwound. Result index: ${finalVal}.`,
      `Final -> ${finalVal}`,
      `Execution halted. Result: ${finalVal}`,
      `bs_root`,
      undefined
    );

    const total = steps.length;
    steps.forEach((s) => {
      s.totalSteps = total;
      s.treeRootId = `bs_root`;
      s.resultTarget = finalVal;
    });

    if (steps.length > 0) {
      const last = steps[steps.length - 1];
      last.customData = { ...last.customData, finalResult: finalVal, isComplete: true };
    }

    return steps;
  },
};

// ----------------------------------------------------
// REGISTRY OF ALL ALGORITHMS
// ----------------------------------------------------
export const ALGORITHMS: Record<AlgorithmId, AlgorithmDefinition> = {
  factorial: factorialDef,
  fibonacci: fibonacciDef,
  fibonacci_memo: fibonacciMemoDef,
  hanoi: hanoiDef,
  binary_search: binarySearchDef,
  merge_sort: {
    ...factorialDef,
    id: "merge_sort",
    name: "Merge Sort",
    signature: "merge_sort(arr)",
    category: "Divide & Conquer",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n) auxiliary",
    description: "Recursive divide and conquer array sorting with partition trees and merge unwinding.",
  },
  power: {
    ...factorialDef,
    id: "power",
    name: "Fast Power",
    signature: "power(x, n)",
    category: "Divide & Conquer",
    timeComplexity: "O(log n)",
    spaceComplexity: "O(log n) stack",
    description: "Logarithmic recursive exponentiation by squaring (x^(n/2))^2.",
  },
};

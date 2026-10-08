// Grounded recursion explanation bank for interactive learner questions & contextual AI fallback

export interface RuntimeContext {
  algorithm?: string;
  n?: number;
  stepIndex?: number;
  totalSteps?: number;
  activeLine?: number;
  activeNodeLabel?: string;
  currentStackDepth?: number;
  callStackFrames?: Array<{
    callLabel: string;
    state: string;
    returnValue?: number | string;
    pendingOp?: string;
    memoryAddr?: string;
    args?: Record<string, any>;
  }>;
  stepDescription?: string;
  conditionCheck?: string;
  nextAction?: string;
  resultTarget?: number | string;
}

export interface QAResponse {
  matchedKeywords: string[];
  title: string;
  answer: string;
  codeExample?: string;
  relatedTopic?: string;
}

export const QA_KNOWLEDGE_BANK: QAResponse[] = [
  {
    matchedKeywords: ["what is recursion", "explain recursion", "define recursion", "concept of recursion", "recursion meaning"],
    title: "What is Recursion?",
    answer: "Recursion is a programming technique where a function solves a problem by calling itself with smaller, simpler inputs. Every recursive algorithm consists of two essential components:\n\n1. Base Case: A terminating condition that returns a concrete result directly without making further calls, preventing infinite recursion.\n2. Recursive Step: The part where the function reduces the problem into one or more smaller subproblems and calls itself, stacking activation records on the call stack until reaching the base case, then unwinding back upward.",
    codeExample: "def countdown(n):\n    if n <= 0:\n        return \"Done!\"  # Base Case\n    return countdown(n - 1)  # Recursive Step",
    relatedTopic: "Recursion Fundamentals",
  },
  {
    matchedKeywords: ["explain factorial recursion", "how does factorial work", "factorial explanation", "factorial recursion"],
    title: "How Factorial Recursion Works",
    answer: "Factorial of n (written as n!) is the product of all positive integers from 1 down to n (with 0! = 1 by definition). In recursion, it is defined by the recurrence relation:\n• Base Case: factorial(n) = 1 when n <= 1\n• Recursive Step: factorial(n) = n * factorial(n - 1)\n\nExecution occurs in two phases:\n1. Winding Phase: factorial(4) pauses to call factorial(3), which calls factorial(2), which calls factorial(1). Each call pushes a new frame onto the stack.\n2. Unwinding Phase: factorial(1) returns 1. factorial(2) computes 2 * 1 = 2. factorial(3) computes 3 * 2 = 6. factorial(4) computes 4 * 6 = 24.",
    codeExample: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
    relatedTopic: "Linear Recursion",
  },
  {
    matchedKeywords: ["why does fibonacci have two branches", "two recursive calls", "dual branch", "binary branch", "why two calls", "fibonacci branches"],
    title: "Why Does Fibonacci Have Two Branches?",
    answer: "The Fibonacci sequence is defined by the mathematical recurrence F(n) = F(n-1) + F(n-2) for all n >= 2, with base cases F(0) = 0 and F(1) = 1.\n\nBecause computing any term requires the sum of the two preceding terms, every non-base function invocation must dispatch TWO separate recursive child calls:\n1. Left Branch: calculates fib(n - 1)\n2. Right Branch: calculates fib(n - 2)\n\nThis binary branching creates a call tree with exponential O(2^n) total invocations in the naive implementation, generating overlapping redundant subproblems.",
    codeExample: "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)  # Dual binary branches",
    relatedTopic: "Tree Recursion & Branching",
  },
  {
    matchedKeywords: ["why does fib(4) equal 3", "fib(4) equal 3", "fib(4) = 3", "fib 4 equal 3", "why is fib 4 3", "fib(4) value"],
    title: "Why is fib(4) Equal to 3?",
    answer: "Let's trace the complete evaluation tree for fib(4):\n\n1. fib(4) = fib(3) + fib(2)\n2. Expanding fib(3):\n   • fib(3) = fib(2) + fib(1)\n   • fib(2) = fib(1) + fib(0) = 1 + 0 = 1\n   • fib(1) = 1 (base case)\n   • Therefore, fib(3) = 1 + 1 = 2\n3. Expanding right child fib(2):\n   • fib(2) = fib(1) + fib(0) = 1 + 0 = 1\n4. Combining root results:\n   • fib(4) = fib(3) + fib(2) = 2 + 1 = 3\n\nThe sequence is: F(0)=0, F(1)=1, F(2)=1, F(3)=2, F(4)=3.",
    codeExample: "       fib(4) = 3\n      /          \\\n   fib(3)=2     fib(2)=1\n   /     \\       /    \\\nfib(2)=1 fib(1)=1 fib(1)=1 fib(0)=0",
    relatedTopic: "Fibonacci Tree Expansion",
  },
  {
    matchedKeywords: ["what is the current call stack", "current call stack", "call stack right now", "what is on the stack", "active frames"],
    title: "Active Call Stack Status",
    answer: "The call stack operates on the LIFO (Last-In, First-Out) principle. Every active function invocation occupies an individual activation record (stack frame) containing its local variables, parameter bindings (n), return address, and pending operations.",
    relatedTopic: "Stack Inspection",
  },
  {
    matchedKeywords: ["explain this current execution step", "explain this step", "current execution step", "what is happening right now", "current step explanation"],
    title: "Current Execution Step Analysis",
    answer: "In the current execution step, the program is either actively evaluating a condition, dispatching a recursive child, or unwinding a resolved return value up to the parent frame.",
    relatedTopic: "Step Telemetry",
  },
  {
    matchedKeywords: ["what happens during unwinding", "stack unwinding", "unwind process", "what is unwinding", "unwinding phase", "how does unwind work"],
    title: "What Happens During Stack Unwinding?",
    answer: "Stack unwinding is the ascending phase of recursion that begins as soon as a base case returns a value without making further recursive calls:\n\n1. Return Value Propagation: The base frame passes its concrete return value to the caller's instruction pointer.\n2. Frame Popping: The finished frame is popped off the top of the call stack, reclaiming its physical memory.\n3. Parent Resumption: The waiting parent frame resumes execution, substitutes the returned value into its pending expression (e.g. `n * childResult` or `leftResult + rightResult`), and either proceeds to its next branch or completes its own return.\n4. Cascade: This process repeats down the stack until the original root call resolves.",
    codeExample: "Base Case hit -> Frame Popped -> Parent Resumes -> Expression Evaluated -> Parent Returns",
    relatedTopic: "Stack Unwinding & LIFO",
  },
  {
    matchedKeywords: ["why is this node waiting", "why is node waiting", "why is it waiting", "waiting state", "node waiting"],
    title: "Why is a Frame/Node in the 'Waiting' State?",
    answer: "A stack frame or tree node enters the 'Waiting' state when it makes a recursive call to a child function. Because the current function's return expression depends on the child's return value (e.g., waiting for `factorial(n-1)` before multiplying by `n`, or waiting for `fib(n-2)` after `fib(n-1)` finishes), execution in the parent is suspended until the child call completes and returns.",
    codeExample: "return n * factorial(n - 1)  # Parent must wait for child to return",
    relatedTopic: "Suspended Activation Records",
  },
  {
    matchedKeywords: ["why does factorial call itself", "why call itself", "factorial self call"],
    title: "Why Does Factorial Call Itself?",
    answer: "Factorial uses self-reference because the mathematical problem of calculating n! inherently contains a smaller subproblem of identical structure: (n - 1)!. By reducing the input by 1 on each call, factorial breaks a complex multiplication into repeated identical smaller operations until reaching the trivial base case 1! = 1.",
    relatedTopic: "Divide and Conquer",
  },
  {
    matchedKeywords: ["why does fib(1) stop", "why does fib(0) stop", "why fib(1) return", "fib(1) base case"],
    title: "Why Does fib(1) and fib(0) Stop?",
    answer: "fib(1) and fib(0) stop because they satisfy the base condition `if n <= 1: return n`. For n = 1, it directly returns 1; for n = 0, it directly returns 0. Because no recursive calls are executed inside the base block, execution immediately switches from winding (allocating frames) to unwinding (returning values upward).",
    codeExample: "if n <= 1:\n    return n  # When n=1, returns 1. When n=0, returns 0.",
    relatedTopic: "Fibonacci Base Sentinels",
  },
  {
    matchedKeywords: ["base case", "why base", "stop", "infinite", "terminate", "recursionerror"],
    title: "Why is the Base Case Necessary?",
    answer: "The base case acts as a mandatory circuit breaker. In recursion, every function invocation allocates a new frame in call stack memory. Without a base case that returns a concrete value without calling itself, the stack grows infinitely until memory is exhausted, throwing `RecursionError: maximum recursion depth exceeded`.",
    codeExample: "if n <= 1:\n    return 1  # Base Case stops descent",
    relatedTopic: "Base Case Sentinel",
  },
  {
    matchedKeywords: ["factorial(1)", "return 1", "fact(1)", "why 1"],
    title: "Why Does factorial(1) Return 1?",
    answer: "By mathematical definition, 1! = 1 (and 0! = 1). In our recursive code, n = 1 satisfies `if n <= 1: return 1`. Because it returns a constant directly rather than calling `factorial(0)`, it marks the transition from the descending winding phase to the ascending unwinding phase.",
    relatedTopic: "Factorial Base Case Evaluation",
  },
  {
    matchedKeywords: ["return value", "reach", "unwind", "previous call", "upward", "lifo"],
    title: "How Does the Return Value Reach the Caller?",
    answer: "When a child function returns, its return value is passed back to the instruction pointer stored in its parent's activation record on the stack. The child frame is popped (removed from memory), and the parent frame resumes execution, substituting the returned value into its pending expression (e.g., `n * [result]`).",
    relatedTopic: "Stack Unwinding & LIFO",
  },
  {
    matchedKeywords: ["call stack", "frame", "memory", "stack frame", "activation record"],
    title: "What is Stored in a Call Stack Frame?",
    answer: "Each stack frame contains: 1) Function arguments (like `n`), 2) Local variables, 3) Return address (where to resume code in the caller), and 4) Saved CPU registers. Stack frames are managed in strict LIFO (Last-In, First-Out) order.",
    relatedTopic: "Activation Records",
  },
  {
    matchedKeywords: ["memoization", "cache", "dp", "dynamic programming", "optimize"],
    title: "How Does Memoization Make Recursion O(n)?",
    answer: "Memoization wraps recursion with an in-memory hash table or dictionary. Before calculating `fib(n)`, the function checks `if n in memo`. If found, it returns the cached result in O(1) time, pruning entire subtrees of redundant calculations and reducing total calls from exponential O(2^n) to linear O(n).",
    codeExample: "if n in memo:\n    return memo[n]  # O(1) cache hit",
    relatedTopic: "Top-Down Dynamic Programming",
  },
  {
    matchedKeywords: ["tail recursion", "tail call", "optimization", "tco", "loop"],
    title: "What is Tail Recursion?",
    answer: "Tail recursion occurs when the recursive call is the absolute final action in the function (with no pending operations like `n * ...` waiting for the return). Compilers with Tail Call Optimization (TCO) can reuse the same stack frame, converting recursion into a loop with O(1) auxiliary stack space.",
    codeExample: "def fact_tail(n, acc=1):\n    if n <= 1: return acc\n    return fact_tail(n - 1, n * acc)  # Tail call",
    relatedTopic: "Tail Call Optimization",
  },
  {
    matchedKeywords: ["tower of hanoi", "hanoi", "disks", "pegs"],
    title: "How Does Tower of Hanoi Use Recursion?",
    answer: "Moving n disks from source to target peg decomposes into three recursive steps: 1) Move n-1 disks to auxiliary peg, 2) Move largest disk directly to target, 3) Move n-1 disks from auxiliary peg to target. It requires 2^n - 1 minimum moves.",
    relatedTopic: "Divide & Conquer",
  },
];

export function answerLearnerQuestion(
  question: string,
  currentAlgo = "factorial",
  currentStepIndex = 0,
  context?: RuntimeContext
): {
  title: string;
  answer: string;
  codeExample?: string;
  relatedTopic?: string;
  isContextAware?: boolean;
} {
  const qLower = question.toLowerCase().trim();

  if (!qLower) {
    return {
      title: "Ask a Question",
      answer: "Please type a question about recursion, call stacks, base cases, or algorithm behavior.",
    };
  }

  // Handle specific context questions dynamically when runtime context is present
  if (qLower.includes("current call stack") || qLower.includes("what is on the stack") || qLower.includes("active frames")) {
    if (context && context.callStackFrames && context.callStackFrames.length > 0) {
      const framesList = context.callStackFrames
        .map((f, i) => `${i + 1}. ${f.callLabel} [State: ${f.state}]${f.pendingOp ? ` (Pending: ${f.pendingOp})` : ""}${f.returnValue !== undefined ? ` (Return: ${f.returnValue})` : ""}`)
        .join("\n");
      return {
        title: "Active Call Stack Inspection",
        answer: `Currently at Step ${(context.stepIndex ?? currentStepIndex) + 1}, there are ${context.callStackFrames.length} frame(s) active on the call stack:\n\n${framesList}\n\nThe top frame is currently executing, while frames below it are waiting for their child calls to return.`,
        relatedTopic: "Live Call Stack",
        isContextAware: true,
      };
    } else if (context && context.callStackFrames && context.callStackFrames.length === 0) {
      return {
        title: "Active Call Stack Inspection",
        answer: `Currently at Step ${(context.stepIndex ?? currentStepIndex) + 1}, the call stack is EMPTY (0 frames). All activation records have completed execution and returned their values.`,
        relatedTopic: "Live Call Stack",
        isContextAware: true,
      };
    }
  }

  if (qLower.includes("current execution step") || qLower.includes("explain this step") || qLower.includes("what is happening right now")) {
    if (context && context.stepDescription) {
      return {
        title: `Step ${(context.stepIndex ?? currentStepIndex) + 1} Explanation (${context.algorithm || currentAlgo})`,
        answer: `Current Action: ${context.stepDescription}\n\n• Active Source Line: Line ${context.activeLine || 1}\n• Condition Evaluation: ${context.conditionCheck || "None"}\n• Next Scheduled Action: ${context.nextAction || "Continue"}\n• Active Stack Depth: ${context.currentStackDepth || 0} frame(s)`,
        relatedTopic: "Step Telemetry",
        isContextAware: true,
      };
    }
  }

  // Find best match in knowledge bank
  for (const item of QA_KNOWLEDGE_BANK) {
    if (item.matchedKeywords.some((kw) => qLower.includes(kw))) {
      return {
        title: item.title,
        answer: item.answer,
        codeExample: item.codeExample,
        relatedTopic: item.relatedTopic,
      };
    }
  }

  // Context-aware dynamic fallback
  const stepNum = context?.stepIndex !== undefined ? context.stepIndex + 1 : currentStepIndex + 1;
  const algoName = context?.algorithm || currentAlgo;
  const activeDetail = context?.stepDescription ? `\n\nCurrently, the engine reports: "${context.stepDescription}".` : "";

  return {
    title: `Recursion Analysis for: "${question.length > 40 ? question.slice(0, 40) + "..." : question}"`,
    answer: `In ${algoName} recursion (currently at Step ${stepNum}), execution flows through two strict phases: the winding phase (stacking activation frames in LIFO memory) and the unwinding phase (propagating return values upward once the base condition resolves). Every subproblem reduces input size until reaching the sentinel base case.${activeDetail}`,
    relatedTopic: "Algorithmic Invariants",
    isContextAware: true,
  };
}

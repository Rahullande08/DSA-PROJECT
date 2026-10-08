export interface Challenge {
  id: string;
  trackId: string;
  trackName: string;
  trackIndex: number;
  trackTotal: number;
  title: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "HARD";
  timeEstimate: string;
  description: string;
  codeFilename: string;
  code: string;
  prompt: string;
  options: {
    label: string;
    letter: "A" | "B" | "C" | "D";
    subtext: string;
    isCorrect: boolean;
  }[];
  hint: string;
  explanationSteps: {
    stepTitle: string;
    text: string;
  }[];
  stackFrames: {
    label: string;
    type: "ROOT" | "FRAME" | "BASE";
    waitingText: string;
    returnsText?: string;
  }[];
  asciiUnwindTrace: string;
  guardErrorText?: string;
}

export interface TrackSummary {
  id: string;
  name: string;
  icon: string;
  completedCount: number;
  totalCount: number;
  challenges: Challenge[];
}

export const ALL_CHALLENGES: Challenge[] = [
  // ==========================================
  // Track 1: Base Case Identification
  // ==========================================
  {
    id: "track1_c1",
    trackId: "track1",
    trackName: "1. Base Case Identification",
    trackIndex: 1,
    trackTotal: 4,
    title: "Challenge 01: Identifying Base Case in Factorial",
    level: "BEGINNER",
    timeEstimate: "00:45",
    description: "The base case acts as the termination anchor. Without it, recursion descends indefinitely without bounds.",
    codeFilename: "factorial_guard.py",
    code: `def factorial(n):
    if n <= 1:
        return 1  # Stop condition
    return n * factorial(n - 1)`,
    prompt: "Which line in this function serves as the base case guard that stops the recursive descent?",
    options: [
      {
        letter: "A",
        label: "Line 2: if n <= 1: return 1",
        subtext: "Evaluates condition directly and returns constant 1 without further recursive calls",
        isCorrect: true,
      },
      {
        letter: "B",
        label: "Line 1: def factorial(n):",
        subtext: "Function header declaration",
        isCorrect: false,
      },
      {
        letter: "C",
        label: "Line 4: return n * factorial(n - 1)",
        subtext: "The recursive step that dispatches child calls",
        isCorrect: false,
      },
      {
        letter: "D",
        label: "There is no base case in this function",
        subtext: "Incorrect: the function will safely terminate when n <= 1",
        isCorrect: false,
      },
    ],
    hint: "Look for the conditional statement that returns a concrete number instead of making another call to factorial().",
    explanationSteps: [
      { stepTitle: "1. Condition Check", text: "When n reaches 1 or 0, the check `if n <= 1` evaluates to True." },
      { stepTitle: "2. Constant Return", text: "Line 3 returns 1 directly without allocating another child frame." },
      { stepTitle: "3. Unwinding Trigger", text: "This constant allows all previously suspended frames to begin resolving their multiplications." },
    ],
    stackFrames: [
      { label: "factorial(n=2)", type: "FRAME", waitingText: "Waiting: 2 * factorial(1)" },
      { label: "factorial(n=1)", type: "BASE", waitingText: "Base case matched: n <= 1", returnsText: "1" },
    ],
    asciiUnwindTrace: `[Call Dive]       [Return Unwind (LIFO)]
factorial(2) ---> (2 * 1) = 2 [RESULT]
  factorial(1) [BASE] ===> 1`,
    guardErrorText: "If n <= 1 were omitted, factorial(0), factorial(-1), etc. would execute forever until stack overflow.",
  },

  // ==========================================
  // Track 2: Stack Depth & Call Order
  // ==========================================
  {
    id: "track2_c3",
    trackId: "track2",
    trackName: "2. Stack Depth & Call Order",
    trackIndex: 3,
    trackTotal: 5,
    title: "Challenge 03: Trace the Unwind Sequence",
    level: "INTERMEDIATE",
    timeEstimate: "01:42",
    description: "Recursive functions do not yield final answers during the forward descending dive. Instead, results coalesce during the LIFO return unwind phase as call records pop off the execution stack.",
    codeFilename: "unwind_accumulator.py",
    code: `def mystery(n):
    if n == 0:
        return 10  # Base Case Sentinel
    return mystery(n - 1) + 2`,
    prompt: "When mystery(3) is invoked, what is the exact chronological sequence of return values popped off the call stack during the return phase?",
    options: [
      {
        letter: "A",
        label: "10 → 12 → 14 → 16",
        subtext: "Base frame resolves 10, each parent adds +2 during unwind",
        isCorrect: true,
      },
      {
        letter: "B",
        label: "16 → 14 → 12 → 10",
        subtext: "Descending forward trace (Reverse stack order)",
        isCorrect: false,
      },
      {
        letter: "C",
        label: "0 → 1 → 2 → 3",
        subtext: "Parameter values rather than accumulated returns",
        isCorrect: false,
      },
      {
        letter: "D",
        label: "10 → 10 → 10 → 10",
        subtext: "Pure base constant without parent caller additions",
        isCorrect: false,
      },
    ],
    hint: "Recall LIFO order: the deepest call (mystery(0)) resolves first with 10. Then mystery(1) calculates 10 + 2, and so forth upward.",
    explanationSteps: [
      { stepTitle: "1. Base Reach", text: "mystery(0) matches base condition n == 0 and immediately evaluates to 10." },
      { stepTitle: "2. Frame #1 Unwinds", text: "mystery(1) waits for mystery(0), performs 10 + 2 = 12, popping 12." },
      { stepTitle: "3. Frame #2 Unwinds", text: "mystery(2) takes 12, performs 12 + 2 = 14, popping 14." },
      { stepTitle: "4. Root Frame Unwinds", text: "mystery(3) takes 14, performs 14 + 2 = 16, returning final value 16." },
    ],
    stackFrames: [
      { label: "mystery(n=3)", type: "ROOT", waitingText: "Waiting: mystery(2) + 2 = 16" },
      { label: "mystery(n=2)", type: "FRAME", waitingText: "Waiting: mystery(1) + 2 = 14" },
      { label: "mystery(n=1)", type: "FRAME", waitingText: "Waiting: mystery(0) + 2 = 12" },
      { label: "mystery(n=0)", type: "BASE", waitingText: "Returns sentinel", returnsText: "10" },
    ],
    asciiUnwindTrace: `[Call Dive]       [Return Unwind (LIFO)]
mystery(3) ----> (14 + 2) = 16 [RESULT]
  mystery(2) --->  (12 + 2) = 14
    mystery(1) ->   (10 + 2) = 12
      mystery(0) [BASE] ===> 10`,
    guardErrorText: "If n == 0 were omitted or n - 1 stepped backwards towards infinity (e.g. n + 1), frame memory consumes Python's default stack threshold, triggering: RecursionError: maximum recursion depth exceeded.",
  },

  // ==========================================
  // Track 3: Return Value Accumulation
  // ==========================================
  {
    id: "track3_c1",
    trackId: "track3",
    trackName: "3. Return Value Accumulation",
    trackIndex: 1,
    trackTotal: 4,
    title: "Challenge 01: Exponentiation Accumulation",
    level: "INTERMEDIATE",
    timeEstimate: "01:15",
    description: "Multiplicative accumulation delays calculation until base evaluation yields 1.",
    codeFilename: "power_calc.py",
    code: `def power(x, n):
    if n == 0:
        return 1
    return x * power(x, n - 1)`,
    prompt: "For power(2, 4), what is the maximum depth of the call stack before any multiplication occurs?",
    options: [
      {
        letter: "A",
        label: "5 frames (n=4, 3, 2, 1, 0)",
        subtext: "All 5 invocations must be simultaneously active before base case n=0 fires",
        isCorrect: true,
      },
      {
        letter: "B",
        label: "4 frames (n=4, 3, 2, 1)",
        subtext: "Forgets the base case call power(2, 0)",
        isCorrect: false,
      },
      {
        letter: "C",
        label: "16 frames",
        subtext: "Confuses the result 2^4 = 16 with stack depth",
        isCorrect: false,
      },
      {
        letter: "D",
        label: "1 frame",
        subtext: "Linear loops use 1 frame, but recursion allocates a new frame per call",
        isCorrect: false,
      },
    ],
    hint: "Count every invocation from power(2, 4) down to the base case power(2, 0). All remain paused on the stack.",
    explanationSteps: [
      { stepTitle: "1. Stacking Phase", text: "power(2,4) calls power(2,3) calls power(2,2) calls power(2,1) calls power(2,0). That is 5 distinct frames." },
      { stepTitle: "2. Base Evaluation", text: "power(2,0) returns 1 without further stacking." },
      { stepTitle: "3. Unwinding", text: "Multiplications (2 * 1, 2 * 2, 2 * 4, 2 * 8 = 16) only execute as frames pop." },
    ],
    stackFrames: [
      { label: "power(x=2, n=4)", type: "ROOT", waitingText: "Waiting: 2 * power(2, 3)" },
      { label: "power(x=2, n=3)", type: "FRAME", waitingText: "Waiting: 2 * power(2, 2)" },
      { label: "power(x=2, n=2)", type: "FRAME", waitingText: "Waiting: 2 * power(2, 1)" },
      { label: "power(x=2, n=1)", type: "FRAME", waitingText: "Waiting: 2 * power(2, 0)" },
      { label: "power(x=2, n=0)", type: "BASE", waitingText: "Base hit: n=0", returnsText: "1" },
    ],
    asciiUnwindTrace: `[Call Dive]           [Return Unwind (LIFO)]
power(2, 4) --------> (2 * 8) = 16 [RESULT]
  power(2, 3) ------>  (2 * 4) = 8
    power(2, 2) ---->   (2 * 2) = 4
      power(2, 1) -->    (2 * 1) = 2
        power(2, 0) [BASE] ===> 1`,
    guardErrorText: "Stack memory footprint scales linearly O(n) with the exponent n.",
  },

  // ==========================================
  // Track 4: Branching & Subproblems
  // ==========================================
  {
    id: "track4_c1",
    trackId: "track4",
    trackName: "4. Branching & Subproblems",
    trackIndex: 1,
    trackTotal: 5,
    title: "Challenge 01: Fibonacci Redundant Subproblem Count",
    level: "ADVANCED",
    timeEstimate: "02:00",
    description: "Tree recursion without memoization branches dual paths at every node, repeating calculations.",
    codeFilename: "fib_naive.py",
    code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`,
    prompt: "When computing naive fib(4), how many times is fib(2) called across the full binary recursion tree?",
    options: [
      {
        letter: "A",
        label: "2 times (once in left subtree, once in right subtree)",
        subtext: "fib(4) calls fib(3) (which calls fib(2)) AND fib(4) calls fib(2) directly",
        isCorrect: true,
      },
      {
        letter: "B",
        label: "1 time only",
        subtext: "Incorrect: without memoization, subproblems are never reused",
        isCorrect: false,
      },
      {
        letter: "C",
        label: "4 times",
        subtext: "Overestimate for n=4",
        isCorrect: false,
      },
      {
        letter: "D",
        label: "0 times",
        subtext: "fib(2) is definitely invoked as an intermediate subproblem",
        isCorrect: false,
      },
    ],
    hint: "Draw the tree: fib(4) branches into fib(3) and fib(2). Then fib(3) branches into fib(2) and fib(1). Notice how fib(2) appears twice.",
    explanationSteps: [
      { stepTitle: "1. Root Dispatch", text: "fib(4) branches to fib(3) (left) and fib(2) (right)." },
      { stepTitle: "2. Left Branch Subproblem", text: "fib(3) in turn branches to fib(2) (left) and fib(1) (right)." },
      { stepTitle: "3. Redundant Work", text: "fib(2) is computed completely from scratch twice, showing why naive Fibonacci is O(2^n)." },
    ],
    stackFrames: [
      { label: "fib(n=4)", type: "ROOT", waitingText: "Waiting: fib(3) + fib(2)" },
      { label: "fib(n=3)", type: "FRAME", waitingText: "Waiting: fib(2) + fib(1)" },
      { label: "fib(n=2) [Redundant #1]", type: "FRAME", waitingText: "Waiting: fib(1) + fib(0)" },
    ],
    asciiUnwindTrace: `[Binary Tree Topology]
        fib(4)
       /      \\
     fib(3)    fib(2)* [REDUNDANT]
     /    \\     /   \\
  fib(2)* fib(1) fib(1) fib(0)`,
    guardErrorText: "Memoization caches the first evaluation of fib(2)=1 so the second occurrence is an instant O(1) return.",
  },
];

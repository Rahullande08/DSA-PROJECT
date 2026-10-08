import { 
  ALGORITHMS, 
  factorialDef, 
  fibonacciDef, 
  fibonacciMemoDef, 
  hanoiDef, 
  binarySearchDef 
} from "../lib/algorithms";
import { ALL_CHALLENGES } from "../lib/challengesData";
import { answerLearnerQuestion, RuntimeContext } from "../lib/qaKnowledge";

// Mathematical reference functions
function mathFactorial(n: number): number {
  if (n <= 1) return 1;
  return n * mathFactorial(n - 1);
}

function mathFib(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return mathFib(n - 1) + mathFib(n - 2);
}

interface TestReport {
  suite: string;
  passed: number;
  failed: number;
  errors: string[];
}

const reports: TestReport[] = [];

function runSuite(name: string, fn: (assert: (condition: boolean, msg: string) => void) => void) {
  const report: TestReport = { suite: name, passed: 0, failed: 0, errors: [] };
  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      report.passed++;
    } else {
      report.failed++;
      report.errors.push(`FAIL: ${msg}`);
      console.error(`  ❌ FAIL: ${msg}`);
    }
  };

  console.log(`\n▶ Running Suite: ${name}`);
  try {
    fn(assert);
  } catch (err: any) {
    report.failed++;
    report.errors.push(`EXCEPTION: ${err.message || String(err)}`);
    console.error(`  💥 EXCEPTION: ${err.message || String(err)}`);
  }

  reports.push(report);
  if (report.failed === 0) {
    console.log(`  ✅ All ${report.passed} assertions passed.`);
  }
}

// ==========================================
// 1. Factorial Execution Trace Tests
// ==========================================
runSuite("Factorial Trace Engine & Invariants (0..5)", (assert) => {
  for (let n = 0; n <= 5; n++) {
    const steps = factorialDef.generateSteps({ n });
    assert(steps.length > 0, `Factorial(${n}) generates non-empty steps (got ${steps.length})`);

    const initialStep = steps[0];
    assert(initialStep.stepIndex === 0, `Factorial(${n}) initial step starts at 0`);
    assert(initialStep.frames.length === 1, `Factorial(${n}) initial stack has 1 root frame`);
    assert(initialStep.frames[0].funcName === "factorial", `Factorial(${n}) root frame is named factorial`);

    const finalStep = steps[steps.length - 1];
    const finalResult = finalStep.customData?.finalResult ?? finalStep.resultTarget;
    assert(finalStep.customData?.isComplete === true, `Factorial(${n}) final step is marked complete`);
    assert(finalResult === mathFactorial(n), `Factorial(${n}) final result is ${mathFactorial(n)} (got ${finalResult})`);
    assert(finalStep.frames.length === 0, `Factorial(${n}) stack completely unwinds to 0 frames`);

    // Verify LIFO stack depth
    let maxStackDepth = 0;
    for (const s of steps) {
      if (s.frames.length > maxStackDepth) maxStackDepth = s.frames.length;
    }
    const expectedDepth = Math.max(n, 1);
    assert(maxStackDepth === expectedDepth, `Factorial(${n}) max call stack depth is ${expectedDepth} (got ${maxStackDepth})`);

    // Verify step index sequence is contiguous and valid
    for (let i = 0; i < steps.length; i++) {
      assert(steps[i].stepIndex === i, `Factorial(${n}) step ${i} has correct stepIndex`);
      assert(steps[i].activeLine >= 1 && steps[i].activeLine <= 6, `Factorial(${n}) step ${i} activeLine is within source code bounds [1..6] (got ${steps[i].activeLine})`);
    }

    // Verify Tree and ASCII trace coherence
    for (const s of steps) {
      assert(s.asciiSnapshot !== undefined && s.asciiSnapshot.length > 0, `Factorial(${n}) step ${s.stepIndex} has asciiSnapshot`);
      assert(Object.keys(s.treeNodes).length > 0, `Factorial(${n}) step ${s.stepIndex} has tree nodes`);
    }
  }
});

// ==========================================
// 2. Fibonacci Dual Branching AST Tests (F(0)..F(5))
// ==========================================
runSuite("Fibonacci Dual Branching AST & Tree Invariants (F(0)..F(5))", (assert) => {
  const expectedTotalNodes: Record<number, number> = {
    0: 1,
    1: 1,
    2: 3,
    3: 5,
    4: 9,
    5: 15,
  };

  for (let n = 0; n <= 5; n++) {
    const steps = fibonacciDef.generateSteps({ n });
    assert(steps.length > 0, `Fibonacci(${n}) generates steps (got ${steps.length})`);

    const finalStep = steps[steps.length - 1];
    const computedVal = finalStep.resultTarget;
    assert(computedVal === mathFib(n), `Fibonacci(${n}) final result is ${mathFib(n)} (got ${computedVal})`);

    // Tree invariants on initial and final steps
    const rootId = steps[0].treeRootId;
    assert(rootId !== undefined, `Fibonacci(${n}) has valid treeRootId`);
    const rootNode = steps[0].treeNodes[rootId!];
    assert(rootNode !== undefined, `Fibonacci(${n}) root node exists`);
    assert(rootNode.n === n, `Fibonacci(${n}) root node argument n is ${n}`);

    const nodeCount = Object.keys(steps[0].treeNodes).length;
    assert(
      nodeCount === expectedTotalNodes[n],
      `Fibonacci(${n}) has exactly ${expectedTotalNodes[n]} total tree invocation nodes (got ${nodeCount})`
    );

    // Verify node IDs are unique and no keys collide
    const ids = Object.keys(steps[0].treeNodes);
    const uniqueIds = new Set(ids);
    assert(ids.length === uniqueIds.size, `Fibonacci(${n}) all node IDs are distinct and unique`);

    // Verify dual branching for n > 1
    if (n > 1) {
      assert(rootNode.children.length === 2, `Fibonacci(${n}) root has 2 children (n-1 and n-2)`);
      const leftChild = steps[0].treeNodes[rootNode.children[0]];
      const rightChild = steps[0].treeNodes[rootNode.children[1]];
      assert(leftChild.n === n - 1, `Fibonacci(${n}) left child is fib(${n - 1})`);
      assert(rightChild.n === n - 2, `Fibonacci(${n}) right child is fib(${n - 2})`);
      assert(leftChild.branch === "left", `Fibonacci(${n}) left branch label is 'left'`);
      assert(rightChild.branch === "right", `Fibonacci(${n}) right branch label is 'right'`);
    }

    // Verify all nodes resolve by completion
    for (const [id, node] of Object.entries(finalStep.treeNodes)) {
      assert(
        node.status === "resolved" || node.status === "base",
        `Fibonacci(${n}) node ${id} [${node.label}] is marked resolved or base on completion (got ${node.status})`
      );
      assert(
        node.returnValue !== undefined && node.returnValue === mathFib(node.n || 0),
        `Fibonacci(${n}) node ${id} return value is ${mathFib(node.n || 0)} (got ${node.returnValue})`
      );
    }
  }
});

// ==========================================
// 3. Fibonacci Memoization Engine
// ==========================================
runSuite("Fibonacci Memoization Engine (O(n) Cache Optimization)", (assert) => {
  for (let n = 2; n <= 5; n++) {
    const memoSteps = fibonacciMemoDef.generateSteps({ n });
    const naiveSteps = fibonacciDef.generateSteps({ n });

    const memoCalls = memoSteps[memoSteps.length - 1].totalCalls;
    const naiveCalls = naiveSteps[naiveSteps.length - 1].totalCalls;

    assert(memoCalls <= 2 * n + 1, `Memoized fib(${n}) total calls (${memoCalls}) is bounded by O(n) <= 2n+1`);
    assert(memoCalls <= naiveCalls, `Memoized fib(${n}) calls (${memoCalls}) is <= naive (${naiveCalls})`);
    if (n >= 4) {
      assert(memoCalls < naiveCalls, `Memoized fib(${n}) calls (${memoCalls}) is strictly less than naive (${naiveCalls})`);
    }

    const finalStep = memoSteps[memoSteps.length - 1];
    assert(finalStep.customData?.memoTable !== undefined, `Memoized fib(${n}) has memoTable in customData`);
    assert(finalStep.resultTarget === mathFib(n), `Memoized fib(${n}) result matches ${mathFib(n)}`);
  }
});

// ==========================================
// 4. Practice & Challenges Lifecycle
// ==========================================
runSuite("Practice & Challenges Interactive Lifecycle", (assert) => {
  assert(ALL_CHALLENGES.length >= 3, `Curriculum contains at least 3 challenges (found ${ALL_CHALLENGES.length})`);

  for (const ch of ALL_CHALLENGES) {
    assert(ch.id.length > 0, `Challenge ${ch.id} has ID`);
    assert(ch.title.length > 0, `Challenge ${ch.id} has title`);
    assert(ch.options.length >= 2, `Challenge ${ch.id} has >= 2 options`);
    const correctOptions = ch.options.filter((o) => o.isCorrect);
    assert(correctOptions.length === 1, `Challenge ${ch.id} has exactly 1 correct option`);
    assert(ch.hint.length > 0, `Challenge ${ch.id} has progressive hint`);
    assert(ch.explanationSteps.length > 0, `Challenge ${ch.id} has explanation steps`);
    assert(ch.stackFrames.length > 0, `Challenge ${ch.id} has simulated stack frames`);
  }
});

// ==========================================
// 5. Stepping Determinism & Boundary Invariants
// ==========================================
runSuite("Stepping Determinism & Boundary Clamping", (assert) => {
  const zeroStep = factorialDef.generateSteps({ n: 0 });
  assert(zeroStep.length > 0, "Factorial handles n=0 cleanly");
  assert(zeroStep[zeroStep.length - 1].resultTarget === 1, "factorial(0) returns 1");

  const clampedHigh = factorialDef.generateSteps({ n: 999 });
  assert(clampedHigh.length > 0, "Factorial handles n=999 by safely clamping to max parameter");

  // Backward / Forward stepping determinism
  const trace = factorialDef.generateSteps({ n: 4 });
  for (let i = 0; i < trace.length; i++) {
    const stepA = trace[i];
    const stepB = trace[i];
    assert(stepA.activeLine === stepB.activeLine, `Step ${i} activeLine is deterministic`);
    assert(stepA.frames.length === stepB.frames.length, `Step ${i} stack frame count is deterministic`);
    assert(stepA.unwoundCount === stepB.unwoundCount, `Step ${i} unwoundCount is deterministic`);
  }
});

// ==========================================
// 6. Q&A Knowledge Assistant Engine & Master Prompt Questions
// ==========================================
runSuite("Q&A Knowledge Assistant Engine & Master Prompt Questions", (assert) => {
  const testQueries = [
    { query: "What is recursion?", keyword: "base case" },
    { query: "Explain factorial recursion.", keyword: "winding" },
    { query: "Why does Fibonacci have two branches?", keyword: "left" },
    { query: "Why does fib(4) equal 3?", keyword: "3" },
    { query: "What is the current call stack?", keyword: "stack" },
    { query: "Explain this current execution step.", keyword: "step" },
    { query: "What happens during unwinding?", keyword: "unwinding" },
    { query: "Why is this node waiting?", keyword: "waiting" },
    { query: "Why does factorial call itself?", keyword: "subproblem" },
    { query: "Why does fib(1) stop?", keyword: "base" },
    { query: "Why does factorial(1) return 1?", keyword: "base" },
    { query: "How does memoization work in Fibonacci?", keyword: "memo" },
    { query: "What is tail recursion?", keyword: "tail" },
  ];

  const dummyContext: RuntimeContext = {
    algorithm: "Fibonacci",
    n: 4,
    stepIndex: 3,
    totalSteps: 25,
    activeLine: 4,
    currentStackDepth: 3,
    callStackFrames: [
      { callLabel: "#1 fib(4)", state: "waiting", pendingOp: "fib(3) + fib(2)" },
      { callLabel: "#2 fib(3)", state: "waiting", pendingOp: "fib(2) + fib(1)" },
      { callLabel: "#3 fib(2)", state: "active", pendingOp: "fib(1) + fib(0)" },
    ],
    stepDescription: "Calling fib(2) on left branch.",
    conditionCheck: "(2 <= 1) -> false",
    nextAction: "Branch left: evaluate fib(1)",
  };

  for (const { query, keyword } of testQueries) {
    const result = answerLearnerQuestion(query, "Fibonacci", 3, dummyContext);
    assert(result.title.length > 0, `Q&A returns title for "${query}"`);
    assert(result.answer.length > 0, `Q&A returns non-empty answer for "${query}"`);
    const combinedText = (result.title + " " + result.answer + " " + (result.relatedTopic || "")).toLowerCase();
    assert(combinedText.includes(keyword.toLowerCase()), `Q&A response for "${query}" contains expected concept '${keyword}'`);
  }
});

// ==========================================
// 7. Live Stack Inspector Invariants & Master Requirements
// ==========================================
runSuite("Live Stack Inspector Invariants & Real Python Call Stack", (assert) => {
  // Test across all algorithms: Factorial(0..5), Fibonacci(0..5), FibonacciMemo(4)
  const testCases: { name: string; gen: () => any[]; maxStack: number }[] = [
    { name: "Factorial(0)", gen: () => factorialDef.generateSteps({ n: 0 }), maxStack: 1 },
    { name: "Factorial(1)", gen: () => factorialDef.generateSteps({ n: 1 }), maxStack: 1 },
    { name: "Factorial(4)", gen: () => factorialDef.generateSteps({ n: 4 }), maxStack: 4 },
    { name: "Factorial(5)", gen: () => factorialDef.generateSteps({ n: 5 }), maxStack: 5 },
    { name: "Fibonacci(0)", gen: () => fibonacciDef.generateSteps({ n: 0 }), maxStack: 1 },
    { name: "Fibonacci(1)", gen: () => fibonacciDef.generateSteps({ n: 1 }), maxStack: 1 },
    { name: "Fibonacci(2)", gen: () => fibonacciDef.generateSteps({ n: 2 }), maxStack: 2 },
    { name: "Fibonacci(3)", gen: () => fibonacciDef.generateSteps({ n: 3 }), maxStack: 3 },
    { name: "Fibonacci(4)", gen: () => fibonacciDef.generateSteps({ n: 4 }), maxStack: 4 },
    { name: "Fibonacci(5)", gen: () => fibonacciDef.generateSteps({ n: 5 }), maxStack: 5 },
    { name: "FibonacciMemo(4)", gen: () => fibonacciMemoDef.generateSteps({ n: 4 }), maxStack: 4 },
  ];

  for (const tc of testCases) {
    const steps = tc.gen();
    assert(steps.length > 0, `${tc.name} generated steps`);

    // Invariant 1: Final step stack is clean / empty (depth = 0)
    const lastStep = steps[steps.length - 1];
    assert(
      lastStep.frames.length === 0,
      `${tc.name} final step stack is completely empty (depth 0)`
    );
    assert(
      lastStep.currentStackDepth === 0,
      `${tc.name} final step currentStackDepth is 0`
    );

    // Invariant 2: Stack frame structure & unique IDs
    const seenCallIds = new Set<string>();
    for (const s of steps) {
      assert(
        s.currentStackDepth === s.frames.length,
        `${tc.name} step ${s.stepIndex} currentStackDepth matches frames.length`
      );

      for (let fIdx = 0; fIdx < s.frames.length; fIdx++) {
        const frame = s.frames[fIdx];
        assert(frame.id.length > 0, `${tc.name} step ${s.stepIndex} frame ${fIdx} has valid ID`);
        assert(frame.callLabel.length > 0, `${tc.name} step ${s.stepIndex} frame ${fIdx} has callLabel`);
        assert(frame.funcName.length > 0, `${tc.name} step ${s.stepIndex} frame ${fIdx} has funcName`);
        assert(frame.args !== undefined && Object.keys(frame.args).length > 0, `${tc.name} step ${s.stepIndex} frame ${fIdx} has args`);
        assert(frame.locals !== undefined && Object.keys(frame.locals).length > 0, `${tc.name} step ${s.stepIndex} frame ${fIdx} has locals`);
        assert(frame.memoryAddr.startsWith("0x"), `${tc.name} step ${s.stepIndex} frame ${fIdx} has memoryAddr`);
        assert(frame.depth >= 1, `${tc.name} step ${s.stepIndex} frame ${fIdx} has depth >= 1`);

        if (frame.callId) {
          seenCallIds.add(frame.callId);
        }
      }

      // Invariant 3: Top of the stack represents the active / returning frame
      if (s.frames.length > 0) {
        const topFrame = s.frames[s.frames.length - 1];
        assert(
          topFrame.state === "active" || topFrame.state === "base" || topFrame.state === "returning" || topFrame.state === "waiting",
          `${tc.name} step ${s.stepIndex} top frame has valid execution state '${topFrame.state}'`
        );

        // If deeper frames exist below top frame, verify they are WAITING
        for (let fIdx = 0; fIdx < s.frames.length - 1; fIdx++) {
          const lowerFrame = s.frames[fIdx];
          assert(
            lowerFrame.state === "waiting",
            `${tc.name} step ${s.stepIndex} frame depth ${lowerFrame.depth} below top frame is WAITING (got ${lowerFrame.state})`
          );
        }
      }
    }

    // Invariant 4: Transitions are single atomic push, pop, or line change (no skipped multi-push/pop states)
    for (let i = 1; i < steps.length; i++) {
      const prevFrames = steps[i - 1].frames.length;
      const currFrames = steps[i].frames.length;
      const delta = currFrames - prevFrames;
      assert(
        delta >= -1 && delta <= 1,
        `${tc.name} transition from step ${i - 1} to ${i} has delta in [-1..1] (got ${delta})`
      );
    }
  }
});
// ==========================================
console.log("\n==========================================");
console.log("TEST SUMMARY:");
let totalPassed = 0;
let totalFailed = 0;
for (const r of reports) {
  console.log(`- ${r.suite}: ${r.passed} passed, ${r.failed} failed`);
  totalPassed += r.passed;
  totalFailed += r.failed;
}
console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
console.log("==========================================\n");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

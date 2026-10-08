"use client";

import React, { useState } from "react";
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Circle, 
  Clock, 
  Play, 
  Zap, 
  ShieldAlert, 
  Terminal, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  Eye,
  RotateCcw,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";
import { ALL_CHALLENGES, Challenge } from "../../lib/challengesData";
import { AsciiSweepCanvas } from "../AsciiSweep/AsciiSweepCanvas";

export const PracticeView: React.FC = () => {
  // Challenge State
  const [currentChallengeId, setCurrentChallengeId] = useState<string>("track2_c3");
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [attemptState, setAttemptState] = useState<"unanswered" | "correct" | "incorrect" | "revealed">("unanswered");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);

  // User Progress Stats
  const [completedChallengeIds, setCompletedChallengeIds] = useState<Set<string>>(new Set());
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [correctAttempts, setCorrectAttempts] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  const currentChallenge: Challenge =
    ALL_CHALLENGES.find((c) => c.id === currentChallengeId) || ALL_CHALLENGES[1];

  const currentChallengeIndex = ALL_CHALLENGES.findIndex((c) => c.id === currentChallenge.id);

  const handleSelectOption = (idx: number) => {
    if (attemptState === "correct" || attemptState === "revealed") return;
    setSelectedOptionIdx(idx);
    setAttemptState("unanswered");
  };

  const handleTestHypothesis = () => {
    if (selectedOptionIdx === null) return;

    setTotalAttempts((prev) => prev + 1);
    const isCorrect = currentChallenge.options[selectedOptionIdx].isCorrect;

    if (isCorrect) {
      setAttemptState("correct");
      setCorrectAttempts((prev) => prev + 1);
      setCompletedChallengeIds((prev) => {
        const next = new Set(prev);
        next.add(currentChallenge.id);
        return next;
      });

      setIsSweeping(true);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } else {
      setAttemptState("incorrect");
      setStreak(0);
    }
  };

  const handleResetChallenge = () => {
    setSelectedOptionIdx(null);
    setAttemptState("unanswered");
    setShowHint(false);
  };

  const handleRevealSolution = () => {
    setAttemptState("revealed");
    const correctIdx = currentChallenge.options.findIndex((o) => o.isCorrect);
    setSelectedOptionIdx(correctIdx);
  };

  const handleNavChallenge = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < ALL_CHALLENGES.length) {
      setCurrentChallengeId(ALL_CHALLENGES[newIndex].id);
      setSelectedOptionIdx(null);
      setAttemptState("unanswered");
      setShowHint(false);
    }
  };

  const accuracyPct = totalAttempts > 0 ? ((correctAttempts / totalAttempts) * 100).toFixed(1) : "100";

  return (
    <div className="max-w-[1780px] mx-auto px-4 lg:px-6 py-6 space-y-5 relative">
      {/* ASCII Sweep Canvas Overlay */}
      <AsciiSweepCanvas
        isActive={isSweeping}
        onComplete={() => setIsSweeping(false)}
        colorMode="mint"
        durationMs={800}
      />

      {/* Top Header & Telemetry Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs font-mono">
            <span className="text-text-muted">Learn / Recursion /</span>
            <span className="text-text-primary font-semibold">Practice & Challenges</span>
            <span className="px-2 py-0.5 rounded bg-accent-mint/15 border border-accent-mint/30 text-accent-mint font-bold text-[10px] uppercase ml-2">
              LIVE LAB MODE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-black text-text-primary tracking-tight">
              Recursion Comprehension Lab
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#11151B] border border-border text-text-muted text-xs font-mono">
              CHALLENGE SET #{currentChallenge.trackIndex.toString().padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Test your mental models against execution call stacks, base-case boundary guards, and unwinding return traces.
          </p>
        </div>

        {/* Top Right Proficiency & Stats */}
        <div className="flex items-center gap-6 text-xs font-mono bg-[#0D1015] p-3 rounded-lg border border-border">
          <div>
            <div className="text-[10px] text-text-muted uppercase">PROFICIENCY</div>
            <div className="text-accent-blue font-bold">
              {completedChallengeIds.size >= 3 ? "Master of Frames (L3/5)" : "Frame Initiate (L1/5)"}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase">PROGRESS</div>
            <div className="text-text-primary font-bold">
              {completedChallengeIds.size} / {ALL_CHALLENGES.length}{" "}
              <span className="text-text-muted text-[10px]">
                ({Math.round((completedChallengeIds.size / ALL_CHALLENGES.length) * 100)}%)
              </span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase">ACCURACY</div>
            <div className="text-accent-mint font-bold">{accuracyPct}%</div>
          </div>
          <div>
            <div className="text-[10px] text-text-muted uppercase">STREAK</div>
            <div className="text-accent-amber font-bold">🔥 {streak} traces</div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout Matching Stitch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (3 cols): Curriculum Rails */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-lg border border-border bg-[#0D1015] p-3.5 shadow-lg space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-bold text-text-primary">Curriculum Rails</span>
              <span className="text-[10px] text-text-muted uppercase bg-[#11151B] px-1.5 py-0.5 rounded border border-border">
                LIFO LABS
              </span>
            </div>

            {/* List of Challenges */}
            <div className="space-y-2">
              {ALL_CHALLENGES.map((ch, idx) => {
                const isActive = ch.id === currentChallenge.id;
                const isCompleted = completedChallengeIds.has(ch.id);

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleNavChallenge(idx)}
                    className={`w-full text-left p-2 rounded transition-all flex items-center justify-between gap-2 ${
                      isActive
                        ? "bg-accent-blue/15 border border-accent-blue text-text-primary font-bold shadow-glow-blue"
                        : "bg-[#11151B] border border-border text-text-secondary hover:bg-[#191F28] hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-mint flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                      )}
                      <span className="truncate text-[11px]">{ch.title}</span>
                    </div>
                    <span className="text-[9px] uppercase px-1 rounded bg-[#1f2022] text-text-muted">
                      {ch.level}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Execution Telemetry Card */}
          <div className="rounded-lg border border-border bg-[#0D1015] p-3.5 shadow-lg font-mono text-[11px] space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <span className="text-text-muted uppercase text-[9px] font-bold">EXECUTION TELEMETRY</span>
              <span className="text-accent-mint font-bold text-[10px]">STABLE</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-text-muted text-[9px]">FRAME STACK LIMIT</div>
                <div className="text-text-primary font-bold">1,000 frames</div>
              </div>
              <div>
                <div className="text-text-muted text-[9px]">AVG SOLVE TIME</div>
                <div className="text-accent-blue font-bold">{currentChallenge.timeEstimate}</div>
              </div>
              <div>
                <div className="text-text-muted text-[9px]">MEM OVERHEAD</div>
                <div className="text-text-primary font-bold">144 B/call</div>
              </div>
              <div>
                <div className="text-text-muted text-[9px]">COMPLETED</div>
                <div className="text-accent-mint font-bold">{completedChallengeIds.size} solved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column (5.5 cols): Active Challenge Question & Options */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-[#0D1015] p-4 shadow-lg space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-text-muted uppercase font-bold">{currentChallenge.trackName}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] uppercase bg-accent-amber/20 text-accent-amber border border-accent-amber/40 font-bold">
                  LEVEL: {currentChallenge.level}
                </span>
              </div>
              <div className="flex items-center gap-1 text-text-muted text-[11px]">
                <Clock className="w-3 h-3" />
                <span>⏱ {currentChallenge.timeEstimate}</span>
              </div>
            </div>

            {/* Title & Context */}
            <div>
              <h2 className="text-lg font-bold text-text-primary font-sans">
                {currentChallenge.title}
              </h2>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {currentChallenge.description}
              </p>
            </div>

            {/* Python Code Box */}
            <div className="rounded-lg border border-border bg-[#08090B] overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#11151B] border-b border-border text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-coral" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-mint" />
                  <span className="text-text-muted ml-1">{currentChallenge.codeFilename}</span>
                </div>
                <span className="text-text-muted text-[10px]">PYTHON 3</span>
              </div>
              <div className="p-3 font-mono text-xs leading-relaxed space-y-0.5 text-text-secondary overflow-x-auto">
                <pre className="text-accent-blue">{currentChallenge.code}</pre>
              </div>
            </div>

            {/* Target Evaluation Prompt */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-mono text-text-muted">
                <Zap className="w-3.5 h-3.5 text-accent-blue" />
                <span className="font-bold">Target Evaluation</span>
              </div>
              <p className="text-xs text-text-primary font-medium">
                {currentChallenge.prompt}
              </p>
            </div>

            {/* Radio Options List (User-driven interactive choices) */}
            <div className="space-y-2">
              {currentChallenge.options.map((opt, idx) => {
                const isSelected = selectedOptionIdx === idx;
                const isCorrect = opt.isCorrect;

                let cardClass = "border-border bg-[#11151B] text-text-secondary hover:bg-[#191F28] hover:text-text-primary";
                
                if (attemptState === "correct" && isSelected) {
                  cardClass = "border-accent-mint bg-accent-mint/15 text-text-primary shadow-glow-mint";
                } else if (attemptState === "incorrect" && isSelected) {
                  cardClass = "border-accent-coral bg-accent-coral/15 text-text-primary shadow-glow-coral";
                } else if (attemptState === "revealed" && isCorrect) {
                  cardClass = "border-accent-mint bg-accent-mint/15 text-text-primary shadow-glow-mint";
                } else if (isSelected) {
                  cardClass = "border-accent-blue bg-accent-blue/15 text-text-primary shadow-glow-blue";
                }

                return (
                  <button
                    key={opt.letter}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3 rounded-lg border font-mono text-xs transition-all flex items-start justify-between gap-3 ${cardClass}`}
                  >
                    <div>
                      <div className="font-bold text-text-primary flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-[#1f2022] text-center text-[10px] text-text-muted">
                          {opt.letter}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        {opt.subtext}
                      </div>
                    </div>

                    {/* Status icon/badge */}
                    {attemptState === "correct" && isSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-mint/20 text-accent-mint border border-accent-mint/40">
                        VERIFIED ✓
                      </span>
                    )}
                    {attemptState === "incorrect" && isSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-coral/20 text-accent-coral border border-accent-coral/40">
                        INCORRECT ✗
                      </span>
                    )}
                    {attemptState === "revealed" && isCorrect && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-mint/20 text-accent-mint border border-accent-mint/40">
                        CORRECT ANSWER
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Bar: Submit / Hint / Reset / Show Solution */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={handleTestHypothesis}
                disabled={selectedOptionIdx === null || attemptState === "correct"}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-accent-blue hover:bg-accent-blue/90 text-canvas font-mono text-xs font-bold shadow-glow-blue disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Hypothesis</span>
              </button>

              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-[#11151B] hover:bg-[#191F28] border border-border text-text-secondary hover:text-text-primary font-mono text-xs transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-accent-amber" />
                <span>{showHint ? "Hide Hint" : "Hint"}</span>
              </button>

              {attemptState === "incorrect" && (
                <button
                  onClick={handleResetChallenge}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-[#11151B] hover:bg-[#191F28] border border-border text-text-secondary hover:text-text-primary font-mono text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-accent-blue" />
                  <span>Retry</span>
                </button>
              )}

              {attemptState !== "correct" && attemptState !== "revealed" && (
                <button
                  onClick={handleRevealSolution}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-[#11151B] hover:bg-[#191F28] border border-border text-text-muted hover:text-text-primary font-mono text-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Solution</span>
                </button>
              )}
            </div>

            {/* Hint Drawer */}
            {showHint && (
              <div className="p-3 rounded-lg bg-accent-amber/10 border border-accent-amber/30 text-xs font-mono text-text-secondary space-y-1 animate-fade-in">
                <div className="flex items-center gap-1 text-accent-amber font-bold text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Progressive Hint</span>
                </div>
                <p>{currentChallenge.hint}</p>
              </div>
            )}

            {/* Trace Explanation Unfolded Card (Revealed only after user action) */}
            {(attemptState === "correct" || attemptState === "incorrect" || attemptState === "revealed") && (
              <div className="p-3.5 rounded-lg bg-[#08090B] border border-border space-y-2 font-mono text-xs animate-fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-border text-[11px]">
                  <span className={`font-bold flex items-center gap-1 ${
                    attemptState === "correct" ? "text-accent-mint" : attemptState === "revealed" ? "text-accent-blue" : "text-accent-coral"
                  }`}>
                    {attemptState === "correct" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    {attemptState === "correct" ? "Hypothesis Confirmed!" : attemptState === "revealed" ? "Solution Breakdown" : "Hypothesis Refuted"}
                  </span>
                  <span className="text-text-muted text-[10px]">LIFO UNWIND RULES</span>
                </div>

                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  {currentChallenge.explanationSteps.map((step, sIdx) => (
                    <div key={sIdx}>
                      <strong className="text-text-primary">{step.stepTitle}:</strong>{" "}
                      <span className="text-text-secondary">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (3.5 cols): Live Stack Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-lg border border-border bg-[#0D1015] p-3.5 shadow-lg space-y-3 font-mono text-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent-blue" />
                <span className="font-bold text-text-primary">Live Stack Inspector</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-accent-blue/15 text-accent-blue border border-accent-blue/40 text-[9px] font-bold">
                  LIFO TOP
                </span>
                <span className="text-[10px] text-text-muted">
                  DEPTH: {currentChallenge.stackFrames.length}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-text-muted">
              Simulate call stack frames in physical memory. Top frame resolves first as returns cascade downward.
            </p>

            {/* Stack Frame Boxes */}
            <div className="space-y-2">
              {currentChallenge.stackFrames.map((frame, fIdx) => {
                const isTop = fIdx === currentChallenge.stackFrames.length - 1;
                const isBase = frame.type === "BASE";

                return (
                  <div
                    key={`${currentChallenge.id}-frame-${frame.label}-${fIdx}`}
                    className={`p-2.5 rounded border transition-all ${
                      isBase
                        ? "border-accent-mint bg-[#11151B] shadow-glow-mint"
                        : isTop
                        ? "border-accent-blue bg-[#11151B] ring-1 ring-accent-blue/30"
                        : "border-border bg-[#11151B]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isBase ? "text-accent-mint" : isTop ? "text-accent-blue" : "text-text-primary"}`}>
                          {frame.label}
                        </span>
                        {isTop && (
                          <span className="px-1 py-0.2 rounded text-[8px] bg-accent-blue/20 text-accent-blue font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className={`text-[9px] uppercase font-bold ${isBase ? "text-accent-mint" : "text-text-muted"}`}>
                        {frame.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5 flex items-center justify-between">
                      <span>{frame.waitingText}</span>
                      {frame.returnsText && (
                        <span className="text-accent-mint font-bold ml-1">
                          → {frame.returnsText}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-accent-mint pt-1">
              <span>● Valid LIFO Stack — Base Case Verified</span>
              <span>DEPTH: {currentChallenge.stackFrames.length}</span>
            </div>

            {/* ASCII Sweep Unwind Trace Box */}
            <div className="p-3 rounded bg-[#08090B] border border-border text-[11px] space-y-1 text-accent-blue font-mono overflow-x-auto">
              <div className="text-[10px] text-text-muted mb-1">ASCII SWEEP UNWIND TRACE</div>
              <pre className="text-accent-blue/90 leading-relaxed font-mono whitespace-pre">
                {currentChallenge.asciiUnwindTrace}
              </pre>
            </div>

            {/* Guard against RecursionError Callout */}
            {currentChallenge.guardErrorText && (
              <div className="p-3 rounded bg-accent-coral/10 border border-accent-coral/30 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-accent-coral font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Guard Against RecursionError</span>
                </div>
                <p className="text-text-muted leading-relaxed text-[10px]">
                  {currentChallenge.guardErrorText}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="p-3 bg-[#0D1015] rounded-lg border border-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavChallenge(currentChallengeIndex - 1)}
            disabled={currentChallengeIndex === 0}
            className="flex items-center gap-1 text-text-muted hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev Challenge</span>
          </button>
          <span className="text-text-primary font-bold">
            Challenge {currentChallengeIndex + 1} of {ALL_CHALLENGES.length}
          </span>
          <button
            onClick={() => handleNavChallenge(currentChallengeIndex + 1)}
            disabled={currentChallengeIndex === ALL_CHALLENGES.length - 1}
            className="flex items-center gap-1 text-text-muted hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            <span>Next Challenge</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-text-muted">
          <span>Quick Run: <strong className="text-text-primary">Ctrl + Enter</strong></span>
          <button
            onClick={() => handleNavChallenge((currentChallengeIndex + 1) % ALL_CHALLENGES.length)}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-accent-mint text-canvas font-bold shadow-glow-mint hover:bg-accent-mint/90 transition-all"
          >
            <span>Submit & Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

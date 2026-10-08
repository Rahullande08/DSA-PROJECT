"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  X, 
  Sparkles, 
  RotateCcw, 
  Bot, 
  User, 
  AlertCircle,
  RefreshCw,
  Zap,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { answerLearnerQuestion, RuntimeContext } from "../../lib/qaKnowledge";

interface Message {
  id: string;
  sender: "user" | "assistant";
  title?: string;
  text: string;
  codeExample?: string;
  relatedTopic?: string;
  timestamp: string;
  source?: "gemini" | "local_tutor";
  isLiveAI?: boolean;
  isError?: boolean;
}

interface QAAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentAlgo?: string;
  currentStepIndex?: number;
  runtimeContext?: RuntimeContext;
}

const SUGGESTIONS = [
  "What is recursion?",
  "Explain factorial recursion.",
  "Why does Fibonacci have two branches?",
  "Why does fib(4) equal 3?",
  "What is the current call stack?",
  "Explain this current execution step.",
  "What happens during unwinding?",
  "Why is this node waiting?",
  "Why does factorial(1) return 1?",
  "How does Memoization make recursion O(n)?",
];

export const QAAssistant: React.FC<QAAssistantProps> = ({
  isOpen,
  onClose,
  currentAlgo = "factorial",
  currentStepIndex = 0,
  runtimeContext,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      title: "Recursion Studio AI Tutor",
      text: "Hello! I am your interactive recursion tutor. Ask me any question about the current execution state, call stacks (LIFO), base cases, recurrence trees, or algorithmic complexity.",
      timestamp: "Just now",
      source: "local_tutor",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");
    setIsLoading(true);
    setLastFailedPrompt(null);

    // Format chat history for context
    const historyForApi = messages
      .filter((m) => m.id !== "welcome" && !m.isError)
      .map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("model" as const),
        content: m.text,
      }));

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          messages: historyForApi,
          context: runtimeContext || {
            algorithm: currentAlgo,
            stepIndex: currentStepIndex,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        sender: "assistant",
        title: data.title || "Tutor Response",
        text: data.answer || "Here is the explanation based on the recursion execution model.",
        codeExample: data.codeExample,
        relatedTopic: data.relatedTopic,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: data.source,
        isLiveAI: data.isLiveAI,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      // Fallback locally
      try {
        const fallback = answerLearnerQuestion(
          q,
          currentAlgo,
          currentStepIndex,
          runtimeContext
        );
        const fallbackMsg: Message = {
          id: `a_${Date.now()}`,
          sender: "assistant",
          title: fallback.title,
          text: fallback.answer,
          codeExample: fallback.codeExample,
          relatedTopic: fallback.relatedTopic,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "local_tutor",
          isLiveAI: false,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } catch (fallbackErr) {
        setLastFailedPrompt(q);
        const errorMsg: Message = {
          id: `err_${Date.now()}`,
          sender: "assistant",
          title: "Connection Notice",
          text: "Unable to process the question right now. Please check your network connection or click Retry.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedPrompt) {
      handleSend(lastFailedPrompt);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        title: "Recursion Studio AI Tutor",
        text: "Conversation cleared. Ask any new question about execution steps, call stacks, base cases, or trees!",
        timestamp: "Just now",
        source: "local_tutor",
      },
    ]);
    setLastFailedPrompt(null);
  };

  if (!isOpen) return null;

  const currentAlgorithmName = runtimeContext?.algorithm || currentAlgo;
  const currentStepNum = (runtimeContext?.stepIndex !== undefined ? runtimeContext.stepIndex : currentStepIndex) + 1;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#0D1015] border-l border-border z-50 flex flex-col shadow-2xl animate-fade-in font-mono">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#11151B] border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center text-accent-blue shadow-glow-blue">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-text-primary flex items-center gap-2">
              <span>Recursion AI Tutor</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-accent-mint/15 text-accent-mint border border-accent-mint/30">
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-text-muted flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse" />
              <span>Context Aware: {currentAlgorithmName} (Step {currentStepNum})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            title="Clear Chat History"
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-[#1f2022] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-[#1f2022] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Questions Quick Rail */}
      <div className="px-3 py-2 bg-[#08090B] border-b border-border/60 overflow-x-auto whitespace-nowrap space-x-1.5 scrollbar-none">
        <span className="text-[10px] text-text-muted font-bold mr-1">QUICK PROMPTS:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            disabled={isLoading}
            className="inline-block px-2.5 py-1 rounded text-[10px] bg-[#11151B] hover:bg-[#1f2022] border border-border text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Messages Scrollable Area */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#08090B]/60 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === "user";

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[92%] p-3.5 rounded-xl border transition-all ${
                  isUser
                    ? "bg-accent-blue/15 border-accent-blue/40 text-text-primary shadow-glow-blue"
                    : m.isError
                    ? "bg-accent-coral/10 border-accent-coral/40 text-text-primary"
                    : "bg-[#11151B] border-border text-text-secondary shadow-lg"
                }`}
              >
                {/* Header for assistant message */}
                {!isUser && (
                  <div className="text-accent-blue font-bold text-[11px] mb-1.5 pb-1.5 border-b border-border/50 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-accent-blue" />
                      <span>{m.title || "Tutor Response"}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {m.isLiveAI ? (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-accent-purple/20 text-accent-purple border border-accent-purple/40 font-bold uppercase">
                          Gemini 2.5
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#08090B] text-accent-mint border border-border font-bold uppercase">
                          Knowledge Engine
                        </span>
                      )}
                      {m.relatedTopic && (
                        <span className="text-[9px] text-text-muted uppercase hidden sm:inline">
                          {m.relatedTopic}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Body Text */}
                <p className="leading-relaxed whitespace-pre-wrap font-sans text-xs text-text-primary">
                  {m.text}
                </p>

                {/* Optional Code Example Block */}
                {m.codeExample && (
                  <div className="mt-2.5 p-2.5 rounded bg-[#08090B] border border-border font-mono text-[11px] text-accent-mint overflow-x-auto shadow-inner">
                    <pre className="whitespace-pre">{m.codeExample}</pre>
                  </div>
                )}

                {/* Retry action if message is error */}
                {m.isError && lastFailedPrompt && (
                  <div className="mt-2 pt-2 border-t border-accent-coral/30 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">Prompt: "{lastFailedPrompt}"</span>
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-accent-coral text-canvas text-[10px] font-bold hover:bg-accent-coral/90 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Timestamp footer */}
              <span className="text-[9px] text-text-muted mt-1 px-1">{m.timestamp}</span>
            </div>
          );
        })}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 text-text-muted text-xs p-3 bg-[#11151B] rounded-lg border border-border/80 w-fit animate-pulse">
            <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
            <span className="font-mono text-text-secondary">Consulting AI recursion tutor...</span>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-[#11151B] border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask why a step happens, what LIFO means, or trace Fibonacci..."
            className="flex-1 bg-[#08090B] border border-border focus:border-accent-blue rounded-lg px-3.5 py-2.5 text-xs text-text-primary outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-lg bg-accent-blue hover:bg-accent-blue/90 text-canvas disabled:opacity-40 disabled:pointer-events-none transition-all shadow-glow-blue"
            title="Send question (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-text-muted mt-2 px-1">
          <span>
            Context: <strong className="text-text-secondary">{currentAlgorithmName}</strong> (Step {currentStepNum})
          </span>
          <span>Press Enter ↵</span>
        </div>
      </div>
    </div>
  );
};

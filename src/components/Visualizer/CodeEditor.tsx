"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { AlgorithmDefinition, ExecutionStep } from "../../types/recursion";

interface CodeEditorProps {
  algorithm: AlgorithmDefinition;
  currentStep: ExecutionStep;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  algorithm,
  currentStep,
}) => {
  const [lang, setLang] = useState<"python" | "javascript" | "cpp">("python");
  const [copied, setCopied] = useState(false);

  const code = algorithm.codeSnippets[lang];
  const lines = code.split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLangFilename = () => {
    switch (lang) {
      case "python":
        return `recursion/${algorithm.id}.py`;
      case "javascript":
        return `recursion/${algorithm.id}.js`;
      case "cpp":
        return `recursion/${algorithm.id}.cpp`;
    }
  };

  const getLangTag = () => {
    switch (lang) {
      case "python":
        return "Python 3.12 (Simulated)";
      case "javascript":
        return "Node.js v20 (Simulated)";
      case "cpp":
        return "C++20 (Simulated)";
    }
  };

  return (
    <div className="rounded-lg border border-border bg-panel overflow-hidden flex flex-col h-full shadow-lg">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-container border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-accent-blue" />
          <span className="font-mono text-xs font-medium text-text-primary tracking-tight">
            {getLangFilename()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-panel border border-border rounded p-0.5">
            {(["python", "javascript", "cpp"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  lang === l
                    ? "bg-border text-text-primary font-medium"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {l === "cpp" ? "C++" : l === "javascript" ? "JS" : "Py"}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-text-muted hidden sm:inline">
            {getLangTag()}
          </span>

          <button
            onClick={handleCopy}
            title="Copy Code"
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-panel transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-accent-mint" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Code Display Area with Active Line Indicator */}
      <div className="p-3 font-mono text-xs overflow-x-auto flex-1 bg-canvas/60">
        {lines.map((lineText, idx) => {
          const lineNum = idx + 1;
          const isActive = currentStep.activeLine === lineNum;

          return (
            <div
              key={lineNum}
              className={`flex items-center gap-3 px-2 py-1 rounded transition-colors ${
                isActive
                  ? "bg-accent-blue/15 border-l-2 border-accent-blue shadow-inner"
                  : "hover:bg-container/40"
              }`}
            >
              {/* Pointer & Line Number */}
              <div className="flex items-center gap-1 w-8 flex-shrink-0 select-none text-right">
                {isActive ? (
                  <span className="text-accent-blue font-bold text-[10px] animate-pulse">▶</span>
                ) : (
                  <span className="w-2" />
                )}
                <span
                  className={`text-[11px] ${
                    isActive ? "text-accent-blue font-semibold" : "text-text-muted"
                  }`}
                >
                  {lineNum}
                </span>
              </div>

              {/* Code Line Content */}
              <pre
                className={`flex-1 m-0 overflow-visible ${
                  isActive
                    ? "text-text-primary font-medium"
                    : "text-text-secondary"
                }`}
              >
                {lineText}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};

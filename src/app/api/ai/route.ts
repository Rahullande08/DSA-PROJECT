import { NextRequest, NextResponse } from "next/server";
import { answerLearnerQuestion, RuntimeContext } from "../../../lib/qaKnowledge";

interface ChatMessage {
  role: "user" | "model" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, messages = [], context }: { question: string; messages?: ChatMessage[]; context?: RuntimeContext } = body;

    const trimmedQ = (question || "").trim();
    if (!trimmedQ) {
      return NextResponse.json(
        { error: "Question text is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.AI_API_KEY;

    if (apiKey) {
      try {
        // Construct structured system context
        const algo = context?.algorithm || "Factorial";
        const n = context?.n !== undefined ? context.n : 4;
        const stepNum = context?.stepIndex !== undefined ? context.stepIndex + 1 : 1;
        const activeLine = context?.activeLine || 1;
        const stackFramesStr = context?.callStackFrames && context.callStackFrames.length > 0
          ? context.callStackFrames.map((f, i) => `Frame #${i+1}: ${f.callLabel} [${f.state}]${f.pendingOp ? ` (pending: ${f.pendingOp})` : ""}${f.returnValue !== undefined ? ` (returns: ${f.returnValue})` : ""}`).join("\n")
          : "Stack is currently empty (0 frames)";
        const stepDesc = context?.stepDescription || "Executing algorithm step";

        const systemInstruction = `You are the expert AI Tutor inside Recursion Studio, an interactive visual learning platform for Python recursion.
Your job is to explain recursion, call stack mechanics (LIFO), base cases, recursive branching, and stack unwinding with extreme clarity, precision, and pedagogical excellence.

CURRENT RUNTIME APPLICATION CONTEXT:
- Algorithm: ${algo} (input n = ${n})
- Current Execution Step: Step ${stepNum} (out of ${context?.totalSteps || 10})
- Active Source Line: Line ${activeLine}
- Active Stack State:
${stackFramesStr}
- Current Engine Telemetry: "${stepDesc}"
${context?.conditionCheck ? `- Condition Check: ${context.conditionCheck}` : ""}
${context?.resultTarget !== undefined ? `- Target Result: ${context.resultTarget}` : ""}

GUIDELINES:
1. Always ground your explanation in Python recursion, mentioning the current state if relevant to the question.
2. If asked about the current call stack or current step, refer directly to the runtime context above.
3. Keep answers clear, educational, friendly, and formatted with clean markdown code snippets where helpful.
4. Correct any misconceptions about recursion without inventing execution states.`;

        // Format contents for Gemini API
        const contents: any[] = [];

        if (messages && messages.length > 0) {
          for (const m of messages.slice(-6)) { // keep last 6 turns for context
            contents.push({
              role: m.role === "user" ? "user" : "model",
              parts: [{ text: m.content }],
            });
          }
        }

        // Add current question
        contents.push({
          role: "user",
          parts: [{ text: trimmedQ }],
        });

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
              contents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (candidateText) {
            return NextResponse.json({
              title: "Gemini AI Tutor Response",
              answer: candidateText,
              relatedTopic: `${algo} Recursion Analysis`,
              source: "gemini",
              isLiveAI: true,
            });
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to grounded knowledge engine:", geminiErr);
      }
    }

    // Grounded deterministic fallback knowledge engine
    const localResponse = answerLearnerQuestion(
      trimmedQ,
      context?.algorithm || "factorial",
      context?.stepIndex || 0,
      context
    );

    return NextResponse.json({
      title: localResponse.title,
      answer: localResponse.answer,
      codeExample: localResponse.codeExample,
      relatedTopic: localResponse.relatedTopic,
      source: "local_tutor",
      isLiveAI: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

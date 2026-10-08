"use client";
import { useEffect, useRef } from "react";
export function useWebMcp(draw: () => unknown) {
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    type Ctx = {
      registerTool: (
        tool: unknown,
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };
    const ctx = (document as Document & { modelContext?: Ctx }).modelContext;
    if (!ctx?.registerTool) return;
    const life = new AbortController();
    try {
      void Promise.resolve(
        ctx.registerTool(
          {
            name: "draw_gesture_prompt",
            title: "ジェスチャーのお題を表示",
            description:
              "現在の難易度から次のお題を表示します。制限時間が有効な場合はタイマーも開始します。",
            inputSchema: {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: true },
            execute: async (input: unknown) => {
              if (
                !input ||
                typeof input !== "object" ||
                Array.isArray(input) ||
                Object.keys(input).length
              )
                throw new Error("引数は空のオブジェクトにしてください。");
              const result = drawRef.current();
              await new Promise((resolve) =>
                requestAnimationFrame(() => resolve(null)),
              );
              return result;
            },
          },
          { signal: life.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => life.abort();
  }, []);
}

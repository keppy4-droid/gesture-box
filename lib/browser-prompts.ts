import type { Prompt } from "./prompts.ts";
import { validatePrompt } from "./game.ts";

export const PROMPT_STORAGE_KEY = "gesture-box:custom-prompts:v1";
type StorageAccess = Pick<Storage, "getItem" | "setItem">;

export function readBrowserPrompts(storage: StorageAccess): Prompt[] {
  const raw = storage.getItem(PROMPT_STORAGE_KEY);
  if (raw === null) return [];
  const values: unknown = JSON.parse(raw);
  if (!Array.isArray(values))
    throw new Error("保存されているお題を読み込めませんでした。");
  const unique = new Map<string, Prompt>();
  for (const value of values) {
    const { text, level } = validatePrompt(value);
    const id = `custom:${level}:${text}`;
    unique.set(id, { id, text, level, category: "オリジナル" });
  }
  return [...unique.values()];
}

export function saveBrowserPrompt(
  storage: StorageAccess,
  value: unknown,
): Prompt[] {
  const { text, level } = validatePrompt(value);
  // Read before writing so another tab's additions are preserved.
  const prompts = readBrowserPrompts(storage);
  if (prompts.some((p) => p.text === text && p.level === level))
    throw new Error("そのお題は、この難易度に追加済みです。");
  const updated: Prompt[] = [
    ...prompts,
    { id: `custom:${level}:${text}`, text, level, category: "オリジナル" },
  ];
  storage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

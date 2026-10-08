"use client";
import { useCallback, useEffect, useState } from "react";
import type { Prompt } from "@/lib/prompts";
import { validatePrompt } from "@/lib/game";
import { builtins } from "@/lib/prompts";
import {
  PROMPT_STORAGE_KEY,
  readBrowserPrompts,
  saveBrowserPrompt,
} from "@/lib/browser-prompts";
type Level = "normal" | "hard";
export function usePromptStorage() {
  const [custom, setCustom] = useState<Prompt[]>([]),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState(""),
    [addLevel, setAddLevel] = useState<Level>("normal"),
    [saving, setSaving] = useState(false),
    [feedback, setFeedback] = useState(""),
    [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError("");
    try {
      setCustom(readBrowserPrompts(window.localStorage));
    } catch (e) {
      setLoadError(
        "このブラウザーに保存したお題を読み込めませんでした。ブラウザーの保存設定を確認してください。",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    const onStorage = (event: StorageEvent) => {
      if (event.key === PROMPT_STORAGE_KEY || event.key === null) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [load]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("");
    setSaved(false);
    let value: ReturnType<typeof validatePrompt>;
    try {
      value = validatePrompt({ text: draft, level: addLevel });
      if (
        builtins.some((p) => p.text === value.text && p.level === value.level)
      )
        throw new Error("そのお題は、最初から入っているお題に含まれています。");
    } catch (err) {
      setFeedback((err as Error).message);
      return;
    }
    setSaving(true);
    try {
      setCustom(saveBrowserPrompt(window.localStorage, value));
      setLoadError("");
      setDraft("");
      setSaved(true);
      setFeedback(
        `「${value.text}」をこのブラウザーに保存しました。次のお題から登場します。`,
      );
    } catch (err) {
      setFeedback(
        err instanceof Error
          ? err.message
          : "保存できませんでした。ブラウザーの保存設定を確認してください。",
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    custom,
    loading,
    loadError,
    load,
    draft,
    setDraft,
    addLevel,
    setAddLevel,
    saving,
    feedback,
    setFeedback,
    saved,
    add,
  };
}

export function drawUnseen<T extends { id: string }>(
  pool: T[],
  seen: Set<string>,
  previous?: string,
): T {
  if (!pool.length) throw new Error("お題がありません");
  let choices = pool.filter((p) => !seen.has(p.id));
  if (!choices.length) {
    seen.clear();
    choices = pool.length > 1 ? pool.filter((p) => p.id !== previous) : pool;
  }
  const selected = choices[Math.floor(Math.random() * choices.length)];
  seen.add(selected.id);
  return selected;
}
export function remainingSeconds(deadline: number, now = Date.now()) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
export function validatePrompt(value: unknown) {
  if (!value || typeof value !== "object")
    throw new Error("お題を入力してください。");
  const p = value as Record<string, unknown>;
  if (p.level !== "normal" && p.level !== "hard")
    throw new Error("難易度を選んでください。");
  if (typeof p.text !== "string") throw new Error("お題を入力してください。");
  const text = p.text.trim().normalize("NFC");
  if (!text || text.length > 60)
    throw new Error("お題は1〜60文字で入力してください。");
  if (/[\r\n\u0000-\u001f]/.test(text))
    throw new Error("お題は1行で入力してください。");
  return { text, level: p.level as "normal" | "hard" };
}

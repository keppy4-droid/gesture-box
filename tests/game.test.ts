import test from "node:test";
import assert from "node:assert/strict";
import { drawUnseen, remainingSeconds, validatePrompt } from "../lib/game.ts";
import { builtins } from "../lib/prompts.ts";
import { getHint } from "../lib/hints.ts";
test("editable prompts have unique IDs, valid text and both difficulties", () => {
  assert.ok(builtins.length > 0);
  assert.equal(new Set(builtins.map((p) => p.id)).size, builtins.length);
  assert.equal(
    new Set(builtins.map((p) => `${p.level}:${p.text}`)).size,
    builtins.length,
  );
  assert.ok(builtins.some((p) => p.level === "normal"));
  assert.ok(builtins.some((p) => p.level === "hard"));
  for (const p of builtins) {
    assert.deepEqual(validatePrompt(p), { text: p.text, level: p.level });
    assert.ok(getHint(p).trim());
  }
});
test("adding, reordering and deleting prompts keeps hints attached to their text", async () => {
  const original = [...builtins];
  const expected = new Map(
    original.map((prompt) => [
      `${prompt.category}:${prompt.text}`,
      getHint(prompt),
    ]),
  );
  const added = {
    id: original[0].id,
    text: "ハムスター",
    level: "normal" as const,
    category: "動物",
  };
  const edits = [
    [added, ...original],
    [...original].reverse(),
    original.slice(1),
  ];
  try {
    for (const [index, edited] of edits.entries()) {
      builtins.splice(
        0,
        builtins.length,
        ...edited.map((prompt, i) => ({ ...prompt, id: `n-0-${i}` })),
      );
      // Reload against the edited list to detect initialization-time coupling.
      const moduleUrl = new URL("../lib/hints.ts", import.meta.url);
      moduleUrl.searchParams.set("edited-prompts", String(index));
      const { getHint: editedHint } = (await import(
        moduleUrl.href
      )) as typeof import("../lib/hints.ts");
      for (const prompt of builtins) {
        const hint = editedHint(prompt);
        const originalHint = expected.get(`${prompt.category}:${prompt.text}`);
        if (originalHint) assert.equal(hint, originalHint);
        else {
          assert.equal(typeof hint, "string");
          assert.ok(hint.trim());
          assert.notEqual(hint, expected.get("動物:犬"));
        }
      }
    }
  } finally {
    builtins.splice(0, builtins.length, ...original);
  }
});
test("draw completes a cycle without repeats and avoids the previous item", () => {
  const seen = new Set<string>();
  const pool = builtins.filter((p) => p.level === "normal");
  let previous: string | undefined;
  for (let i = 0; i < pool.length; i++) {
    const p = drawUnseen(pool, seen, previous);
    assert.notEqual(p.id, previous);
    previous = p.id;
  }
  assert.equal(seen.size, pool.length);
  const next = drawUnseen(pool, seen, previous);
  assert.notEqual(next.id, previous);
  assert.equal(seen.size, 1);
});
test("timer uses the deadline even after a delayed update", () => {
  assert.equal(remainingSeconds(10000, 4001), 6);
  assert.equal(remainingSeconds(10000, 10000), 0);
  assert.equal(remainingSeconds(10000, 12000), 0);
});
test("prompt validation normalizes text and rejects malformed input", () => {
  assert.deepEqual(validatePrompt({ text: "  カフェ  ", level: "normal" }), {
    text: "カフェ",
    level: "normal",
  });
  for (const v of [
    null,
    { text: "", level: "normal" },
    { text: "a".repeat(61), level: "hard" },
    { text: "a\nb", level: "normal" },
    { text: "a", level: "invalid" },
  ])
    assert.throws(() => validatePrompt(v));
});

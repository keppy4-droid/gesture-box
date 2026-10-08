import test from "node:test";
import assert from "node:assert/strict";
import {
  PROMPT_STORAGE_KEY,
  readBrowserPrompts,
  saveBrowserPrompt,
} from "../lib/browser-prompts.ts";
function memoryStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(PROMPT_STORAGE_KEY, initial);
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}
test("browser prompts persist and reject duplicates after normalization", () => {
  const storage = memoryStorage();
  assert.deepEqual(readBrowserPrompts(storage), []);
  const saved = saveBrowserPrompt(storage, {
    text: "  ハムスター  ",
    level: "normal",
  });
  assert.deepEqual(readBrowserPrompts(storage), saved);
  assert.equal(saved[0].text, "ハムスター");
  assert.throws(
    () => saveBrowserPrompt(storage, { text: "ハムスター", level: "normal" }),
    /追加済み/,
  );
  assert.equal(readBrowserPrompts(storage).length, 1);
  assert.equal(
    saveBrowserPrompt(storage, { text: "ハムスター", level: "hard" }).length,
    2,
  );
});
test("additions preserve existing saved prompts from another tab", () => {
  const storage = memoryStorage();
  saveBrowserPrompt(storage, { text: "ジャグリング", level: "normal" });
  saveBrowserPrompt(storage, { text: "うさぎ跳び", level: "normal" });
  assert.deepEqual(
    readBrowserPrompts(storage).map((p) => p.text),
    ["ジャグリング", "うさぎ跳び"],
  );
});
test("corrupt data is not overwritten and write failures are reported", () => {
  for (const bad of ["not json", "{}", '[{"text":"","level":"normal"}]']) {
    const storage = memoryStorage(bad);
    assert.throws(() =>
      saveBrowserPrompt(storage, { text: "ハムスター", level: "normal" }),
    );
    assert.equal(storage.getItem(PROMPT_STORAGE_KEY), bad);
  }
  assert.throws(
    () =>
      saveBrowserPrompt(
        {
          getItem: () => null,
          setItem: () => {
            throw new Error("storage blocked");
          },
        },
        { text: "ハムスター", level: "normal" },
      ),
    /storage blocked/,
  );
});

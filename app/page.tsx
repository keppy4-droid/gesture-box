"use client";
import { useMemo, useRef, useState } from "react";
import {
  Hand,
  Shuffle,
  Plus,
  ArrowUpRight,
  Timer,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Lightbulb,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { builtins, type Prompt } from "@/lib/prompts";
import { drawUnseen } from "@/lib/game";
import { usePromptStorage } from "@/hooks/use-prompt-storage";
import { useRoundTimer } from "@/hooks/use-round-timer";
import { useWebMcp } from "@/hooks/use-webmcp";
import { getHint } from "@/lib/hints";
type Level = "normal" | "hard";
export default function Home() {
  const [level, setLevel] = useState<Level>("normal"),
    [timed, setTimed] = useState(false),
    [seconds, setSeconds] = useState("60"),
    [current, setCurrent] = useState<Prompt | null>(null),
    [hidden, setHidden] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const { remaining, setRemaining, setDeadline } = useRoundTimer();
  const [roundSeconds, setRoundSeconds] = useState(60),
    [count, setCount] = useState(0);
  const {
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
  } = usePromptStorage();
  const [gameError, setGameError] = useState("");
  const pool = useMemo(
    () => [...builtins, ...custom].filter((p) => p.level === level),
    [custom, level],
  );
  const seen = useRef({ normal: new Set<string>(), hard: new Set<string>() }),
    last = useRef<Prompt | null>(null);
  function resetRound() {
    setDeadline(null);
    setRemaining(null);
    setCurrent(null);
    setHidden(false);
    setHintVisible(false);
    last.current = null;
    setGameError("");
  }
  function draw() {
    const sec = Number(seconds);
    if (timed && (!Number.isInteger(sec) || sec < 5 || sec > 600)) {
      setGameError("制限時間は5〜600秒の整数で指定してください。");
      return { error: "invalid_duration" };
    }
    const next = drawUnseen(pool, seen.current[level], last.current?.id);
    last.current = next;
    setCurrent(next);
    setHidden(false);
    setHintVisible(false);
    setCount((c) => c + 1);
    setGameError("");
    setRoundSeconds(sec);
    setRemaining(timed ? sec : null);
    setDeadline(timed ? Date.now() + sec * 1000 : null);
    return {
      prompt: next.text,
      level: next.level,
      seconds: timed ? sec : null,
    };
  }

  useWebMcp(draw);
  const total = pool.length,
    expired = remaining === 0;
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href={import.meta.env.BASE_URL}>
          <span className="brand-icon">
            <Hand size={25} />
          </span>
          ジェスチャーBOX<span className="brand-dot">●</span>
        </a>
        <span className="top-note">声を出さずに、伝えてみよう。</span>
      </header>
      <section className="intro">
        <div>
          <p className="eyebrow">LET’S PLAY TOGETHER</p>
          <h1>
            からだひとつで、
            <br className="mobile-break" />
            盛り上がろう。
          </h1>
        </div>
        <a className="add-link" href="#add">
          お題を追加 <Plus size={19} />
        </a>
      </section>
      <div className="play-layout">
        <section className="play-area">
          <div className="card-top">
            <span>
              <i />
              {level === "normal" ? "普通" : "難しい"} · {total}のお題
            </span>
            <span>{String(count || 1).padStart(2, "0")} — GESTURE</span>
          </div>
          <div
            className={`prompt-card ${level === "hard" ? "hard-card" : ""} ${expired ? "expired-card" : ""}`}
          >
            <span className="card-spark" aria-hidden="true">
              {level === "normal" ? "✳" : "✷"}
            </span>
            <p className="card-kicker">
              {expired
                ? "TIME UP !"
                : current
                  ? current.category
                  : "準備はいい？"}
            </p>
            <div className="prompt-text" aria-live="polite" aria-atomic="true">
              {hidden ? (
                "お題はひみつ。"
              ) : current ? (
                current.text
              ) : (
                <>
                  次のお題は、
                  <br />
                  なんだろう。
                </>
              )}
            </div>
            <p className="card-hint">
              {expired
                ? "時間です！ 答え合わせをしよう。"
                : hidden
                  ? "演じる人は、お題を思い出してね。"
                  : "演じる人だけ、画面を見てね。"}
            </p>
            <div className="card-bottom">
              <span>
                {current
                  ? "声を出さずに、表現しよう"
                  : "身ぶりだけでチャレンジ"}
              </span>
              {current ? (
                <button
                  type="button"
                  className="hide-button"
                  onClick={() => setHidden((v) => !v)}
                >
                  {hidden ? <Eye size={18} /> : <EyeOff size={18} />}お題を
                  {hidden ? "見る" : "隠す"}
                </button>
              ) : (
                <Hand size={28} />
              )}
            </div>
          </div>
          {current && (
            <div className="hint-area">
              <button
                type="button"
                className="hint-button"
                aria-expanded={hintVisible}
                aria-controls="prompt-hint"
                onClick={() => setHintVisible((v) => !v)}
              >
                <Lightbulb size={18} />
                {hintVisible ? "ヒントを閉じる" : "ヒントを見る"}
              </button>
              <div
                id="prompt-hint"
                hidden={!hintVisible}
                className="hint-panel"
                role="status"
              >
                {hintVisible && (
                  <>
                    <strong>演じ方のヒント</strong>
                    <p>{getHint(current)}</p>
                  </>
                )}
              </div>
            </div>
          )}
          {remaining !== null && (
            <div className={`timer-strip ${expired ? "time-up" : ""}`}>
              <div className="row">
                <span>{expired ? "時間切れ" : "残り時間"}</span>
                <strong role="timer" aria-label={`残り${remaining}秒`}>
                  {Math.floor(remaining / 60)}:
                  {String(remaining % 60).padStart(2, "0")}
                </strong>
              </div>
              <Progress
                value={(remaining / roundSeconds) * 100}
                aria-label="残り時間の割合"
              />
              <span role="status" className="sr-only">
                {expired ? "時間切れです。" : ""}
              </span>
            </div>
          )}
          <button className="draw-button" onClick={draw}>
            <Shuffle size={22} />
            {current ? "次のお題を表示" : "お題を表示"}
            <ArrowUpRight size={23} />
          </button>
          <p className="under-card">一巡するまで、同じお題は出ません。</p>
          {gameError && (
            <p className="error-message" role="alert">
              {gameError}
            </p>
          )}
        </section>
        <aside className="settings">
          <p className="eyebrow">PLAY SETTINGS</p>
          <h2>遊び方を決めよう</h2>
          <div className="setting-section">
            <h3 id="difficulty-label">難易度</h3>
            <RadioGroup
              aria-labelledby="difficulty-label"
              value={level}
              onValueChange={(v) => {
                setLevel(v as Level);
                resetRound();
              }}
              className="difficulty-group"
            >
              <label
                className={level === "normal" ? "choice active" : "choice"}
              >
                <RadioGroupItem value="normal" />
                <span>
                  <strong>普通</strong>
                  <small>動物・日常・スポーツなど</small>
                </span>
                <span className="choice-symbol">✳</span>
              </label>
              <label className={level === "hard" ? "choice active" : "choice"}>
                <RadioGroupItem value="hard" />
                <span>
                  <strong>難しい</strong>
                  <small>動作の組み合わせ・観光地</small>
                </span>
                <span className="choice-symbol">✷</span>
              </label>
            </RadioGroup>
          </div>
          <div className="setting-section">
            <div className="row">
              <h3 id="timer-label">
                <Timer size={19} />
                制限時間
              </h3>
              <Switch
                checked={timed}
                onCheckedChange={(v) => {
                  setTimed(v);
                  setDeadline(null);
                  setRemaining(null);
                }}
                aria-labelledby="timer-label"
              />
            </div>
            <p className="muted">
              {timed
                ? "お題を表示するとスタート"
                : "時間を気にせず、のんびり遊ぶ"}
            </p>
            {timed && (
              <div className="duration">
                <label htmlFor="seconds">1問あたり</label>
                <input
                  id="seconds"
                  type="number"
                  inputMode="numeric"
                  min="5"
                  max="600"
                  step="1"
                  value={seconds}
                  onChange={(e) => {
                    setSeconds(e.target.value);
                    setDeadline(null);
                    setRemaining(null);
                  }}
                />
                <span>秒</span>
                <small>5〜600秒で設定できます</small>
              </div>
            )}
          </div>
          <div className="howto">
            <span>遊び方のヒント</span>
            <p>
              ① 演じる人がお題を見る
              <br />② 声を出さず、身ぶりで伝える
              <br />③ わかった人は答えを言おう！
            </p>
          </div>
        </aside>
      </div>
      <section id="add" className="add-section">
        <div>
          <p className="eyebrow">YOUR IDEAS, MORE FUN</p>
          <h2>あなたのお題も、仲間入り。</h2>
          <p className="muted">
            思いついたお題を追加して、もっと遊ぼう。
            <br />
            追加したお題は、この端末のブラウザーに保存されます。
            <br />
            ほかの端末には共有されず、ブラウザーのデータを消すと削除されます。
          </p>
          <div className="category-note">
            普通：{builtins.filter((p) => p.level === "normal").length}個
            <br />
            <span>
              動物 / 家事・日常動作 / スポーツ / 職業 / 場所
              <br />
              難しい：{builtins.filter((p) => p.level === "hard").length}
              個（動作の組み合わせ・観光地など）
            </span>
          </div>
          <p className="saved-count">
            追加したお題：{loading ? "読み込み中…" : `${custom.length}個`}
          </p>
          {loadError && (
            <div className="error-message" role="alert">
              <p>{loadError}</p>
              <button type="button" onClick={load} className="retry">
                <RotateCcw size={15} />
                再読み込み
              </button>
              <p>最初から入っている{builtins.length}個のお題では遊べます。</p>
            </div>
          )}
        </div>
        <form onSubmit={add} className="add-form">
          <label id="add-level-label">追加先の難易度</label>
          <RadioGroup
            aria-labelledby="add-level-label"
            value={addLevel}
            onValueChange={(v) => {
              setAddLevel(v as Level);
              setFeedback("");
            }}
            className="add-level"
          >
            <label>
              <RadioGroupItem value="normal" />
              普通
            </label>
            <label>
              <RadioGroupItem value="hard" />
              難しい
            </label>
          </RadioGroup>
          <label htmlFor="new-prompt">新しいお題</label>
          <input
            id="new-prompt"
            required
            maxLength={60}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setFeedback("");
            }}
            placeholder={
              addLevel === "normal"
                ? "例：ハムスター"
                : "例：忍者が料理をしている"
            }
            aria-describedby="prompt-help"
          />
          <div className="form-meta">
            <small id="prompt-help">
              {addLevel === "normal"
                ? "動物でも、動作でも、自由にどうぞ。"
                : "動作の組み合わせや、難しい観光地など。"}
            </small>
            <small>{draft.length}/60</small>
          </div>
          <button className="save-button" type="submit" disabled={saving}>
            {saving ? (
              "保存しています…"
            ) : (
              <>
                <Plus size={18} />
                お題を追加する
              </>
            )}
          </button>
          <p
            className={saved ? "success-message" : "error-message"}
            role="status"
          >
            {saved && <Check size={16} />} {feedback}
          </p>
        </form>
      </section>
      <footer>
        ジェスチャーBOX <span>いつもの時間に、ちょっとした笑いを。</span>
      </footer>
    </main>
  );
}

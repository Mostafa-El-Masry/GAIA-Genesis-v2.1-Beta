'use client';

import { useMemo, useState, useEffect } from "react";
import Button from "@/app/DesignSystem/components/Button";
import { useCitadelProgress } from "../lib/progress";
import { concepts } from "../data/academy";
import { readBuildNote, writeBuildNote, writeResult } from "../lib/academy";
import { listCustomConcepts } from "../lib/customConcepts";

/**
 * Academy (Week 14 update):
 * - Merges built-in Tierâ€‘1 concepts with user-added custom concepts from Archives.
 */
type Step = "choose" | "learn" | "quiz" | "build" | "done";

export default function Academy() {
  const { isUnlocked, toggleNode } = useCitadelProgress();

  const [extras, setExtras] = useState<any[]>([]);
  useEffect(() => {
    function load() { setExtras(listCustomConcepts()); }
    load();
    function onAny() { load(); }
    window.addEventListener("storage", onAny);
    return () => window.removeEventListener("storage", onAny);
  }, []);

  const allConcepts = useMemo(() => [...concepts, ...extras], [extras]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sel = allConcepts.find(c => c.id === selectedId) || null;

  const [step, setStep] = useState<Step>("choose");
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (sel) setNote(readBuildNote(sel.id));
  }, [sel]);

  function startSelected(id: string) {
    setSelectedId(id);
    setStep("learn");
    setAnswers({});
    setScore(null);
  }

  function grade() {
    if (!sel) return;
    let s = 0;
    sel.quiz.forEach((q: any, i: number) => {
      if (answers[i] === q.answer) s += 1;
    });
    setScore(s);
    return s;
  }

  const passNeeded = sel ? Math.ceil(sel.quiz.length * 0.7) : 0;
  const canContinue = step === "choose"
    ? !!selectedId
    : step === "learn"
      ? true
      : step === "quiz"
        ? score !== null && sel && score >= passNeeded
        : step === "build"
          ? true
          : true;

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-medium">Academy</h2>
        <p className="mt-1 text-sm gaia-muted">
          Learn â†’ quiz â†’ build. Passing unlocks the matching node in the Tower. Items you add from Archives appear here.
        </p>
      </header>

      {step === "choose" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allConcepts.map((c) => (
            <button
              key={c.id}
              onClick={() => startSelected(c.id)}
              className="rounded-md border gaia-border p-3 text-left transition gaia-hover-soft"
            >
              <div className="text-xs gaia-muted">{c.trackTitle} Â· Tier 1</div>
              <div className="mt-1 font-medium">{c.title}</div>
              {isUnlocked(c.nodeId) && <div className="mt-2 text-xs gaia-positive">Unlocked</div>}
            </button>
          ))}
        </div>
      )}

      {sel && step !== "choose" && (
        <div className="rounded-lg border gaia-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs gaia-muted">{sel.trackTitle} Â· Tier 1</div>
              <h3 className="text-lg font-semibold">{sel.title}</h3>
            </div>
            <div className="text-xs gaia-muted">Step: {step}</div>
          </div>

          {step === "learn" && (
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-relaxed">{sel.lesson}</p>
              <div className="text-xs gaia-muted">Tip: keep it short && focused; youâ€™ll reinforce by building.</div>
              <div className="mt-4">
                <Button onClick={() => setStep("quiz")}>Start quiz</Button>
              </div>
            </div>
          )}

          {step === "quiz" && (
            <div className="mt-4 space-y-4">
              {sel.quiz.map((q: any, i: number) => (
                <div key={i} className="rounded-md border gaia-border p-3">
                  <div className="text-sm font-medium">{i + 1}. {q.q}</div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.choices.map((choice: string, idx: number) => {
                      const selected = answers[i] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setAnswers(a => ({ ...a, [i]: idx }))}
                          className={`rounded border px-3 py-2 text-left text-sm transition ${
                            selected ? "border gaia-contrast shadow-sm" : "gaia-border gaia-hover-soft"
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3">
                <Button onClick={() => grade()}>
                  Grade quiz
                </Button>
                {score !== null && sel && (
                  <div className="text-sm">
                    Score: <span className={score >= passNeeded ? "gaia-positive" : "gaia-negative"}>{score}/{sel.quiz.length}</span> (pass â‰¥ {passNeeded})
                  </div>
                )}
              </div>
            </div>
          )}

          {step === "build" && (
            <div className="mt-4 space-y-3">
              <p className="text-sm gaia-text-default">
                Paste a link to your private build (e.g., local dev server, Vercel preview, CodePen) anywhere in your notes below to embed it in Labs.
              </p>
              <textarea
                className="w-full rounded-md border gaia-border p-3 text-sm focus:outline-none gaia-focus"
                rows={5}
                value={/* @ts-ignore */ sel._note ?? ""}
                onChange={(e) => {
                  /* @ts-ignore */ sel._note = e.target.value;
                }}
                placeholder="Your build notes + link (optional)â€¦"
              />
              <div className="text-xs gaia-muted">Saved locally in the next step; first URL gets embedded in Labs.</div>
            </div>
          )}

          {step === "done" && (
            <div className="mt-4 space-y-2">
              <div className="gaia-positive">Nice â€” this node is unlocked in your Tower.</div>
              <a className="text-sm underline hover:no-underline" href="/Labs">View in Labs â†’</a>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            {step !== "done" && (
              <Button
                onClick={() => {
                  if (step === "learn") setStep("choose");
                  else if (step === "quiz") setStep("learn");
                  else if (step === "build") setStep("quiz");
                }}
                className="opacity-75"
              >
                Back
              </Button>
            )}

            {step !== "done" && (
              <Button
                onClick={() => {
                  if (!sel) return;
                  if (step === "learn") setStep("quiz");
                  else if (step === "quiz") {
                    if (score === null) return;
                    if (score >= passNeeded) setStep("build");
                  } else if (step === "build") {
                    writeResult({
                      conceptId: sel.id,
                      score: score ?? 0,
                      total: sel.quiz.length,
                      notes: /* @ts-ignore */ sel._note ?? "",
                      completedAt: Date.now(),
                    });
                    if (!isUnlocked(sel.nodeId)) {
                      toggleNode(sel.nodeId, true);
                    }
                    setStep("done");
                  }
                }}
                disabled={!canContinue}
              >
                {step === "learn" ? "Next" : step === "quiz" ? "Continue" : step === "build" ? "Finish" : "Continue"}
              </Button>
            )}

            {step === "done" && (
              <Button onClick={() => setStep("choose")}>Choose another</Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}


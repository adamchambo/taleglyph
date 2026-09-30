import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { manuscriptApi } from "../api/manuscriptApi";
import type { Scene } from "../types";
export function SceneEditor({
  initial,
  onSaved,
  onDirty,
}: {
  initial: Scene;
  onSaved: (scene: Scene) => void;
  onDirty: (id: string, dirty: boolean) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = draft.title !== initial.title || draft.prose !== initial.prose;
  function edit(patch: Partial<Scene>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    onDirty(
      initial.id,
      next.title !== initial.title || next.prose !== initial.prose,
    );
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      const saved = await manuscriptApi.saveScene(draft);
      onDirty(initial.id, false);
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="scene-editor">
      <div className="toolbar">
        <span className="eyebrow">
          Scene {draft.order} ·{" "}
          {dirty ? "Unsaved changes" : `Revision ${initial.revision}`}
        </span>
        <Button disabled={!dirty || busy || !draft.title.trim()} onClick={save}>
          {busy ? "Saving…" : "Save scene"}
        </Button>
      </div>
      <label>
        Scene title
        <input
          maxLength={120}
          value={draft.title}
          onChange={(e) => edit({ title: e.target.value })}
          disabled={busy}
        />
      </label>
      <label>
        Scene prose
        <textarea
          className="prose-editor"
          maxLength={100000}
          value={draft.prose}
          onChange={(e) => edit({ prose: e.target.value })}
          placeholder="Write here, or paste a scene from your manuscript…"
          disabled={busy}
        />
      </label>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  );
}

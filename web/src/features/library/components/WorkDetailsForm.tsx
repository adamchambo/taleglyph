import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { spaceApi } from "../api/spaceApi";
import type { WorkKind } from "../types";
import { CoverPicker } from "./CoverPicker";
type Details = { title: string; coverAssetId: string | null };
export function WorkDetailsForm({
  kind,
  id,
  spaceId,
  initial,
  onSaved,
  onDirty,
}: {
  kind: WorkKind;
  id: string;
  spaceId: string;
  initial: Details;
  onSaved: (details: Details) => void;
  onDirty: (dirty: boolean) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [dirty, setDirtyState] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  function setDirty(value: boolean) {
    setDirtyState(value);
    onDirty(value);
  }
  function edit(patch: Partial<Details>) {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
    setSaved(false);
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const next = { ...draft, title: draft.title.trim() };
      await spaceApi.updateWork(kind, id, next);
      onSaved(next);
      setDirty(false);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save details.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="work-details" onSubmit={submit}>
      <fieldset disabled={busy}>
        <label>
          Title
          <Input
            required
            maxLength={120}
            value={draft.title}
            onChange={(e) => edit({ title: e.target.value })}
          />
        </label>
        <CoverPicker
          spaceId={spaceId}
          value={draft.coverAssetId}
          onChange={(coverAssetId) => edit({ coverAssetId })}
        />
        {error ? (
          <p role="alert" className="error">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p role="status" className="success">
            Details saved.
          </p>
        ) : null}
        <Button type="submit" disabled={!dirty || !draft.title.trim()}>
          {busy ? "Saving…" : "Save details"}
        </Button>
      </fieldset>
    </form>
  );
}

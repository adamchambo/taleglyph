import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import type { CharacterInput } from "../types";
const empty: CharacterInput = {
  name: "",
  role: "",
  description: "",
  motivation: "",
  canonStatus: "Draft",
};
export function CharacterForm({
  initial = empty,
  onSubmit,
  onCancel,
  label = "Create character",
  showLegend = true,
}: {
  initial?: CharacterInput;
  onSubmit: (input: CharacterInput) => Promise<void>;
  onCancel?: () => void;
  label?: string;
  showLegend?: boolean;
}) {
  const [form, setForm] = useState<CharacterInput>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit(form);
      if (label === "Create character") setForm(empty);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to save character.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form" onSubmit={submit}>
      <fieldset disabled={busy}>
        {showLegend ? <legend>{label}</legend> : null}
        <label>
          Name
          <input
            required
            autoFocus={!initial.name}
            data-autofocus={initial.name ? undefined : ""}
            maxLength={120}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Role
          <input
            maxLength={120}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </label>
        <label>
          Description
          <textarea
            maxLength={4000}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label>
          Motivation
          <textarea
            maxLength={2000}
            value={form.motivation}
            onChange={(e) => setForm({ ...form, motivation: e.target.value })}
          />
        </label>
        <label>
          Canon status
          <select
            value={form.canonStatus}
            onChange={(e) =>
              setForm({
                ...form,
                canonStatus: e.target.value as CharacterInput["canonStatus"],
              })
            }
          >
            <option>Draft</option>
            <option>Canon</option>
          </select>
        </label>
        {error ? (
          <p role="alert" className="error">
            {error}
          </p>
        ) : null}
        <div className="toolbar">
          <Button type="submit">{busy ? "Saving…" : label}</Button>
          {onCancel ? (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </fieldset>
    </form>
  );
}

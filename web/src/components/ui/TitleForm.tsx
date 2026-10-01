import { useState, type FormEvent } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
export function TitleForm({
  label,
  action,
  onCreate,
}: {
  label: string;
  action: string;
  onCreate: (title: string) => Promise<unknown>;
}) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onCreate(title.trim());
      setTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="inline-form" onSubmit={submit}>
      <label>
        {label}
        <Input
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={busy}
        />
      </label>
      <Button type="submit" disabled={busy || !title.trim()}>
        {busy ? "Saving…" : action}
      </Button>
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
    </form>
  );
}

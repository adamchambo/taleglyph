import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/Icon";
import { Input, Textarea } from "../../../components/ui/Input";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { spaceApi } from "../api/spaceApi";
import { CoverPicker } from "../components/CoverPicker";
import { SpaceRequired } from "../components/SpaceRequired";
import type { SpaceCard } from "../types";
function SpaceSettingsForm({ space }: { space: SpaceCard }) {
  const { refresh } = useWorkspace();
  const [draft, setDraft] = useState({
    name: space.name,
    description: space.description,
    coverAssetId: space.coverAssetId,
  });
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  useUnsavedChanges(dirty);
  function edit(patch: Partial<typeof draft>) {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
    setSaved(false);
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await spaceApi.update(space.id, {
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
      });
      setDirty(false);
      setSaved(true);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save space.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="story-setup" onSubmit={submit}>
      <fieldset disabled={busy}>
        <div className="setup-step">
          <label>
            Space name
            <Input
              required
              maxLength={120}
              value={draft.name}
              onChange={(e) => edit({ name: e.target.value })}
            />
          </label>
          <label>
            Description <span className="optional">Optional</span>
            <Textarea
              maxLength={4000}
              rows={5}
              placeholder="What stays true across every story in this space…"
              value={draft.description}
              onChange={(e) => edit({ description: e.target.value })}
            />
          </label>
        </div>
        <div className="setup-step">
          <h2>Cover artwork</h2>
          <CoverPicker
            spaceId={space.id}
            value={draft.coverAssetId}
            onChange={(coverAssetId) => edit({ coverAssetId })}
          />
        </div>
        {error ? (
          <p role="alert" className="error">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p role="status" className="success">
            Space details saved.
          </p>
        ) : null}
        <div className="setup-actions">
          <Button type="submit" disabled={!dirty || !draft.name.trim()}>
            {busy ? "Saving…" : "Save space details"}
            <Icon name="arrow" size={17} />
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
export function SpaceSettingsPage() {
  return (
    <section className="onboarding-page">
      <SpaceRequired>
        {(space) => (
          <>
            <Link className="back-link" to={`/spaces/${space.id}`}>
              ← {space.name}
            </Link>
            <h1>Space details</h1>
            <SpaceSettingsForm key={space.id} space={space} />
          </>
        )}
      </SpaceRequired>
    </section>
  );
}

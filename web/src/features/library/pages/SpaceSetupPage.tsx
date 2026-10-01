import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/Icon";
import { Input, Textarea } from "../../../components/ui/Input";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { worldApi } from "../../world/api/worldApi";
export function SpaceSetupPage() {
  const { refresh } = useWorkspace();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ id: string; name: string } | null>(
    null,
  );
  useUnsavedChanges(
    !created && (name.trim() !== "" || description.trim() !== ""),
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const world = await worldApi.create({
        name: name.trim(),
        description: description.trim(),
        theme: "fantasy",
      });
      await refresh();
      setCreated({ id: world.id, name: world.name });
      navigate(`/spaces/${world.id}`);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create space.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="onboarding-page">
      <Link className="back-link" to="/library">
        ← Your library
      </Link>
      <div className="onboarding-title">
        <span className="eyebrow">A shared space</span>
        <h1>Name the world these stories belong to.</h1>
      </div>
      {created ? (
        <form className="story-setup">
          <div className="setup-step space-created">
            <h2>{created.name} is ready.</h2>
            <p className="muted">
              Add a story when you want to tell something inside it. Places,
              peoples and assets added later are shared by every story in this
              space.
            </p>
            <div className="setup-actions">
              <Link className="button" to={`/stories/new?space=${created.id}`}>
                Add a story
                <Icon name="arrow" size={17} />
              </Link>
              <Link className="button secondary" to="/library">
                Back to library
              </Link>
            </div>
          </div>
        </form>
      ) : (
        <form className="story-setup" onSubmit={submit}>
          <fieldset disabled={busy}>
            <div className="setup-step">
              <h2>What space is this?</h2>
              <p className="muted">
                A space is the shared universe for its stories. You can add a
                story once you are inside it.
              </p>
              <label>
                Space name
                <Input
                  required
                  autoFocus
                  maxLength={120}
                  placeholder="The Aegis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="field-hint">
                  Only the space name is required.
                </span>
              </label>
              <label>
                Space description <span className="optional">Optional</span>
                <Textarea
                  maxLength={4000}
                  rows={5}
                  placeholder="What stays true across every story in this space…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <div className="ai-suggest">
                <Button
                  type="button"
                  variant="secondary"
                  disabled
                  aria-describedby="ai-suggest-note"
                >
                  Suggest places and peoples
                </Button>
                <p id="ai-suggest-note" className="field-hint">
                  AI is not connected yet. Later, this can suggest places,
                  peoples and events from the description for you to accept. It
                  will not change the space on its own.
                </p>
              </div>
              {error ? (
                <p role="alert" className="error">
                  {error}
                </p>
              ) : null}
              <div className="setup-actions">
                <Button
                  className="button"
                  disabled={!name.trim() || busy}
                  type="submit"
                >
                  {busy ? "Saving…" : "Create space"}
                  <Icon name="arrow" size={17} />
                </Button>
              </div>
            </div>
          </fieldset>
        </form>
      )}
    </section>
  );
}

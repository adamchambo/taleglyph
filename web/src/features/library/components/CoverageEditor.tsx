import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Input";
import { spaceApi } from "../api/spaceApi";
import { describeLink } from "../links";
import type { Arc, LinkSource, StoryCard, StoryLink } from "../types";
export function CoverageEditor({
  fromKind,
  fromId,
  stories,
  arcs,
  initial,
  label,
}: {
  fromKind: LinkSource;
  fromId: string;
  stories: StoryCard[];
  arcs: Arc[];
  initial: StoryLink[];
  label: string;
}) {
  const [links, setLinks] = useState(() =>
    initial.filter((l) => l.fromKind === fromKind && l.fromId === fromId),
  );
  const [choice, setChoice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const linked = new Set(links.map((l) => l.toId));
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save that link.");
    } finally {
      setBusy(false);
    }
  }
  function add() {
    const [toKind, toId] = choice.split(":") as ["story" | "arc", string];
    void run(async () => {
      const link = await spaceApi.createLink({
        fromKind,
        fromId,
        toKind,
        toId,
      });
      setLinks((items) => [...items, link]);
      setChoice("");
    });
  }
  function remove(link: StoryLink) {
    const label = describeLink(link, stories, arcs);
    if (!window.confirm(`Remove the link to “${label}”?`)) return;
    void run(async () => {
      await spaceApi.deleteLink(link.id);
      setLinks((items) => items.filter((l) => l.id !== link.id));
    });
  }
  return (
    <div className="coverage-editor">
      <p className="tag-group-label">{label}</p>
      {links.length ? (
        <ul className="link-chips">
          {links.map((link) => (
            <li key={link.id}>
              <span>{describeLink(link, stories, arcs)}</span>
              <button
                type="button"
                aria-label={`Remove ${describeLink(link, stories, arcs)}`}
                disabled={busy}
                onClick={() => remove(link)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Not linked to a story yet.</p>
      )}
      {stories.length ? (
        <div className="custom-tag">
          <label className="sr-only" htmlFor={`link-${fromId}`}>
            Link a story or arc
          </label>
          <Select
            id={`link-${fromId}`}
            value={choice}
            disabled={busy}
            onChange={(e) => setChoice(e.target.value)}
          >
            <option value="">Link a story or arc…</option>
            {stories.map((story) => (
              <optgroup key={story.id} label={story.title}>
                {!linked.has(story.id) ? (
                  <option value={`story:${story.id}`}>
                    {story.title} (whole story)
                  </option>
                ) : null}
                {arcs
                  .filter((a) => a.storyId === story.id && !linked.has(a.id))
                  .map((arc) => (
                    <option key={arc.id} value={`arc:${arc.id}`}>
                      {arc.order}. {arc.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </Select>
          <Button variant="secondary" disabled={!choice || busy} onClick={add}>
            Link
          </Button>
        </div>
      ) : (
        <p className="field-hint">Add a story to this space to link it.</p>
      )}
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

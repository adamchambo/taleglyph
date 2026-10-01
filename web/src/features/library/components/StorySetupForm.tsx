import { Button } from "../../../components/ui/Button";
import { Input, Textarea } from "../../../components/ui/Input";
import { useEffect, useId, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { Icon } from "../../../components/ui/Icon";
import { libraryApi } from "../api/libraryApi";
import { genres, sameTag, tones } from "../storyTags";
import { storyPath, type StoryCard, type StorySetup } from "../types";
function groupChoices(defaults: string[], tags: string[]) {
  return defaults.map((name) => tags.find((tag) => sameTag(tag, name)) ?? name);
}
function unmatchedTags(tags: string[]) {
  return tags.filter(
    (tag) =>
      !genres.some((name) => sameTag(tag, name)) &&
      !tones.some((name) => sameTag(tag, name)),
  );
}
function TagChoices({
  tags,
  values,
  onToggle,
}: {
  tags: string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="tag-choices">
      {values.map((value) => (
        <Button
          type="button"
          key={value}
          aria-pressed={tags.includes(value)}
          onClick={() => onToggle(value)}
          disabled={!tags.includes(value) && tags.length >= 12}
        >
          {value}
        </Button>
      ))}
    </div>
  );
}
export function StorySetupForm({
  initial,
  spaceId,
}: {
  initial?: StoryCard;
  spaceId: string;
}) {
  const { library, upsert } = useWorkspace();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<StorySetup>(() => ({
    title: initial?.title ?? "",
    overview: initial?.overview ?? "",
    spaceId,
    tags: initial?.tags ?? [],
    revision: initial?.revision ?? 1,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [destination, setDestination] = useState<string | null>(null);
  const genreLabelId = useId();
  const toneLabelId = useId();
  const savedLabelId = useId();
  const savedTags = unmatchedTags(draft.tags);
  useUnsavedChanges(dirty && !saved);
  useEffect(() => {
    if (destination && !dirty) navigate(destination);
  }, [destination, dirty, navigate]);
  function edit(patch: Partial<StorySetup>) {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
    setSaved(false);
  }
  function tag(value: string) {
    if (draft.tags.includes(value))
      edit({ tags: draft.tags.filter((t) => t !== value) });
    else if (draft.tags.length < 12) edit({ tags: [...draft.tags, value] });
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const story = initial
        ? await libraryApi.update(initial.id, draft)
        : await libraryApi.create(draft);
      upsert(story);
      setSaved(true);
      setDirty(false);
      setDraft((d) => ({ ...d, revision: story.revision }));
      if (!initial) setDestination(storyPath(story));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save story.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="story-setup" onSubmit={submit}>
      <fieldset disabled={busy}>
        <div className="setup-step">
          {!initial ? (
            <>
              <h2>What happens in this story?</h2>
              <p className="muted">
                A name is enough. You can break it into arcs, and link novels
                and comics to it, once it exists.
              </p>
            </>
          ) : null}
          <label>
            Story name
            <Input
              required
              autoFocus={!initial}
              maxLength={120}
              placeholder="Ash and Meridian"
              value={draft.title}
              onChange={(e) => edit({ title: e.target.value })}
            />
            {!initial ? (
              <span className="field-hint">
                Only the story name is required.
              </span>
            ) : null}
          </label>
          <label>
            Brief story overview <span className="optional">Optional</span>
            <Textarea
              maxLength={4000}
              rows={5}
              placeholder="A character, a place, a question you can't let go of…"
              value={draft.overview}
              onChange={(e) => edit({ overview: e.target.value })}
            />
          </label>
          {!initial ? (
            <div className="space-summary">
              <Icon name="world" />
              <div>
                <strong>
                  {library?.spaces.find((space) => space.id === spaceId)
                    ?.name ?? "This space"}
                </strong>
                <p>
                  This story joins that space. Places, peoples and assets stay
                  shared.
                </p>
              </div>
            </div>
          ) : null}
        </div>
        {initial ? (
          <div className="setup-step">
            <h2>Tags</h2>
            <div className="tag-field">
              <p className="field-hint">Choose several, or add your own.</p>
              <div
                className="tag-group"
                role="group"
                aria-labelledby={genreLabelId}
              >
                <p id={genreLabelId} className="tag-group-label">
                  Genre
                </p>
                <TagChoices
                  tags={draft.tags}
                  values={groupChoices(genres, draft.tags)}
                  onToggle={tag}
                />
              </div>
              <div
                className="tag-group"
                role="group"
                aria-labelledby={toneLabelId}
              >
                <p id={toneLabelId} className="tag-group-label">
                  Tone
                </p>
                <TagChoices
                  tags={draft.tags}
                  values={groupChoices(tones, draft.tags)}
                  onToggle={tag}
                />
              </div>
              {savedTags.length > 0 ? (
                <div
                  className="tag-group"
                  role="group"
                  aria-labelledby={savedLabelId}
                >
                  <p id={savedLabelId} className="tag-group-label">
                    On this story
                  </p>
                  <TagChoices
                    tags={draft.tags}
                    values={savedTags}
                    onToggle={tag}
                  />
                </div>
              ) : null}
            </div>
            <div className="custom-tag">
              <label className="sr-only" htmlFor="custom-tag">
                Custom tag
              </label>
              <Input
                id="custom-tag"
                maxLength={40}
                placeholder="Add your own tag"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
              />
              <Button
                type="button"
                className="button secondary"
                disabled={!customTag.trim() || draft.tags.length >= 12}
                onClick={() => {
                  const value = customTag.trim();
                  if (!draft.tags.some((t) => sameTag(t, value))) tag(value);
                  setCustomTag("");
                }}
              >
                Add tag
              </Button>
            </div>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="error">
            {error}
          </p>
        ) : null}
        {saved && initial ? (
          <p role="status" className="success">
            Story details saved.
          </p>
        ) : null}
        <div className="setup-actions">
          <Button
            className="button"
            disabled={!draft.title.trim() || busy}
            type="submit"
          >
            {busy ? "Saving…" : initial ? "Save story details" : "Create story"}
            <Icon name="arrow" size={17} />
          </Button>
        </div>
      </fieldset>
    </form>
  );
}

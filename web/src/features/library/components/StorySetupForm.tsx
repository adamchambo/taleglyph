import { Button } from "../../../components/ui/Button";
import { Input, Textarea, Select } from "../../../components/ui/Input";
import { useEffect, useId, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { Icon } from "../../../components/ui/Icon";
import { libraryApi } from "../api/libraryApi";
import { sectionPath, type StoryCard, type StorySetup } from "../types";
import type { Asset } from "../../assets/types";
import { AssetUploader } from "../../assets/components/AssetUploader";
const genres = [
  "Fantasy",
  "Science fiction",
  "Action",
  "Adventure",
  "Horror",
  "Mystery",
  "Thriller",
  "Romance",
  "Drama",
  "Comedy",
  "Historical",
  "Slice of life",
];
const tones = [
  "Hopeful",
  "Dark",
  "Gritty",
  "Eerie",
  "Suspenseful",
  "Tragic",
  "Cozy",
  "Whimsical",
  "Humorous",
  "Romantic",
];
function sameTag(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}
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
  assets = [],
  spaceId = null,
}: {
  initial?: StoryCard;
  assets?: Asset[];
  spaceId?: string | null;
}) {
  const { library, upsert, refresh } = useWorkspace();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<StorySetup>(() => ({
    title: initial?.title ?? "",
    overview: initial?.overview ?? "",
    spaceId: initial?.spaceId ?? spaceId,
    newSpaceName: null,
    tags: initial?.tags ?? [],
    startingSection: initial?.startingSection ?? "overview",
    coverAssetId: initial?.coverAssetId ?? null,
    seriesId: initial?.seriesId ?? null,
    revision: initial?.revision ?? 1,
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [images, setImages] = useState(assets);
  const [seriesName, setSeriesName] = useState("");
  const [seriesOptions, setSeriesOptions] = useState(library?.series ?? []);
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
      if (!initial) {
        setDestination(sectionPath(story.id, story.startingSection));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save story.");
    } finally {
      setBusy(false);
    }
  }
  async function createSeries() {
    if (!draft.spaceId || !seriesName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const series = await libraryApi.createSeries(draft.spaceId, seriesName);
      setSeriesOptions((items) => [...items, series]);
      edit({ seriesId: series.id });
      setSeriesName("");
      void refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create series.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form className="story-setup" onSubmit={submit}>
        <fieldset disabled={busy}>
          <div className="setup-step">
            {!initial ? (
              <>
                <h2>What story is on your mind?</h2>
                <p className="muted">
                  A name is enough. You'll land on the story home and can open
                  any section from there.
                </p>
              </>
            ) : null}
            <label>
              Story name
                <Input
                  required
                  autoFocus={!initial}
                  maxLength={120}
                  placeholder="The Lantern Road"
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
                    {library?.spaces.find((space) => space.id === draft.spaceId)
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
              <h2>Organisation and tags</h2>
              <div className="space-summary">
                <Icon name="world" />
                <div>
                  <strong>{initial.spaceName}</strong>
                  <p>Shared setting, characters and assets</p>
                </div>
              </div>
              {draft.spaceId ? (
                <>
                  <label>
                    Series <span className="optional">Optional</span>
                    <Select
                      value={draft.seriesId ?? ""}
                      onChange={(e) =>
                        edit({ seriesId: e.target.value || null })
                      }
                    >
                      <option value="">Standalone / no series</option>
                      {seriesOptions
                        .filter((s) => s.spaceId === draft.spaceId)
                        .map((s) => (
                          <option value={s.id} key={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </Select>
                  </label>
                  {initial ? (
                    <details className="series-create">
                      <summary>Add a series</summary>
                      <label>
                        New series name
                        <Input
                          maxLength={120}
                          value={seriesName}
                          onChange={(e) => setSeriesName(e.target.value)}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!seriesName.trim()}
                        onClick={createSeries}
                      >
                        Create series
                      </Button>
                    </details>
                  ) : null}
                </>
              ) : null}
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
                    if (
                      !draft.tags.some(
                        (t) => t.toLowerCase() === value.toLowerCase(),
                      )
                    )
                      tag(value);
                    setCustomTag("");
                  }}
                >
                  Add tag
                </Button>
              </div>
            </div>
          ) : null}
          {initial ? (
            <div className="setup-step">
              <h2>Cover artwork</h2>
              <label>
                Story cover
                <Select
                  value={draft.coverAssetId ?? ""}
                  onChange={(e) =>
                    edit({ coverAssetId: e.target.value || null })
                  }
                >
                  <option value="">Typographic cover</option>
                  {images
                    .filter((a) => a.imageUrl)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </Select>
              </label>
              {draft.coverAssetId ? (
                <img
                  className="cover-preview"
                  src={libraryApi.cover(draft.coverAssetId)}
                  alt="Selected story cover"
                />
              ) : null}
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
              disabled={
                !draft.title.trim() || busy || (!initial && !draft.spaceId)
              }
              type="submit"
            >
              {busy
                ? "Saving…"
                : initial
                  ? "Save story details"
                  : "Create story"}
              <Icon name="arrow" size={17} />
            </Button>
          </div>
        </fieldset>
      </form>
      {initial ? (
        <details className="cover-upload">
          <summary>Upload new cover artwork</summary>
          <AssetUploader
            worldId={initial.spaceId}
            onUploaded={(asset) => {
              setImages((items) => [...items, asset]);
              edit({ coverAssetId: asset.id });
            }}
          />
        </details>
      ) : null}
    </>
  );
}

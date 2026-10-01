import { Button } from "../../../components/ui/Button";
import { Input, Textarea, Select } from "../../../components/ui/Input";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges";
import { Icon } from "../../../components/ui/Icon";
import { libraryApi } from "../api/libraryApi";
import {
  sections,
  sectionPath,
  type StoryCard,
  type StorySetup,
  type Section,
} from "../types";
import type { Asset } from "../../assets/types";
import { AssetUploader } from "../../assets/components/AssetUploader";
const suggested = [
  "Fantasy",
  "Science fiction",
  "Mystery",
  "Romance",
  "Historical",
  "Adventure",
  "Literary",
  "Nonfiction",
  "Hopeful",
  "Dark",
  "Whimsical",
];
export function StorySetupForm({
  initial,
  assets = [],
}: {
  initial?: StoryCard;
  assets?: Asset[];
}) {
  const { library, upsert, refresh } = useWorkspace();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<StorySetup>(() => ({
    title: initial?.title ?? "",
    overview: initial?.overview ?? "",
    spaceId: initial?.spaceId ?? null,
    newSpaceName: null,
    tags: initial?.tags ?? [],
    startingSection: initial?.startingSection ?? "overview",
    coverAssetId: initial?.coverAssetId ?? null,
    seriesId: initial?.seriesId ?? null,
    revision: initial?.revision ?? 1,
  }));
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [images, setImages] = useState(assets);
  const [seriesName, setSeriesName] = useState("");
  const [seriesOptions, setSeriesOptions] = useState(library?.series ?? []);
  const [destination, setDestination] = useState<string | null>(null);
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
    if (!initial && step < 2) {
      setStep((s) => s + 1);
      return;
    }
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
        {!initial ? (
          <ol className="onboarding-steps">
            {["The idea", "The world around it", "Your starting point"].map(
              (label, i) => (
                <li
                  key={label}
                  className={
                    step === i ? "current" : step > i ? "complete" : ""
                  }
                >
                  <span>{i + 1}</span>
                  {label}
                </li>
              ),
            )}
          </ol>
        ) : null}
        <fieldset disabled={busy}>
          {initial || step === 0 ? (
            <div className="setup-step">
              {!initial ? (
                <>
                  <p className="eyebrow">01 / The spark</p>
                  <h2>What story is on your mind?</h2>
                  <p className="muted">A name is enough to begin.</p>
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
            </div>
          ) : null}
          {initial || step === 1 ? (
            <div className="setup-step">
              {!initial ? (
                <p className="eyebrow">02 / The wider world</p>
              ) : null}
              <h2>
                {initial
                  ? "Organisation and tags"
                  : "Give it a place to belong."}
              </h2>
              {!initial ? (
                <>
                  <label>
                    Story space
                    <Select
                      value={draft.spaceId ?? ""}
                      onChange={(e) =>
                        edit({
                          spaceId: e.target.value || null,
                          seriesId: null,
                          coverAssetId: null,
                        })
                      }
                    >
                      <option value="">A new space for this story</option>
                      {library?.spaces.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </label>
                  {!draft.spaceId ? (
                    <label>
                      New space name <span className="optional">Optional</span>
                      <Input
                        maxLength={120}
                        placeholder="Use the story name"
                        value={draft.newSpaceName ?? ""}
                        onChange={(e) =>
                          edit({ newSpaceName: e.target.value || null })
                        }
                      />
                    </label>
                  ) : (
                    <p className="field-hint">
                      Characters, world information and assets will be shared
                      with stories in this space.
                    </p>
                  )}
                </>
              ) : (
                <div className="space-summary">
                  <Icon name="world" />
                  <div>
                    <strong>{initial.spaceName}</strong>
                    <p>Shared setting, characters and assets</p>
                  </div>
                </div>
              )}
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
              <label>
                Genre and tone{" "}
                <span className="optional">
                  Choose several, or add your own
                </span>
              </label>
              <div className="tag-choices">
                {[...new Set([...suggested, ...draft.tags])].map((t) => (
                  <Button
                    type="button"
                    key={t}
                    aria-pressed={draft.tags.includes(t)}
                    onClick={() => tag(t)}
                    disabled={
                      !draft.tags.includes(t) && draft.tags.length >= 12
                    }
                  >
                    {t}
                  </Button>
                ))}
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
          {!initial && step === 2 ? (
            <div className="setup-step">
              <p className="eyebrow">03 / Follow your curiosity</p>
              <h2>Where would you like to start?</h2>
              <p className="muted">
                There’s no right order. You can switch sections whenever you
                like.
              </p>
              <div className="starting-grid">
                {sections.map((s) => (
                  <label
                    key={s.id}
                    className={`starting-choice ${draft.startingSection === s.id ? "selected" : ""}`}
                  >
                    <Input
                      type="radio"
                      name="starting"
                      value={s.id}
                      checked={draft.startingSection === s.id}
                      onChange={() =>
                        edit({ startingSection: s.id as Section })
                      }
                    />
                    <Icon name={s.id} />
                    <span>
                      <strong>{s.label}</strong>
                      {s.future ? <small>Workspace coming next</small> : null}
                    </span>
                  </label>
                ))}
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
            {!initial && step > 0 ? (
              <Button
                className="button secondary"
                type="button"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
            ) : null}
            <Button
              className="button"
              disabled={!draft.title.trim() || busy}
              type="submit"
            >
              {busy
                ? "Saving…"
                : initial
                  ? "Save story details"
                  : step === 2
                    ? "Create story"
                    : "Continue"}
              <Icon name="arrow" size={17} />
            </Button>
            {!initial && step === 0 ? (
              <span className="field-hint">
                Only the story name is required.
              </span>
            ) : null}
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

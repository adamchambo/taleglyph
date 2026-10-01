import { useCallback, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useResource } from "../../../hooks/useResource";
import { comicApi } from "../../comics/api/comicApi";
import type { ChapterWorkspace, Scene } from "../types";
export function AdaptChapterForm({
  data,
  scenes,
  dirty,
}: {
  data: ChapterWorkspace;
  scenes: Scene[];
  dirty: boolean;
}) {
  const navigate = useNavigate();
  const templates = useResource(
    useCallback(
      (s: AbortSignal) => comicApi.templates(data.story.worldId, s),
      [data.story.worldId],
    ),
  );
  const [selection, setSelection] = useState<string[]>(scenes.map((s) => s.id));
  const [title, setTitle] = useState(
    `${data.chapter.title} — comic`.slice(0, 120),
  );
  const [template, setTemplate] = useState("blank");
  const [count, setCount] = useState(3);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function adapt(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const comic = await comicApi.adapt(
        data.chapter.id,
        title,
        selection,
        count,
        template === "blank" ? null : template,
      );
      navigate(`/comics/${comic.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Adaptation failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="adapt-form card" onSubmit={adapt}>
      <p className="eyebrow">A new form for your story</p>
      <h2>Adapt to comic</h2>
      <p>
        Choose scenes and a starting layout. Each scene becomes one page that
        you can shape yourself.
      </p>
      <fieldset disabled={busy || dirty}>
        <legend>Source scenes</legend>
        {scenes.map((s) => (
          <label className="check-row" key={s.id}>
            <input
              type="checkbox"
              checked={selection.includes(s.id)}
              onChange={(e) =>
                setSelection((ids) =>
                  e.target.checked
                    ? [...ids, s.id]
                    : ids.filter((id) => id !== s.id),
                )
              }
            />
            <span>
              {s.order}. {s.title}
            </span>
          </label>
        ))}
        <label>
          Comic title
          <input
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Starting template
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            <option value="blank">Fresh page · blank panels</option>
            {templates.data?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.panelCount} panels
              </option>
            ))}
          </select>
        </label>
        {template === "blank" ? (
          <label>
            Panels per page
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              <option value={1}>1 · Full-page panel</option>
              <option value={2}>2 · Two moments</option>
              <option value={3}>3 · Three beats</option>
            </select>
          </label>
        ) : (
          <p>
            Includes the template’s saved artwork, text and layer positions.
          </p>
        )}
        <Button
          type="submit"
          disabled={!selection.length || !title.trim() || selection.length > 50}
        >
          {busy
            ? "Creating pages…"
            : `Create ${selection.length} comic ${selection.length === 1 ? "page" : "pages"}`}
        </Button>
      </fieldset>
      {dirty ? (
        <p role="status" className="notice">
          Save your scene changes before adapting.
        </p>
      ) : null}
      <ResourceState
        loading={templates.loading}
        error={templates.error}
        retry={templates.reload}
      />
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      <small>
        AI-assisted panel planning is planned. This creates an editable layout
        using your selected template.
      </small>
    </form>
  );
}

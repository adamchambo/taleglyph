import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { TitleForm } from "../../../components/ui/TitleForm";
import { AssetUploader } from "../../assets/components/AssetUploader";
import type { Asset } from "../../assets/types";
import { ComicCanvas } from "./ComicCanvas";
import { LayerInspector } from "./LayerInspector";
import { SourcePanel } from "./SourcePanel";
import { comicApi } from "../api/comicApi";
import type { Page, Panel } from "../types";
export function PageEditor({
  page,
  worldId,
  assets,
  onAssets,
  onSaved,
  onDirty,
  onSourceRefresh,
}: {
  page: Page;
  worldId: string;
  assets: Asset[];
  onAssets: (asset: Asset) => void;
  onSaved: (page: Page) => void;
  onDirty: (dirty: boolean) => void;
  onSourceRefresh: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(page);
  const [selected, setSelected] = useState(0);
  const [layer, setLayer] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dirty = JSON.stringify(draft.panels) !== JSON.stringify(page.panels);
  function edit(panels: Panel[]) {
    setDraft((d) => ({ ...d, panels }));
    onDirty(JSON.stringify(panels) !== JSON.stringify(page.panels));
    setMessage("");
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      const saved = await comicApi.save(draft);
      setDraft(saved);
      onSaved(saved);
      onDirty(false);
      setMessage("Page saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save page.");
    } finally {
      setBusy(false);
    }
  }
  async function sourceAction(review = false) {
    setBusy(true);
    setError("");
    try {
      if (review && page.source)
        await comicApi.review(page.id, page.source.currentRevision);
      await onSourceRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to check source.");
    } finally {
      setBusy(false);
    }
  }
  function panelSelect(index: number) {
    setSelected(index);
    setLayer(0);
  }
  return (
    <>
      <div className="editor-toolbar">
        <span>
          Page {page.number}{" "}
          <small>
            · {dirty ? "Unsaved changes" : `Saved · revision ${page.revision}`}
          </small>
        </span>
        <Button
          disabled={
            !dirty ||
            busy ||
            draft.panels.some(
              (p) => !p.title.trim() || p.layers.some((l) => !l.name.trim()),
            )
          }
          onClick={save}
        >
          {busy ? "Working…" : "Save page"}
        </Button>
      </div>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="success" role="status">
          {message}
        </p>
      ) : null}
      <div className="comic-workspace">
        <SourcePanel
          source={page.source}
          busy={busy}
          onReview={() => sourceAction(true)}
          onRefresh={() => sourceAction()}
        />
        <div className="canvas-pane">
          <ComicCanvas
            panels={draft.panels}
            selected={selected}
            onSelect={panelSelect}
            assets={assets}
          />
          <div className="toolbar">
            <Button
              disabled={busy || draft.panels.length >= 12}
              onClick={() => {
                edit([
                  ...draft.panels,
                  { title: `Panel ${draft.panels.length + 1}`, layers: [] },
                ]);
                panelSelect(draft.panels.length);
              }}
            >
              + Add panel
            </Button>
            <small>Select a panel to edit its layers.</small>
          </div>
        </div>
        <aside className="inspector">
          <p className="eyebrow">Panel {selected + 1}</p>
          <fieldset className="inspector-fieldset" disabled={busy}>
            <LayerInspector
              panel={draft.panels[selected]}
              assets={assets}
              layerIndex={layer}
              setLayerIndex={setLayer}
              onChange={(panel) =>
                edit(draft.panels.map((p, i) => (i === selected ? panel : p)))
              }
            />
            <div className="toolbar panel-actions">
              <button
                className="text-button"
                disabled={selected === 0}
                onClick={() => {
                  const panels = [...draft.panels];
                  [panels[selected - 1], panels[selected]] = [
                    panels[selected],
                    panels[selected - 1],
                  ];
                  edit(panels);
                  panelSelect(selected - 1);
                }}
              >
                Move panel up
              </button>
              <button
                className="text-button danger"
                disabled={draft.panels.length === 1}
                onClick={() => {
                  if (window.confirm("Remove this panel and its layers?")) {
                    edit(draft.panels.filter((_, i) => i !== selected));
                    panelSelect(0);
                  }
                }}
              >
                Remove panel
              </button>
            </div>
          </fieldset>
          <details>
            <summary>Import artwork into this world</summary>
            <AssetUploader worldId={worldId} onUploaded={onAssets} />
          </details>
          <details>
            <summary>Save as a reusable template</summary>
            <p>Includes this page’s panels, text, images and placements.</p>
            {dirty ? (
              <p className="notice">Save your page changes first.</p>
            ) : (
              <TitleForm
                label="Template name"
                action="Save template"
                onCreate={async (title) => {
                  await comicApi.saveTemplate(page.id, title, page.revision);
                  setMessage(
                    "Template saved. It is available when adapting chapters in this world.",
                  );
                }}
              />
            )}
          </details>
        </aside>
      </div>
    </>
  );
}

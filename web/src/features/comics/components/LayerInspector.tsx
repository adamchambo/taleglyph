import { Button } from "../../../components/ui/Button";
import type { Asset } from "../../assets/types";
import type { Layer, Panel } from "../types";
export function LayerInspector({
  panel,
  assets,
  layerIndex,
  setLayerIndex,
  onChange,
}: {
  panel: Panel;
  assets: Asset[];
  layerIndex: number;
  setLayerIndex: (n: number) => void;
  onChange: (panel: Panel) => void;
}) {
  const selected = panel.layers[layerIndex];
  function patch(change: Partial<Layer>) {
    onChange({
      ...panel,
      layers: panel.layers.map((l, i) =>
        i === layerIndex ? { ...l, ...change } : l,
      ),
    });
  }
  function add(kind: "Text" | "Image") {
    onChange({
      ...panel,
      layers: [
        ...panel.layers,
        {
          name: kind === "Text" ? "Dialogue" : "Artwork",
          kind,
          x: 5,
          y: 5,
          width: kind === "Text" ? 70 : 90,
          visible: true,
          locked: false,
          assetId:
            kind === "Image"
              ? (assets.find((a) => a.imageUrl)?.id ?? null)
              : null,
          text: kind === "Text" ? "Your dialogue here…" : null,
        },
      ],
    });
    setLayerIndex(panel.layers.length);
  }
  function move(direction: number) {
    const layers = [...panel.layers];
    const next = layerIndex + direction;
    if (next < 0 || next >= layers.length) return;
    [layers[layerIndex], layers[next]] = [layers[next], layers[layerIndex]];
    onChange({ ...panel, layers });
    setLayerIndex(next);
  }
  return (
    <>
      <label>
        Panel title
        <input
          maxLength={120}
          value={panel.title}
          onChange={(e) => onChange({ ...panel, title: e.target.value })}
        />
      </label>
      <h3>
        Layers <small>· front to back</small>
      </h3>
      <div className="layer-list">
        {panel.layers
          .map((l, i) => ({ l, i }))
          .reverse()
          .map(({ l, i }) => (
            <button
              key={i}
              className={i === layerIndex ? "active" : ""}
              onClick={() => setLayerIndex(i)}
              aria-pressed={i === layerIndex}
            >
              <span>
                {l.kind === "Image" ? "▧" : "T"} {l.name}
              </span>
              <small>
                {l.locked ? "Locked" : !l.visible ? "Hidden" : l.kind}
              </small>
            </button>
          ))}
      </div>
      <div className="toolbar">
        <Button
          disabled={panel.layers.length >= 30}
          onClick={() => add("Text")}
        >
          + Text
        </Button>
        <Button
          disabled={
            !assets.some((a) => a.imageUrl) || panel.layers.length >= 30
          }
          onClick={() => add("Image")}
        >
          + Image
        </Button>
      </div>
      {selected ? (
        <div className="layer-properties">
          <label className="check-row">
            <input
              type="checkbox"
              checked={selected.locked}
              onChange={(e) => patch({ locked: e.target.checked })}
            />
            Lock layer
          </label>
          <fieldset disabled={selected.locked}>
            <legend>Selected layer</legend>
            <label>
              Layer name
              <input
                maxLength={120}
                value={selected.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </label>
            {selected.kind === "Text" ? (
              <label>
                Dialogue or caption
                <textarea
                  maxLength={4000}
                  value={selected.text ?? ""}
                  onChange={(e) => patch({ text: e.target.value })}
                />
              </label>
            ) : (
              <label>
                Artwork
                <select
                  value={selected.assetId ?? ""}
                  onChange={(e) => patch({ assetId: e.target.value })}
                >
                  {assets
                    .filter((a) => a.imageUrl)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </label>
            )}
            {(["x", "y", "width"] as const).map((field) => (
              <label key={field}>
                {field === "x"
                  ? "Horizontal position"
                  : field === "y"
                    ? "Vertical position"
                    : "Layer width"}{" "}
                · {selected[field]}%
                <input
                  type="range"
                  min={field === "width" ? 5 : 0}
                  max={field === "width" ? 100 : 95}
                  value={selected[field]}
                  onChange={(e) => patch({ [field]: Number(e.target.value) })}
                />
              </label>
            ))}
            <label className="check-row">
              <input
                type="checkbox"
                checked={selected.visible}
                onChange={(e) => patch({ visible: e.target.checked })}
              />
              Visible
            </label>
            <div className="toolbar">
              <button
                className="text-button"
                disabled={layerIndex === panel.layers.length - 1}
                onClick={() => move(1)}
              >
                Bring forward
              </button>
              <button
                className="text-button"
                disabled={layerIndex === 0}
                onClick={() => move(-1)}
              >
                Send backward
              </button>
            </div>
            <button
              className="text-button danger"
              onClick={() => {
                if (!window.confirm("Remove this layer?")) return;
                onChange({
                  ...panel,
                  layers: panel.layers.filter((_, i) => i !== layerIndex),
                });
                setLayerIndex(Math.max(0, layerIndex - 1));
              }}
            >
              Remove layer
            </button>
          </fieldset>
        </div>
      ) : (
        <p className="muted">
          Select a layer to change its placement and content.
        </p>
      )}
    </>
  );
}

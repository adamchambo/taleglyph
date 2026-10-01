import type { Panel } from "../types";
import type { Asset } from "../../assets/types";
import { assetApi } from "../../assets/api/assetApi";
export function ComicCanvas({
  panels,
  assets,
  selected,
  onSelect,
}: {
  panels: Panel[];
  assets: Asset[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  const byId = new Map(assets.map((a) => [a.id, a]));
  return (
    <div className="comic-paper" aria-label="Comic page preview">
      {panels.map((panel, index) => (
        <button
          type="button"
          key={index}
          className={`comic-panel ${selected === index ? "selected" : ""}`}
          aria-label={`Select panel ${index + 1}: ${panel.title}`}
          aria-pressed={selected === index}
          onClick={() => onSelect(index)}
        >
          <span className="panel-number">{index + 1}</span>
          {!panel.layers.some((l) => l.visible) ? (
            <span className="panel-empty">
              {panel.title}
              <small>Add artwork or dialogue</small>
            </span>
          ) : null}
          {panel.layers.map((layer, i) => {
            const asset = layer.assetId ? byId.get(layer.assetId) : null;
            return layer.visible ? (
              <span
                key={i}
                className={`canvas-layer ${layer.kind === "Text" ? "speech" : ""}`}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  width: `${layer.width}%`,
                  zIndex: i + 1,
                }}
              >
                {layer.kind === "Text" ? (
                  layer.text
                ) : asset?.imageUrl ? (
                  <img src={assetApi.image(asset)} alt={asset.name} />
                ) : (
                  <span>Image unavailable</span>
                )}
              </span>
            ) : null;
          })}
        </button>
      ))}
    </div>
  );
}

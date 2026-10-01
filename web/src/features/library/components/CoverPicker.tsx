import { useCallback, useState } from "react";
import { Select } from "../../../components/ui/Input";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useResource } from "../../../hooks/useResource";
import { assetApi } from "../../assets/api/assetApi";
import { AssetUploader } from "../../assets/components/AssetUploader";
import type { Asset } from "../../assets/types";
import { libraryApi } from "../api/libraryApi";
export function CoverPicker({
  spaceId,
  value,
  onChange,
}: {
  spaceId: string;
  value: string | null;
  onChange: (assetId: string | null) => void;
}) {
  const assets = useResource(
    useCallback((s: AbortSignal) => assetApi.list(spaceId, s), [spaceId]),
  );
  const [uploaded, setUploaded] = useState<Asset[]>([]);
  const images = [...(assets.data ?? []), ...uploaded].filter(
    (a) => a.imageUrl,
  );
  return (
    <div className="cover-picker">
      <ResourceState
        loading={assets.loading}
        error={assets.error}
        retry={assets.reload}
      />
      <label>
        Cover
        <Select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">Typographic cover</option>
          {images.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </label>
      {value ? (
        <img
          className="cover-preview"
          src={libraryApi.cover(value)}
          alt="Selected cover"
        />
      ) : null}
      <details className="cover-upload">
        <summary>Upload new cover artwork</summary>
        <AssetUploader
          worldId={spaceId}
          onUploaded={(asset) => {
            setUploaded((items) => [...items, asset]);
            onChange(asset.id);
          }}
        />
      </details>
    </div>
  );
}

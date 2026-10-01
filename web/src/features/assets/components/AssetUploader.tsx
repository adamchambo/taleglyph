import { useState, type KeyboardEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { assetApi } from "../api/assetApi";
import type { Asset } from "../types";
export function AssetUploader({
  worldId,
  onUploaded,
  showLegend = true,
}: {
  worldId: string;
  onUploaded: (asset: Asset) => void;
  showLegend?: boolean;
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inputKey, setInputKey] = useState(0);
  async function submit() {
    if (!file || !name.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const asset = await assetApi.upload(worldId, name, file);
      onUploaded(asset);
      setName("");
      setFile(null);
      setInputKey((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Enter" || !(e.target instanceof HTMLInputElement)) return;
    e.preventDefault();
    void submit();
  }
  return (
    <div className="asset-upload" onKeyDown={onKeyDown}>
      <fieldset disabled={busy}>
        {showLegend ? <legend>Import artwork</legend> : null}
        <label>
          Asset name
          <input
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Image file
          <input
            key={inputKey}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <small>PNG, JPEG or WebP · up to 8 MB</small>
        <Button type="button" disabled={!file || !name.trim()} onClick={() => void submit()}>
          {busy ? "Uploading…" : "Upload asset"}
        </Button>
      </fieldset>
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

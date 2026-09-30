import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { assetApi } from "../api/assetApi";
import type { Asset } from "../types";
export function AssetUploader({
  worldId,
  onUploaded,
}: {
  worldId: string;
  onUploaded: (asset: Asset) => void;
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [inputKey, setInputKey] = useState(0);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
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
  return (
    <form className="asset-upload" onSubmit={submit}>
      <fieldset disabled={busy}>
        <legend>Import artwork</legend>
        <label>
          Asset name
          <input
            required
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
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <small>PNG, JPEG or WebP · up to 8 MB</small>
        <Button type="submit" disabled={!file || !name.trim()}>
          {busy ? "Uploading…" : "Upload asset"}
        </Button>
      </fieldset>
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
    </form>
  );
}

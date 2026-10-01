import { useCallback } from "react";
import { WorldScope } from "../../../components/ui/WorldScope";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useResource } from "../../../hooks/useResource";
import { assetApi } from "../api/assetApi";
import { AssetUploader } from "../components/AssetUploader";
function Library({ worldId }: { worldId: string }) {
  const assets = useResource(
    useCallback((s: AbortSignal) => assetApi.list(worldId, s), [worldId]),
  );
  return (
    <>
      <ResourceState
        loading={assets.loading}
        error={assets.error}
        retry={assets.reload}
      />
      <div className="asset-grid">
        {assets.data?.map((a) => (
          <article className="card" key={a.id}>
            {a.imageUrl ? <img src={assetApi.image(a)} alt={a.name} /> : null}
            <h3>{a.name}</h3>
          </article>
        ))}
      </div>
      {assets.data?.length === 0 ? (
        <p>No artwork yet. Import a character, background or finished frame.</p>
      ) : null}
      <AssetUploader worldId={worldId} onUploaded={assets.reload} />
    </>
  );
}
export function AssetLibraryPage() {
  return (
    <section>
      <p className="eyebrow">A world of reusable pieces</p>
      <h1>Asset library</h1>
      <p className="intro">
        Bring your artwork in, then reuse it across panels and templates.
      </p>
      <WorldScope>{(id) => <Library key={id} worldId={id} />}</WorldScope>
    </section>
  );
}

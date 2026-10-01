import { useCallback } from "react";
import { useWorkspace } from "../../../app/workspaceContext";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/Icon";
import { WorldScope } from "../../../components/ui/WorldScope";
import { ResourceState } from "../../../components/ui/ResourceState";
import { useOpenWhenEmpty } from "../../../hooks/useOpenWhenEmpty";
import { useResource } from "../../../hooks/useResource";
import { assetApi } from "../api/assetApi";
import { AssetUploader } from "../components/AssetUploader";
function Library({ worldId }: { worldId: string }) {
  const { space } = useWorkspace();
  const assets = useResource(
    useCallback((s: AbortSignal) => assetApi.list(worldId, s), [worldId]),
  );
  const empty = assets.data ? assets.data.length === 0 : undefined;
  const [open, toggle] = useOpenWhenEmpty(empty);
  return (
    <>
      <div className="library-heading">
        <div>
          <p className="eyebrow">
            {space?.name ?? "A world of reusable pieces"}
          </p>
          <h1>Asset library</h1>
          <p className="intro">
            Bring your artwork in, then reuse it across panels and templates.
          </p>
        </div>
        <Button
          className="primary-create"
          aria-expanded={open}
          aria-controls="asset-create"
          onClick={toggle}
        >
          <Icon name="plus" size={18} />
          Import artwork
        </Button>
      </div>
      {open ? (
        <div className="create-panel" id="asset-create">
          <AssetUploader
            worldId={worldId}
            showLegend={false}
            onUploaded={assets.reload}
          />
        </div>
      ) : null}
      <ResourceState
        loading={assets.loading}
        error={assets.error}
        retry={assets.reload}
      />
      {empty ? (
        <p>No artwork yet. Import a character, background or finished frame.</p>
      ) : null}
      <div className="asset-grid">
        {assets.data?.map((a) => (
          <article className="card" key={a.id}>
            {a.imageUrl ? <img src={assetApi.image(a)} alt={a.name} /> : null}
            <h3>{a.name}</h3>
          </article>
        ))}
      </div>
    </>
  );
}
export function AssetLibraryPage() {
  return (
    <section className="library-page">
      <WorldScope>{(id) => <Library key={id} worldId={id} />}</WorldScope>
    </section>
  );
}

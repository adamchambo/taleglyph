import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { ResourceState } from "../../../components/ui/ResourceState";
import { TitleForm } from "../../../components/ui/TitleForm";
import { useResource } from "../../../hooks/useResource";
import { spaceApi } from "../api/spaceApi";
import { describeLink } from "../links";
import { SpaceRequired } from "../components/SpaceRequired";
import { StoryArtwork } from "../components/StoryArtwork";
import { useStoryGraph } from "../hooks/useStoryGraph";
import { workPath, type WorkCard, type WorkKind } from "../types";
function WorkGrid({
  works,
  coverage,
}: {
  works: WorkCard[];
  coverage: (work: WorkCard) => string;
}) {
  return (
    <div className="story-grid">
      {works.map((work, i) => (
        <Link className="story-tile" key={work.id} to={workPath(work)}>
          <StoryArtwork
            key={work.coverAssetId}
            assetId={work.coverAssetId}
            title={work.title}
            variant={i}
          />
          <div className="story-tile-body">
            <div className="tile-kicker">
              <span>{work.kind === "novel" ? "Novel" : "Comic"}</span>
            </div>
            <h2>{work.title}</h2>
            <p>{coverage(work)}</p>
            <div className="tile-footer">
              <span>
                {work.partCount}{" "}
                {work.kind === "novel"
                  ? work.partCount === 1
                    ? "chapter"
                    : "chapters"
                  : work.partCount === 1
                    ? "page"
                    : "pages"}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
export function WorksPage() {
  const { spaceId = "" } = useParams();
  const { library } = useWorkspace();
  const navigate = useNavigate();
  const works = useResource(
    useCallback((s: AbortSignal) => spaceApi.works(spaceId, s), [spaceId]),
  );
  const graph = useStoryGraph(spaceId);
  const stories = library?.stories.filter((s) => s.spaceId === spaceId) ?? [];
  function coverage(work: WorkCard) {
    const own =
      graph.data?.links.filter(
        (l) => l.fromKind === work.kind && l.fromId === work.id,
      ) ?? [];
    return own.length
      ? `Tells ${own.map((l) => describeLink(l, stories, graph.data!.arcs)).join(", ")}`
      : "Not linked to a story yet.";
  }
  async function create(kind: WorkKind, title: string) {
    const work = await spaceApi.createWork(spaceId, kind, title);
    navigate(workPath(work));
  }
  return (
    <section className="library-page">
      <SpaceRequired>
        {(space) => (
          <>
            <p className="eyebrow">{space.name}</p>
            <h1>Novels & comics</h1>
            <p className="intro">
              Each book or comic can tell one story, several, or just part of an
              arc. Link them from their own page.
            </p>
            <ResourceState
              loading={works.loading}
              error={works.error || graph.error}
              retry={() => {
                works.reload();
                graph.reload();
              }}
            />
            {works.data ? (
              <>
                <h2>Novels</h2>
                {works.data.novels.length ? (
                  <WorkGrid works={works.data.novels} coverage={coverage} />
                ) : (
                  <p className="muted">No novels yet.</p>
                )}
                <TitleForm
                  label="Novel title"
                  action="Add novel"
                  onCreate={(title) => create("novel", title)}
                />
                <h2>Comics</h2>
                {works.data.comics.length ? (
                  <WorkGrid works={works.data.comics} coverage={coverage} />
                ) : (
                  <p className="muted">No comics yet.</p>
                )}
                <TitleForm
                  label="Comic title"
                  action="Create blank comic"
                  onCreate={(title) => create("comic", title)}
                />
                <p className="field-hint">
                  To adapt existing writing, open a chapter and choose “Adapt to
                  comic”.
                </p>
              </>
            ) : null}
          </>
        )}
      </SpaceRequired>
    </section>
  );
}

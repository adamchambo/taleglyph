import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { Button } from "../../../components/ui/Button";
import { Icon } from "../../../components/ui/Icon";
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
              <span>{work.kind === "novel" ? "Novel" : "Graphic novel"}</span>
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
  const [novelOpen, setNovelOpen] = useState(false);
  const [graphicOpen, setGraphicOpen] = useState(false);
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
            <h1>Novels & graphic novels</h1>
            <p className="intro">
              Novels and graphic novels are different works. A novel is written
              in chapters. A graphic novel is drawn in pages. Either can tell
              one story, several, or just part of an arc.
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
                <section
                  className="work-shelf"
                  aria-labelledby="novels-heading"
                >
                  <div className="section-heading">
                    <h2 id="novels-heading">Novels</h2>
                    <Button
                      className="primary-create"
                      aria-expanded={novelOpen}
                      aria-controls="novel-create"
                      onClick={() => setNovelOpen((open) => !open)}
                    >
                      <Icon name="plus" size={18} />
                      New novel
                    </Button>
                  </div>
                  {novelOpen ? (
                    <div className="create-panel" id="novel-create">
                      <TitleForm
                        label="Novel title"
                        action="Add novel"
                        onCreate={async (title) => {
                          await create("novel", title);
                          setNovelOpen(false);
                        }}
                      />
                    </div>
                  ) : null}
                  {works.data.novels.length ? (
                    <WorkGrid works={works.data.novels} coverage={coverage} />
                  ) : (
                    <p className="muted">No novels yet.</p>
                  )}
                </section>
                <section
                  className="work-shelf"
                  aria-labelledby="graphic-novels-heading"
                >
                  <div className="section-heading">
                    <h2 id="graphic-novels-heading">Graphic novels</h2>
                    <Button
                      className="primary-create"
                      aria-expanded={graphicOpen}
                      aria-controls="graphic-create"
                      onClick={() => setGraphicOpen((open) => !open)}
                    >
                      <Icon name="plus" size={18} />
                      New graphic novel
                    </Button>
                  </div>
                  {graphicOpen ? (
                    <div className="create-panel" id="graphic-create">
                      <TitleForm
                        label="Graphic novel title"
                        action="Add graphic novel"
                        onCreate={async (title) => {
                          await create("comic", title);
                          setGraphicOpen(false);
                        }}
                      />
                    </div>
                  ) : null}
                  {works.data.comics.length ? (
                    <WorkGrid works={works.data.comics} coverage={coverage} />
                  ) : (
                    <p className="muted">No graphic novels yet.</p>
                  )}
                  <p className="field-hint">
                    To adapt existing writing, open a chapter and choose “Adapt
                    to comic”.
                  </p>
                </section>
              </>
            ) : null}
          </>
        )}
      </SpaceRequired>
    </section>
  );
}

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

const copy: Record<
  WorkKind,
  { title: string; intro: string; action: string; empty: string }
> = {
  novel: {
    title: "Novels",
    intro:
      "Written in chapters. A novel can tell one story, several, or part of an arc.",
    action: "New novel",
    empty: "No novels yet.",
  },
  comic: {
    title: "Graphic novels",
    intro:
      "Drawn in pages. A graphic novel can tell one story, several, or part of an arc.",
    action: "New graphic novel",
    empty: "No graphic novels yet.",
  },
};

export function WorksPage({ kind }: { kind: WorkKind }) {
  const { spaceId = "" } = useParams();
  const { library } = useWorkspace();
  const navigate = useNavigate();
  const works = useResource(
    useCallback((s: AbortSignal) => spaceApi.works(spaceId, s), [spaceId]),
  );
  const graph = useStoryGraph(spaceId);
  const stories = library?.stories.filter((s) => s.spaceId === spaceId) ?? [];
  const [open, setOpen] = useState(false);
  const text = copy[kind];
  function coverage(work: WorkCard) {
    const own =
      graph.data?.links.filter(
        (l) => l.fromKind === work.kind && l.fromId === work.id,
      ) ?? [];
    return own.length
      ? `Tells ${own.map((l) => describeLink(l, stories, graph.data!.arcs)).join(", ")}`
      : "Not linked to a story yet.";
  }
  const items = works.data
    ? kind === "novel"
      ? works.data.novels
      : works.data.comics
    : [];
  return (
    <section className="library-page">
      <SpaceRequired>
        {(space) => (
          <>
            <div className="library-heading">
              <div>
                <p className="eyebrow">{space.name}</p>
                <h1>{text.title}</h1>
                <p className="intro">{text.intro}</p>
              </div>
              <Button
                className="primary-create"
                aria-expanded={open}
                aria-controls="work-create"
                onClick={() => setOpen((value) => !value)}
              >
                <Icon name="plus" size={18} />
                {text.action}
              </Button>
            </div>
            <ResourceState
              loading={works.loading}
              error={works.error || graph.error}
              retry={() => {
                works.reload();
                graph.reload();
              }}
            />
            {open ? (
              <div className="create-panel" id="work-create">
                <TitleForm
                  label={
                    kind === "novel" ? "Novel title" : "Graphic novel title"
                  }
                  action={kind === "novel" ? "Add novel" : "Add graphic novel"}
                  onCreate={async (title) => {
                    const work = await spaceApi.createWork(
                      spaceId,
                      kind,
                      title,
                    );
                    setOpen(false);
                    navigate(workPath(work));
                  }}
                />
              </div>
            ) : null}
            {works.data ? (
              items.length ? (
                <WorkGrid works={items} coverage={coverage} />
              ) : (
                <p className="muted">{text.empty}</p>
              )
            ) : null}
            {kind === "comic" ? (
              <p className="field-hint">
                To adapt existing writing, open a chapter and choose “Adapt to
                comic”.
              </p>
            ) : null}
          </>
        )}
      </SpaceRequired>
    </section>
  );
}

import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "../../../app/workspaceContext";
import { ResourceState } from "../../../components/ui/ResourceState";
import { TitleForm } from "../../../components/ui/TitleForm";
import { Icon } from "../../../components/ui/Icon";
import { WorldDetailPage } from "../../world/pages/WorldDetailPage";
import { AssetLibraryPage } from "../../assets/pages/AssetLibraryPage";
import { StoryDetailPage } from "../../stories/pages/StoryDetailPage";
import { useResource } from "../../../hooks/useResource";
import { comicApi } from "../../comics/api/comicApi";
import { libraryApi } from "../api/libraryApi";
import { sections, type Section } from "../types";
function StoryComics() {
  const { story, refresh } = useWorkspace();
  const navigate = useNavigate();
  const id = story!.id;
  const comics = useResource(
    useCallback((s: AbortSignal) => comicApi.list(id, s), [id]),
  );
  return (
    <section>
      <p className="eyebrow">{story!.title}</p>
      <h1>Comic studio</h1>
      <p className="intro">
        Start with a blank page, or adapt a scene from your novel.
      </p>
      <ResourceState
        loading={comics.loading}
        error={comics.error}
        retry={comics.reload}
      />
      <div className="cards">
        {comics.data?.map((c) => (
          <Link className="card comic-entry" key={c.id} to={`/comics/${c.id}`}>
            <Icon name="comic" size={30} />
            <h2>{c.title}</h2>
            <span>
              Open comic <Icon name="arrow" size={16} />
            </span>
          </Link>
        ))}
      </div>
      <TitleForm
        label="Comic title"
        action="Create blank comic"
        onCreate={async (title) => {
          const comic = await libraryApi.createComic(id, title);
          void refresh();
          navigate(`/comics/${comic.id}`);
        }}
      />
      <Link to={`/stories/${id}/novel`}>
        Open novel to adapt existing scenes →
      </Link>
    </section>
  );
}
export function StorySectionPage({ section }: { section: Section }) {
  const { story, loading, error, refresh } = useWorkspace();
  if (!story)
    return (
      <ResourceState
        loading={loading}
        error={error || (!loading ? "Story not found." : "")}
        retry={refresh}
      />
    );
  if (section === "novel") return <StoryDetailPage />;
  if (section === "comic") return <StoryComics />;
  if (section === "assets") return <AssetLibraryPage />;
  if (section === "characters")
    return <WorldDetailPage scopedWorldId={story.spaceId} charactersOnly />;
  if (section === "world")
    return (
      <section>
        <p className="eyebrow">Shared across this space</p>
        <h1>{story.spaceName}</h1>
        <p className="intro">
          The setting behind your story, shared with every story in this space.
        </p>
        <div className="card">
          <h2>World overview</h2>
          <p>
            {/* Existing world detail remains accessible during the shell checkpoint. */}
            Characters and assets already live here. Regions, lore, maps and
            location pins are planned for the next workspace checkpoint.
          </p>
          <Link to={`/worlds/${story.spaceId}?story=${story.id}`}>
            Open existing world information →
          </Link>
        </div>
      </section>
    );
  const info = sections.find((s) => s.id === section)!;
  return (
    <section className="planned-workspace">
      <span className="section-icon">
        <Icon name={section} size={32} />
      </span>
      <p className="eyebrow">{story.title}</p>
      <h1>{info.label}</h1>
      <p className="intro">{info.description}</p>
      <div className="card">
        <h2>Your space is ready. The tools are coming next.</h2>
        <p>
          {section === "plan"
            ? "Storylines, arcs, beats and a timeline will connect your writing and comics here."
            : "Pinned notes, quick thoughts and story tasks will live here."}
        </p>
        <p className="muted">This section is planned and not editable yet.</p>
      </div>
    </section>
  );
}

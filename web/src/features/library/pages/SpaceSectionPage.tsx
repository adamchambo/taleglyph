import { Link } from "react-router-dom";
import { Icon } from "../../../components/ui/Icon";
import { WorldDetailPage } from "../../world/pages/WorldDetailPage";
import { AssetLibraryPage } from "../../assets/pages/AssetLibraryPage";
import { SpaceRequired } from "../components/SpaceRequired";
import { spaceSections } from "../types";
export function SpaceSectionPage({
  section,
}: {
  section: "world" | "characters" | "timeline" | "assets";
}) {
  return (
    <SpaceRequired>
      {(space) => {
        if (section === "assets") return <AssetLibraryPage />;
        if (section === "characters")
          return <WorldDetailPage scopedWorldId={space.id} charactersOnly />;
        if (section === "world")
          return (
            <section>
              <p className="eyebrow">Shared by every story here</p>
              <h1>{space.name}</h1>
              <p className="intro">
                The setting behind every story in this space.
              </p>
              <div className="card">
                <h2>World overview</h2>
                <p>
                  Characters and assets already live here. Regions, lore, maps
                  and location pins are planned for a later checkpoint.
                </p>
                <Link to={`/worlds/${space.id}`}>
                  Open existing world information →
                </Link>
              </div>
            </section>
          );
        const info = spaceSections.find((s) => s.id === section)!;
        return (
          <section className="planned-workspace">
            <span className="section-icon">
              <Icon name={info.icon} size={32} />
            </span>
            <p className="eyebrow">{space.name}</p>
            <h1>{info.label}</h1>
            <p className="intro">{info.description}</p>
            <div className="card">
              <h2>Coming next.</h2>
              <p>
                One timeline for the whole space, so events from every story and
                arc sit in the same order.
              </p>
              <p className="muted">
                This section is planned and not editable yet.
              </p>
            </div>
          </section>
        );
      }}
    </SpaceRequired>
  );
}

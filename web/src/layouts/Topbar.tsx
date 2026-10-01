import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWorkspace } from "../app/workspaceContext";
import { Icon } from "../components/ui/Icon";
export function Topbar() {
  const { story, library, nav, setNav } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const hasPreviousPage = (window.history.state?.idx ?? 0) > 0;
  const fallback = story ? `/stories/${story.id}` : "/library";
  const canGoBack = hasPreviousPage || location.pathname !== fallback;
  return (
    <header className="studio-topbar">
      <nav className="page-navigation" aria-label="Page navigation">
        <button
          className="icon-button"
          aria-label="Go back"
          title="Go back"
          disabled={!canGoBack}
          onClick={() => (hasPreviousPage ? navigate(-1) : navigate(fallback))}
        >
          <span className="back-arrow">
            <Icon name="arrow" />
          </span>
        </button>
        <Link
          className="icon-button"
          to="/library"
          aria-label="Go to library"
          title="Library"
        >
          <Icon name="library" />
        </Link>
      </nav>
      <div className="context-breadcrumb">
        {story ? (
          <>
            <span className="space-crumb" title={story.spaceName}>
              {story.spaceName}
            </span>
            <span className="crumb-divider">/</span>
            <label className="sr-only" htmlFor="active-story">
              Switch story
            </label>
            <select
              id="active-story"
              value={story.id}
              onChange={(e) => navigate(`/stories/${e.target.value}`)}
            >
              {library?.stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </>
        ) : (
          <span>
            {location.pathname === "/appearance"
              ? "Appearance"
              : "Creative studio"}
          </span>
        )}
      </div>
      <div className="topbar-actions">
        <button
          className="icon-button"
          title={nav === "focus" ? "Exit focus mode" : "Focus mode"}
          aria-label={nav === "focus" ? "Exit focus mode" : "Focus mode"}
          onClick={() => setNav(nav === "focus" ? "rail" : "focus")}
        >
          <Icon name="focus" />
        </button>
        <Link
          className="icon-button"
          aria-label="Appearance settings"
          to={`/appearance${story ? `?story=${story.id}` : ""}`}
        >
          <Icon name="settings" />
        </Link>
        <span className="profile-dot" aria-hidden="true">
          ✦
        </span>
      </div>
    </header>
  );
}

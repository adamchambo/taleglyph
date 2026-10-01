import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useWorkspace } from "../app/workspaceContext";
import { spaceSections, spacePath } from "../features/library/types";
import { Icon } from "../components/ui/Icon";
export function Sidebar() {
  const { space, nav, setNav } = useWorkspace();
  const [hovered, setHovered] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const open = hovered || keyboardFocus || nav === "expanded";
  return (
    <aside
      className={`studio-sidebar ${open ? "is-open" : ""}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        setHovered(false);
        setNav("rail");
      }}
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) setKeyboardFocus(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setKeyboardFocus(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setHovered(false);
          setKeyboardFocus(false);
          setNav("rail");
        }
      }}
    >
      <button
        className="sidebar-toggle icon-button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="sidebar-navigation"
        onClick={() => {
          setHovered(false);
          setKeyboardFocus(false);
          setNav(open ? "rail" : "expanded");
        }}
      >
        <Icon name="menu" />
      </button>
      <Link
        className="studio-brand"
        to="/library"
        aria-label="Talechemy library"
      >
        <span className="brand-mark">
          <Icon name="spark" size={23} />
        </span>
        <span className="nav-label">
          talechemy<span className="brand-dot">.</span>
        </span>
      </Link>
      <nav id="sidebar-navigation" aria-label="Main navigation">
        <NavLink to="/library" title="Library" aria-label="Library">
          <Icon name="library" />
          <span className="nav-label">Library</span>
        </NavLink>
        {space ? (
          <>
            <p className="nav-section nav-label">YOUR SPACE</p>
            {spaceSections.map((s) => (
              <NavLink
                key={s.id}
                to={spacePath(space.id, s.id)}
                end={s.id === "overview"}
                title={s.label}
                aria-label={s.label}
              >
                <Icon name={s.icon} />
                <span className="nav-label">{s.label}</span>
              </NavLink>
            ))}
          </>
        ) : (
          <div className="sidebar-invitation nav-label">
            <p>A place for every story in your universe.</p>
            <Link to="/spaces/new">
              Begin a space <Icon name="arrow" size={15} />
            </Link>
          </div>
        )}
      </nav>
      <div className="sidebar-footer">
        <Link
          to={`/appearance${space ? `?space=${space.id}` : ""}`}
          title="Appearance"
          aria-label="Appearance"
        >
          <Icon name="settings" />
          <span className="nav-label">Appearance</span>
        </Link>
        <span className="nav-label footnote">Your story. Every form.</span>
      </div>
    </aside>
  );
}

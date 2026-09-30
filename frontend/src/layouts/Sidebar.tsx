import { NavLink } from "react-router-dom";
const links = [
  ["/worlds", "World index"],
  ["/stories", "Manuscripts"],
  ["/comics", "Comic studio"],
  ["/assets", "Assets"],
  ["/explore", "Explore"],
  ["/notes", "Notes"],
];
export function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="/">
        ✧ Talechemy
      </a>
      <p className="sidebar-caption">Your story, in every form.</p>
      <nav aria-label="Main navigation">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to}>
            {label}
          </NavLink>
        ))}
      </nav>
      <small>
        Application foundation
        <br />
        Working name
      </small>
    </aside>
  );
}

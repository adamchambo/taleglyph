import { Outlet } from "react-router-dom";
import { WorkspaceProvider } from "../app/WorkspaceProvider";
import { useWorkspace } from "../app/workspaceContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
function Frame() {
  const { nav, setNav } = useWorkspace();
  return (
    <div className={`studio-shell nav-${nav}`}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {nav !== "focus" ? <Sidebar /> : null}
      {nav === "expanded" ? (
        <button
          className="nav-scrim"
          aria-label="Dismiss navigation"
          onClick={() => setNav("rail")}
        />
      ) : null}
      <div className="studio-body">
        <Topbar />
        <main id="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export function WorkspaceLayout() {
  return (
    <WorkspaceProvider>
      <Frame />
    </WorkspaceProvider>
  );
}

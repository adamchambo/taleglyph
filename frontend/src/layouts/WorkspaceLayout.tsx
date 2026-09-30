import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
export function WorkspaceLayout() {
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Sidebar />
      <div className="workspace-body">
        <Topbar />
        <main id="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

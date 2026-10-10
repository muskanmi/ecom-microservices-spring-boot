import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#FFFCF4] text-[#2D3A3A]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 px-8 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

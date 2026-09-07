import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout() {
  const [colapsado, setColapsado] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#eef1f7]">
      <Sidebar colapsado={colapsado} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar colapsado={colapsado} onAlternarSidebar={() => setColapsado((v) => !v)} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

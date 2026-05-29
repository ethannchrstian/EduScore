import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-gray-50 relative shadow-xl">
      {/* Main Content Area - padded at the bottom so content isn't hidden behind the Nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}

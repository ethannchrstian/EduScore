import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppShell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-zinc-50 relative">
      <main className="flex-1 overflow-y-auto pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import BottomNav from "./BottomNav";
import QuickAddTaskModal from "../../../features/tasks/components/QuickAddTaskModal";
import { TourProvider } from "../../../features/onboarding/components/TourProvider";

export default function AppShell() {
  const { pathname } = useLocation();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // These pages have their own context-aware FABs — hide the global one there
  const hideGlobalFab = /^\/courses/.test(pathname) || pathname === "/tracker";

  return (
    <TourProvider>
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-zinc-50 relative">
        <main className="flex-1 overflow-y-auto pb-28">
          <Outlet />
        </main>
        <BottomNav />

        {!hideGlobalFab && (
          <button
            data-tour="fab"
            onClick={() => setQuickAddOpen(true)}
            className="fixed bottom-[5.5rem] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 transition-all duration-200 hover:scale-105 hover:bg-indigo-700 active:scale-95"
            aria-label="Quick add task"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        )}

        <QuickAddTaskModal
          open={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
        />
      </div>
    </TourProvider>
  );
}

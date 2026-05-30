import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, Clock, User } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard },
  { to: "/courses", icon: BookOpen },
  { to: "/tracker", icon: Clock },
  { to: "/profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 z-30 w-full max-w-md px-4 pb-4">
      <div className="flex h-16 items-center justify-around rounded-2xl border border-zinc-200/60 bg-white/90 px-3 shadow-xl shadow-zinc-900/10 backdrop-blur-xl">
        {navItems.map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `relative flex h-11 w-14 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-indigo-600"
                  : "text-zinc-400 hover:text-zinc-600"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-indigo-50" />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="relative z-10"
                />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

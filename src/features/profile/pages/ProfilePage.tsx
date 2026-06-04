import { useState, useMemo } from "react";
import { LogOut, Mail, BookOpen, CheckCircle2, Clock, ListTodo, Compass, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useDashboardData } from "../../dashboard/hooks/useDashboardData";
import { signOut } from "../../auth/services/authService";
import { useToast } from "../../../shared/context/ToastContext";
import { formatDuration } from "../../../shared/utils/date";
import { useTour } from "../../onboarding/components/TourProvider";
import Button from "../../../shared/components/ui/Button";

export default function ProfilePage() {
  const { user } = useAuthContext();
  const { data } = useDashboardData();
  const { startTour } = useTour();
  const toast = useToast();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ?? "Student";
  const email = user?.email ?? "";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await signOut();
    if (error) {
      toast("Failed to sign out", "error");
      setSigningOut(false);
    } else navigate("/login", { replace: true });
  }

  const totalStudyMins = useMemo(
    () => (data?.studyLogs ?? []).reduce((sum, log) => sum + log.duration_mins, 0),
    [data?.studyLogs],
  );
  const pendingTasks = (data?.totalTasks ?? 0) - (data?.completedTasks ?? 0);

  const stats = [
    {
      icon: <BookOpen size={16} strokeWidth={1.5} />,
      value: data?.totalCourses ?? "—",
      label: "Courses",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      icon: <CheckCircle2 size={16} strokeWidth={1.5} />,
      value: data?.completedTasks ?? "—",
      label: "Done",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: <ListTodo size={16} strokeWidth={1.5} />,
      value: data ? pendingTasks : "—",
      label: "Pending",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      icon: <Clock size={16} strokeWidth={1.5} />,
      value: data ? formatDuration(totalStudyMins) : "—",
      label: "Study time",
      color: "text-violet-500",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300">
      <div className="px-5 pt-10 pb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Account
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">
          Profile
        </h1>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-8">
        {/* Identity card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 p-6 text-white shadow-lg shadow-indigo-200">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white text-lg font-bold backdrop-blur-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold tracking-tight truncate">
                {fullName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-indigo-200 text-xs">
                <Mail size={11} />
                <span className="truncate">{email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
            Stats
          </p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon, value, label, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl bg-white border border-zinc-100 px-4 py-4 hover:border-indigo-100 transition-colors"
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
                >
                  {icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xl font-bold tracking-tight text-zinc-900 leading-none">
                    {value}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 mt-0.5">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* App tour */}
        <button
          onClick={startTour}
          className="flex items-center gap-3 rounded-2xl bg-white border border-zinc-100 px-4 py-4 text-left hover:border-indigo-100 transition-colors"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
            <Compass size={16} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-zinc-900">App tour</span>
            <span className="text-xs text-zinc-400">Replay the quick walkthrough</span>
          </div>
          <ChevronRight size={16} className="ml-auto flex-shrink-0 text-zinc-300" />
        </button>

        <Button
          variant="danger"
          size="lg"
          className="w-full"
          loading={signingOut}
          onClick={handleSignOut}
        >
          <LogOut size={15} /> Sign out
        </Button>
      </div>
    </div>
  );
}

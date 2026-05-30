import { useState, useMemo } from "react";
import { LogOut, Mail, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useDashboardData } from "../../dashboard/hooks/useDashboardData";
import { signOut } from "../../auth/services/authService";
import { useToast } from "../../../shared/context/ToastContext";
import { formatDuration } from "../../../shared/utils/date";
import Button from "../../../shared/components/ui/Button";

export default function ProfilePage() {
  const { user } = useAuthContext();
  const { data } = useDashboardData();
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

  const studyLogs = data?.studyLogs;
  const todayStudyMins = useMemo(() => {
    if (!studyLogs) return 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return studyLogs
      .filter((log) => {
        const d = new Date(log.study_date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === now.getTime();
      })
      .reduce((sum, log) => sum + log.duration_mins, 0);
  }, [studyLogs]);

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
      icon: <Clock size={16} strokeWidth={1.5} />,
      value: data ? formatDuration(todayStudyMins) : "—",
      label: "Today",
      color: "text-amber-500",
      bg: "bg-amber-50",
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
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ icon, value, label, color, bg }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-zinc-100 py-4 hover:border-indigo-100 transition-colors"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${bg} ${color}`}
                >
                  {icon}
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900">
                  {value}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-3">
            Details
          </p>
          <div className="rounded-2xl bg-white border border-zinc-100 divide-y divide-zinc-50">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-xs text-zinc-400">Full name</span>
              <span className="text-sm font-medium text-zinc-900">
                {fullName}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-xs text-zinc-400">Email</span>
              <span className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">
                {email}
              </span>
            </div>
          </div>
        </div>

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

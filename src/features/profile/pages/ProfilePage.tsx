import { useState, useMemo } from "react";
import {
  LogOut,
  Mail,
  BookOpen,
  CheckCircle2,
  Clock,
  ListTodo,
  Compass,
  ChevronRight,
  CalendarDays,
  Flame,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useDashboardData } from "../../dashboard/hooks/useDashboardData";
import { signOut, updateDisplayName } from "../../auth/services/authService";
import { useToast } from "../../../shared/context/ToastContext";
import { formatDuration } from "../../../shared/utils/date";
import { useTour } from "../../onboarding/components/TourProvider";
import Button from "../../../shared/components/ui/Button";

// Local calendar date as YYYY-MM-DD (so it lines up with stored study_date labels).
function localDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Consecutive days (ending today or yesterday) that have at least one study log.
// Counting up to yesterday means the streak doesn't reset just because today
// hasn't been logged yet.
function computeStreak(dates: string[]): number {
  const logged = new Set(dates.map((d) => d.slice(0, 10)));
  if (logged.size === 0) return 0;

  const cursor = new Date();
  if (!logged.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!logged.has(localDateKey(cursor))) return 0;
  }

  let streak = 0;
  while (logged.has(localDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

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

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  // --- Display-name editing ---
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(fullName);
  const [savingName, setSavingName] = useState(false);

  function startEditName() {
    setNameDraft(fullName);
    setEditingName(true);
  }

  async function saveName() {
    const next = nameDraft.trim();
    if (!next) {
      toast("Name can't be empty", "error");
      return;
    }
    if (next === fullName) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    const { error } = await updateDisplayName(next);
    setSavingName(false);
    if (error) {
      toast("Failed to update name", "error");
    } else {
      toast("Name updated", "success");
      setEditingName(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await signOut();
    if (error) {
      toast("Failed to sign out", "error");
      setSigningOut(false);
    } else navigate("/login", { replace: true });
  }

  const totalStudyMins = useMemo(
    () =>
      (data?.studyLogs ?? []).reduce((sum, log) => sum + log.duration_mins, 0),
    [data?.studyLogs],
  );
  const streak = useMemo(
    () => computeStreak((data?.studyLogs ?? []).map((l) => l.study_date)),
    [data?.studyLogs],
  );
  const pendingTasks = (data?.totalTasks ?? 0) - (data?.completedTasks ?? 0);

  const stats = [
    {
      icon: <BookOpen size={16} strokeWidth={1.75} />,
      value: data?.totalCourses ?? "·",
      label: "Courses",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: <CheckCircle2 size={16} strokeWidth={1.75} />,
      value: data?.completedTasks ?? "·",
      label: "Done",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: <ListTodo size={16} strokeWidth={1.75} />,
      value: data ? pendingTasks : "·",
      label: "Pending",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: <Clock size={16} strokeWidth={1.75} />,
      value: data ? formatDuration(totalStudyMins) : "·",
      label: "Study time",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Subtle brand wash behind the header — ties profile to the auth screens */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-20%] h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-[-15%] h-56 w-56 rounded-full bg-violet-300/25 blur-3xl"
      />

      <div className="relative px-5 pt-10 pb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
          Account
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-indigo-950">
          Profile
        </h1>
      </div>

      <div className="relative flex flex-col gap-5 px-5 pb-8">
        {/* Identity */}
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white shadow-md shadow-indigo-200">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  disabled={savingName}
                  maxLength={60}
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-indigo-950 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={saveName}
                  disabled={savingName}
                  aria-label="Save name"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Check size={15} />
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  disabled={savingName}
                  aria-label="Cancel"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <p className="truncate text-lg font-bold tracking-tight text-indigo-950">
                  {fullName}
                </p>
                <button
                  onClick={startEditName}
                  aria-label="Edit name"
                  className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                >
                  <Pencil size={12} />
                </button>
              </div>
            )}
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Mail size={12} className="flex-shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            {memberSince && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays size={12} className="flex-shrink-0" />
                <span>Member since {memberSince}</span>
              </div>
            )}
          </div>
        </div>

        {/* Study streak */}
        <div className="flex items-center gap-4 rounded-3xl border border-amber-100 bg-amber-50/60 p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Flame
              size={22}
              strokeWidth={1.75}
              data-flame={streak > 0 ? "" : undefined}
              style={
                streak > 0
                  ? {
                      transformOrigin: "bottom center",
                      animation:
                        "flame-ignite 0.5s ease-out, flame-flicker 2.8s ease-in-out 0.5s infinite",
                    }
                  : undefined
              }
            />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold leading-none tracking-tight text-indigo-950">
              {streak} {streak === 1 ? "day" : "days"}
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              {streak > 0
                ? "Current study streak. Keep it going!"
                : "No active streak yet. Log a session to start one."}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">
            At a glance
          </p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon, value, label, color, bg }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 transition-colors hover:border-indigo-200"
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
                >
                  {icon}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-xl font-bold leading-none tracking-tight text-indigo-950">
                    {value}
                  </span>
                  <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-400">
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
          className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 text-left transition-colors hover:border-indigo-200"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Compass size={16} strokeWidth={1.75} />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold text-indigo-950">
              App tour
            </span>
            <span className="text-xs text-slate-400">
              Replay the quick walkthrough
            </span>
          </div>
          <ChevronRight
            size={16}
            className="ml-auto flex-shrink-0 text-slate-300"
          />
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

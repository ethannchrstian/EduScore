import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuthContext } from "../../../shared/context/AuthContext";
import {
  getCountdownLabel,
  formatDuration,
  getGreeting,
} from "../../../shared/utils/date";
import Skeleton from "../../../shared/components/ui/Skeleton";

type Filter = "today" | "7d" | "all";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 Days" },
  { key: "all", label: "All Time" },
];

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { data, loading, refresh } = useDashboardData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("today");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const firstName = fullName?.split(" ")[0] ?? "there";

  const studyLogs = data?.studyLogs;
  const studyMins = useMemo(() => {
    if (!studyLogs) return 0;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filteredLogs = studyLogs.filter((log) => {
      const logDate = new Date(log.study_date);
      logDate.setHours(0, 0, 0, 0);

      if (filter === "today") {
        return logDate.getTime() === now.getTime();
      }
      if (filter === "7d") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return logDate >= sevenDaysAgo;
      }
      return true; // "all"
    });

    return filteredLogs.reduce((acc, curr) => acc + curr.duration_mins, 0);
  }, [studyLogs, filter]);

  const studyValue = formatDuration(studyMins);

  const activeFilterLabel = FILTERS.find((f) => f.key === filter)?.label;

  return (
    <div className="flex flex-col gap-6 px-5 pt-10 pb-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            {getGreeting()}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">
            {firstName} 👋
          </h1>
        </div>
        <button
          onClick={refresh}
          className="mt-1 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Hero progress card */}
      {loading ? (
        <Skeleton className="h-36 w-full rounded-2xl" />
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 p-6 text-white shadow-lg shadow-indigo-200">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -right-2 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-indigo-200">
                  Overall Progress
                </p>
                <p className="mt-1 text-5xl font-bold tracking-tight">
                  {data?.overallProgress ?? 0}
                  <span className="text-2xl font-normal text-indigo-300">
                    %
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {data?.completedTasks ?? 0}
                </p>
                <p className="text-xs text-indigo-200">
                  of {data?.totalTasks ?? 0} tasks
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${data?.overallProgress ?? 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-indigo-200">
              {(data?.totalCourses ?? 0) > 0
                ? `Across ${data?.totalCourses} course${data!.totalCourses !== 1 ? "s" : ""}`
                : "No courses yet"}
            </p>
          </div>
        </div>
      )}

      {/* Filter selector */}
      <div className="relative flex justify-end">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-200"
        >
          {activeFilterLabel}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-xl border border-zinc-100 bg-white p-1 shadow-xl animate-in zoom-in-95 duration-150">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setFilter(key);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                    filter === key
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white border border-zinc-100 p-4 hover:border-indigo-100 transition-colors">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Study time
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              {studyValue}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {filter === "today"
                ? "today"
                : filter === "7d"
                  ? "last 7 days"
                  : "all time"}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-zinc-100 p-4 hover:border-indigo-100 transition-colors">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Courses
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              {data?.totalCourses ?? 0}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {(data?.totalTasks ?? 0) - (data?.completedTasks ?? 0)} tasks
              pending
            </p>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-zinc-900">Upcoming Tasks</p>
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            All courses <ArrowRight size={11} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (data?.urgentTasks ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2
                size={22}
                strokeWidth={1.5}
                className="text-emerald-500"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-700">
                All caught up!
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Nothing due in the next 7 days
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data!.urgentTasks.map((task, i) => {
              const { label, color, bgColor } = getCountdownLabel(task.dueDate);
              return (
                <div
                  key={task.id}
                  onClick={() => navigate(`/courses/${task.matakuliahId}`)}
                  className="flex items-center justify-between rounded-xl bg-white border border-zinc-100 px-4 py-3.5 cursor-pointer hover:border-indigo-100 hover:shadow-sm transition-all duration-200 active:scale-[0.99]"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: task.courseColor }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {task.courseName}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`ml-3 flex flex-shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${bgColor} ${color}`}
                  >
                    <CalendarClock size={11} />
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

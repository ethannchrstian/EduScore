import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  CalendarClock,
  BookOpen,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAuthContext } from "../../../shared/context/AuthContext";
import {
  getCountdownLabel,
  formatDuration,
  getGreeting,
} from "../../../shared/utils/date";
import Skeleton from "../../../shared/components/ui/Skeleton";

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
        {icon}
        {label}
      </div>
      <span className="text-2xl font-extrabold text-gray-900 leading-none">
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { data, loading, refresh } = useDashboardData();
  const navigate = useNavigate();

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const firstName = fullName?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-5 p-5 pt-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Here's your academic overview
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Overall progress */}
      {loading ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} className="text-indigo-500" />
              Overall Progress
            </h2>
            <span className="text-xl font-extrabold text-indigo-600">
              {data?.overallProgress ?? 0}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700 ease-out"
              style={{ width: `${data?.overallProgress ?? 0}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {data?.completedTasks ?? 0} of {data?.totalTasks ?? 0} tasks
            completed
            {(data?.totalCourses ?? 0) > 0 &&
              ` across ${data?.totalCourses} course${data!.totalCourses !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Clock size={13} />}
            label="Study today"
            value={formatDuration(data?.todayStudyMins ?? 0)}
            sub={data?.todayStudyMins === 0 ? "No sessions yet" : "Keep it up!"}
          />
          <StatCard
            icon={<BookOpen size={13} />}
            label="Courses"
            value={data?.totalCourses ?? 0}
            sub={`${(data?.totalTasks ?? 0) - (data?.completedTasks ?? 0)} tasks pending`}
          />
        </div>
      )}

      {/* Urgent tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
            <TrendingUp size={16} className="text-indigo-500" />
            Upcoming Tasks
          </h2>
          <button
            onClick={() => navigate("/courses")}
            className="text-xs text-indigo-500 font-medium hover:underline"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (data?.urgentTasks ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 py-10 text-center">
            <CheckCircle2 size={28} className="text-emerald-400" />
            <p className="text-sm font-semibold text-gray-700">
              All caught up!
            </p>
            <p className="text-xs text-gray-400">
              No tasks due in the next 7 days
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {data!.urgentTasks.map((task) => {
              const { label, color, bgColor } = getCountdownLabel(task.dueDate);
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                  onClick={() => navigate("/courses")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: task.courseColor }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {task.courseName}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`ml-3 flex flex-shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${bgColor} ${color}`}
                  >
                    <CalendarClock size={12} />
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

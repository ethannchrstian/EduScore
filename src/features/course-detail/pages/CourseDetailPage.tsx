import { useState, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, BookOpen, Clock, ArrowUpDown, CheckCircle2 } from "lucide-react";
import { useCourseDetail } from "../hooks/useCourseDetail";
import { useTasks } from "../../tasks/hooks/useTasks";
import { useLearningTracker } from "../../learning-tracker/hooks/useLearningTracker";
import TaskItem from "../../tasks/components/TaskItem";
import TaskFormModal from "../../tasks/components/TaskFormModal";
import TrackerEntryItem from "../../learning-tracker/components/TrackerEntryItem";
import TrackerFormModal from "../../learning-tracker/components/TrackerFormModal";
import EmptyState from "../../../shared/components/ui/EmptyState";
import Skeleton from "../../../shared/components/ui/Skeleton";
import type {
  Task,
  TaskFormData,
  TaskStatus,
  TaskPriority,
} from "../../tasks/services/taskService";
import type {
  TrackerEntry,
  TrackerFormData,
} from "../../learning-tracker/services/learningTrackerService";

const CONFETTI_COLORS = [
  "#6366f1","#8b5cf6","#22c55e","#f97316",
  "#ec4899","#eab308","#14b8a6","#ef4444","#06b6d4","#f43f5e",
];

function TaskCompleteOverlay() {
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const angle = (i / 36) * 360 + (Math.random() - 0.5) * 22;
        const dist  = 110 + Math.random() * 150;
        return {
          tx:    Math.cos((angle * Math.PI) / 180) * dist,
          ty:    Math.sin((angle * Math.PI) / 180) * dist,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          size:  8 + Math.floor(Math.random() * 9),
          delay: Math.random() * 0.1,
          dur:   0.75 + Math.random() * 0.35,
        };
      }),
    [],
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
      style={{ animation: "overlay-lifetime 2.4s ease-out forwards" }}
    >
      <div className="relative flex items-center justify-center">
        {/* Expanding glow ring */}
        <div
          className="absolute h-28 w-28 rounded-full bg-emerald-400/50"
          style={{ animation: "ring-expand 1s ease-out 0.05s both" }}
        />
        {/* Checkmark circle */}
        <div
          className="relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 shadow-2xl shadow-emerald-400/60"
          style={{ animation: "big-check-in 0.55s cubic-bezier(0.16,1,0.3,1) forwards" }}
        >
          <CheckCircle2 size={60} strokeWidth={1.75} className="text-white" />
        </div>
        {/* Confetti burst */}
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animation: `burst-out ${p.dur}s ease-out ${p.delay}s both`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

type Tab = "tasks" | "tracker";
type TaskFilter = "all" | "active" | "done";
type TaskSort = "due" | "priority" | "created";

const PRIORITY_ORDER: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function formatDuration(mins: number): string {
  if (mins === 0) return "0m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const autoNewTask =
    (location.state as { autoNewTask?: boolean } | null)?.autoNewTask === true;
  const {
    course,
    loading: courseLoading,
    refreshProgress,
  } = useCourseDetail(id!);
  const {
    tasks,
    loading: tasksLoading,
    addTask,
    editTask,
    toggleStatus,
    removeTask,
  } = useTasks(id!);
  const {
    entries,
    loading: trackerLoading,
    totalMins,
    addEntry,
    editEntry,
    removeEntry,
  } = useLearningTracker(id!);

  const [tab, setTab] = useState<Tab>("tasks");
  const tabSlideDir = useRef<"right" | "left">("right");
  function switchTab(next: Tab) {
    tabSlideDir.current = next === "tracker" ? "right" : "left";
    setTab(next);
  }
  const [taskModalOpen, setTaskModalOpen] = useState(autoNewTask);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TrackerEntry | null>(null);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("active");
  const [taskSort, setTaskSort] = useState<TaskSort>("due");
  const [sortOpen, setSortOpen] = useState(false);
  const [celebKey, setCelebKey] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const filteredSortedTasks = useMemo(() => {
    let result = [...tasks];
    if (taskFilter === "active") {
      result = result.filter((t) => t.status !== "COMPLETED");
    } else if (taskFilter === "done") {
      result = result.filter((t) => t.status === "COMPLETED");
    }
    if (taskSort === "due") {
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (taskSort === "priority") {
      result.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    }
    return result;
  }, [tasks, taskFilter, taskSort]);

  async function handleTaskSubmit(form: TaskFormData) {
    if (editingTask) await editTask(editingTask.id, form);
    else await addTask(form);
    await refreshProgress();
  }
  async function handleToggle(taskId: string, status: TaskStatus) {
    if (status !== "COMPLETED") {
      setCelebKey((k) => k + 1);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2400);
    }
    await toggleStatus(taskId, status);
    await refreshProgress();
  }
  async function handleDeleteTask(taskId: string) {
    await removeTask(taskId);
    await refreshProgress();
  }
  async function handleTrackerSubmit(form: TrackerFormData) {
    if (editingEntry) await editEntry(editingEntry.id, form);
    else await addEntry(form);
  }

  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const progress =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const accentColor = course?.color ?? "#6366f1";

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-8 pb-4">
        <button
          onClick={() => navigate("/courses")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        {courseLoading ? (
          <Skeleton className="h-5 w-40" />
        ) : (
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 truncate">
              {course?.name}
            </h1>
            <span className="text-xs text-zinc-400">
              {course?.code}
              {course?.semester ? ` · ${course.semester}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Stats cards */}
      {!courseLoading && course && (
        <div className="mx-4 mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white border border-zinc-100 p-4">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Progress
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
              {progress}
              <span className="text-lg font-normal text-zinc-400">%</span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%`, backgroundColor: accentColor }}
              />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">
              {completedCount}/{tasks.length} done
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-zinc-100 p-4">
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Study Time
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
              {formatDuration(totalMins)}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              {entries.length} session{entries.length !== 1 ? "s" : ""} logged
            </p>
          </div>
        </div>
      )}

      {/* Description */}
      {!courseLoading && course?.description && (
        <div className="mx-4 mb-4 rounded-2xl border border-zinc-100 bg-white px-4 py-3.5">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-1">
            About
          </p>
          <p className="text-sm text-zinc-600 leading-relaxed">
            {course.description}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mx-4 mb-4 flex rounded-xl bg-zinc-100 p-1">
        {(["tasks", "tracker"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${t === tab ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            {t === "tasks" ? "Tasks" : "Study Log"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <div
          key={tab}
          style={{ animation: `slide-tab-${tabSlideDir.current} 0.22s cubic-bezier(0.16,1,0.3,1) both` }}
        >
        {tab === "tasks" ? (
          tasksLoading ? (
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Filter + sort */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5">
                  {(["all", "active", "done"] as TaskFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                        taskFilter === f
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setSortOpen((o) => !o)}
                    className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-200 transition-all"
                  >
                    <ArrowUpDown size={11} />
                    {taskSort === "due"
                      ? "Due date"
                      : taskSort === "priority"
                        ? "Priority"
                        : "Newest"}
                  </button>
                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setSortOpen(false)}
                      />
                      <div className="absolute right-0 top-full z-20 mt-2 w-32 overflow-hidden rounded-xl border border-zinc-100 bg-white p-1 shadow-xl animate-in zoom-in-95 duration-150">
                        {(
                          [
                            { key: "due", label: "Due date" },
                            { key: "priority", label: "Priority" },
                            { key: "created", label: "Newest" },
                          ] as { key: TaskSort; label: string }[]
                        ).map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => {
                              setTaskSort(key);
                              setSortOpen(false);
                            }}
                            className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                              taskSort === key
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
              </div>

              {tasks.length === 0 ? (
                <EmptyState
                  icon={<BookOpen size={20} strokeWidth={1.5} />}
                  title="No tasks yet"
                  description="Tap + to add your first task"
                />
              ) : filteredSortedTasks.length === 0 ? (
                <EmptyState
                  icon={<BookOpen size={20} strokeWidth={1.5} />}
                  title={taskFilter === "done" ? "None completed yet" : "All done!"}
                  description={
                    taskFilter === "done"
                      ? "Complete a task to see it here"
                      : "No active tasks remaining"
                  }
                />
              ) : (
                <div key={`${taskFilter}-${taskSort}`} className="flex flex-col gap-2">
                  {filteredSortedTasks.map((task, i) => (
                    <div
                      key={task.id}
                      style={{ animation: `stagger-in 0.35s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both` }}
                    >
                      <TaskItem
                        task={task}
                        onToggle={handleToggle}
                        onEdit={(t) => {
                          setEditingTask(t);
                          setTaskModalOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        ) : trackerLoading ? (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Clock size={20} strokeWidth={1.5} />}
            title="No sessions logged"
            description="Tap + to log your first study session"
          />
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <TrackerEntryItem
                key={entry.id}
                entry={entry}
                onEdit={(e) => {
                  setEditingEntry(e);
                  setTrackerModalOpen(true);
                }}
                onDelete={removeEntry}
              />
            ))}
          </div>
        )}
        </div>
      </div>

      {/* FAB — above dock */}
      <button
        onClick={
          tab === "tasks"
            ? () => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }
            : () => {
                setEditingEntry(null);
                setTrackerModalOpen(true);
              }
        }
        className="fixed bottom-[5.5rem] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: accentColor,
          boxShadow: `0 8px 24px ${accentColor}55`,
        }}
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <TaskFormModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        editingTask={editingTask}
      />
      <TrackerFormModal
        open={trackerModalOpen}
        onClose={() => {
          setTrackerModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleTrackerSubmit}
        editingEntry={editingEntry}
      />

      {showCelebration && <TaskCompleteOverlay key={celebKey} />}
    </div>
  );
}

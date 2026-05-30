import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, BookOpen, Clock } from "lucide-react";
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
} from "../../tasks/services/taskService";
import type {
  TrackerEntry,
  TrackerFormData,
} from "../../learning-tracker/services/learningTrackerService";

type Tab = "tasks" | "tracker";

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
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TrackerEntry | null>(null);

  async function handleTaskSubmit(form: TaskFormData) {
    if (editingTask) await editTask(editingTask.id, form);
    else await addTask(form);
    await refreshProgress();
  }
  async function handleToggle(taskId: string, status: TaskStatus) {
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
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${t === tab ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            {t === "tasks" ? "Tasks" : "Study Log"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 pb-4">
        {tab === "tasks" ? (
          tasksLoading ? (
            <div className="flex flex-col gap-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={20} strokeWidth={1.5} />}
              title="No tasks yet"
              description="Tap + to add your first task"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setTaskModalOpen(true);
                  }}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
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
    </div>
  );
}

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

  // Task handlers
  function openAddTask() {
    setEditingTask(null);
    setTaskModalOpen(true);
  }
  function openEditTask(task: Task) {
    setEditingTask(task);
    setTaskModalOpen(true);
  }
  function closeTaskModal() {
    setTaskModalOpen(false);
    setEditingTask(null);
  }

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

  // Tracker handlers
  function openAddEntry() {
    setEditingEntry(null);
    setTrackerModalOpen(true);
  }
  function openEditEntry(entry: TrackerEntry) {
    setEditingEntry(entry);
    setTrackerModalOpen(true);
  }
  function closeTrackerModal() {
    setTrackerModalOpen(false);
    setEditingEntry(null);
  }

  async function handleTrackerSubmit(form: TrackerFormData) {
    if (editingEntry) await editEntry(editingEntry.id, form);
    else await addEntry(form);
  }

  // Derived progress from live task state
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const progress =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const accentColor = course?.color ?? "#6366f1";

  return (
    <div className="flex flex-col min-h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate("/courses")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        {courseLoading ? (
          <Skeleton className="h-5 w-40" />
        ) : (
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">
              {course?.name}
            </h1>
            <span className="text-xs text-gray-400">
              {course?.code}
              {course?.semester ? ` · ${course.semester}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      {!courseLoading && course && (
        <div className="mx-4 mb-4 flex gap-3">
          {/* Progress card */}
          <div className="flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                Progress
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: accentColor }}
              >
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: accentColor }}
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              {completedCount}/{tasks.length} tasks
            </p>
          </div>

          {/* Study time card */}
          <div className="flex-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Study Time
            </span>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-xl font-bold text-gray-900">
                {formatDuration(totalMins)}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {entries.length} session{entries.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mx-4 mb-4 flex rounded-xl bg-gray-100 p-1">
        {(["tasks", "tracker"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "tasks" ? "Tasks" : "Study Log"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 pb-24">
        {tab === "tasks" ? (
          tasksLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={24} />}
              title="No tasks yet"
              description="Tap + to add your first task"
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={openEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )
        ) : trackerLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Clock size={24} />}
            title="No sessions logged"
            description="Tap + to log your first study session"
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {entries.map((entry) => (
              <TrackerEntryItem
                key={entry.id}
                entry={entry}
                onEdit={openEditEntry}
                onDelete={removeEntry}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={tab === "tasks" ? openAddTask : openAddEntry}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-150 hover:opacity-90 active:scale-95"
        style={{
          backgroundColor: accentColor,
          boxShadow: `0 8px 24px ${accentColor}55`,
        }}
        aria-label={tab === "tasks" ? "Add task" : "Log session"}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <TaskFormModal
        open={taskModalOpen}
        onClose={closeTaskModal}
        onSubmit={handleTaskSubmit}
        editingTask={editingTask}
      />

      <TrackerFormModal
        open={trackerModalOpen}
        onClose={closeTrackerModal}
        onSubmit={handleTrackerSubmit}
        editingEntry={editingEntry}
      />
    </div>
  );
}

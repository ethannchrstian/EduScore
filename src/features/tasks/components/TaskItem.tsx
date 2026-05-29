import { useState } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "../services/taskService";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  LOW: "bg-gray-300",
  MEDIUM: "bg-amber-400",
  HIGH: "bg-red-500",
};

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  COMPLETED: (
    <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
  ),
  IN_PROGRESS: <Clock size={20} className="text-blue-400 flex-shrink-0" />,
  NOT_STARTED: <Circle size={20} className="text-gray-300 flex-shrink-0" />,
  LATE: <AlertCircle size={20} className="text-red-400 flex-shrink-0" />,
};

function formatDue(
  dueDate: string | null,
): { label: string; color: string } | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (due.getTime() - now.setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diffDays < 0) return { label: "Overdue", color: "text-red-500" };
  if (diffDays === 0) return { label: "Due today", color: "text-red-500" };
  if (diffDays === 1) return { label: "1 day left", color: "text-amber-500" };
  if (diffDays <= 3)
    return { label: `${diffDays} days left`, color: "text-amber-500" };
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    color: "text-gray-400",
  };
}

export default function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const due = formatDue(task.dueDate);
  const isCompleted = task.status === "COMPLETED";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border bg-white p-3.5 transition-all duration-150 ${
        isCompleted ? "border-gray-100 opacity-60" : "border-gray-100 shadow-sm"
      }`}
    >
      {/* Status toggle */}
      <button
        onClick={() => onToggle(task.id, task.status)}
        className="mt-0.5 transition-transform hover:scale-110 active:scale-95"
        aria-label="Toggle status"
      >
        {STATUS_ICON[task.status]}
      </button>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span
          className={`text-sm font-medium leading-snug ${
            isCompleted ? "line-through text-gray-400" : "text-gray-900"
          }`}
        >
          {task.title}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority dot */}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <span
              className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`}
            />
            {task.priority.toLowerCase()}
          </span>
          {/* Due date */}
          {due && (
            <span className={`text-xs font-medium ${due.color}`}>
              {due.label}
            </span>
          )}
        </div>
        {task.description && (
          <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
            {task.description}
          </p>
        )}
      </div>

      {/* Kebab menu */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <MoreVertical size={15} />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-8 z-20 min-w-[130px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

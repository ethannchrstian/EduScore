import { useState } from "react";
import {
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "../services/taskService";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: "bg-zinc-200 text-zinc-500",
  MEDIUM: "bg-amber-100 text-amber-600",
  HIGH: "bg-red-100 text-red-500",
};

const STATUS_ICON: Record<TaskStatus, React.ReactNode> = {
  COMPLETED: (
    <CheckCircle2 size={20} className="text-indigo-500 flex-shrink-0" />
  ),
  IN_PROGRESS: <Clock size={20} className="text-amber-400 flex-shrink-0" />,
  NOT_STARTED: <Circle size={20} className="text-zinc-300 flex-shrink-0" />,
  LATE: <AlertCircle size={20} className="text-red-400 flex-shrink-0" />,
};

function formatDue(
  dueDate: string | null,
): { label: string; color: string } | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const d = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (d < 0) return { label: "Overdue", color: "text-red-500 font-semibold" };
  if (d === 0)
    return { label: "Due today", color: "text-red-500 font-semibold" };
  if (d === 1) return { label: "1 day left", color: "text-amber-500" };
  if (d <= 3) return { label: `${d} days left`, color: "text-amber-500" };
  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    color: "text-zinc-400",
  };
}

export default function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const due = formatDue(task.dueDate);
  const isCompleted = task.status === "COMPLETED";
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => onEdit(task)}
        className={`flex items-start gap-3 rounded-xl border bg-white px-4 py-3.5 cursor-pointer transition-all duration-200 hover:border-indigo-100 hover:shadow-sm active:scale-[0.99] ${
          isCompleted ? "border-zinc-100 opacity-60" : "border-zinc-100"
        }`}
      >
        {/* Status toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id, task.status);
          }}
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110 active:scale-90"
        >
          {STATUS_ICON[task.status]}
        </button>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <span
            className={`text-sm leading-snug ${isCompleted ? "line-through text-zinc-400" : "font-medium text-zinc-900"}`}
          >
            {task.title}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_COLOR[task.priority]}`}
            >
              {task.priority.toLowerCase()}
            </span>
            {due && <span className={`text-xs ${due.color}`}>{due.label}</span>}
            {task.description && (
              <span className="text-xs text-zinc-400 truncate">
                {task.description}
              </span>
            )}
          </div>
        </div>

        {/* Delete — always visible */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Task"
        message={`Delete "${task.title}"?`}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(task.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

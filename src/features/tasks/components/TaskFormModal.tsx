import { useState } from "react";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import type {
  Task,
  TaskFormData,
  TaskPriority,
  TaskStatus,
} from "../services/taskService";

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: TaskFormData) => Promise<void>;
  editingTask?: Task | null;
}

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
const STATUSES: TaskStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "LATE",
];

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: "bg-gray-100 text-gray-600 border-gray-200",
  MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
  HIGH: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600 border-gray-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  LATE: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  LATE: "Late",
};

function TaskForm({
  onClose,
  onSubmit,
  editingTask,
}: Omit<TaskFormModalProps, "open">) {
  const initial: TaskFormData = editingTask
    ? {
        title: editingTask.title,
        description: editingTask.description ?? "",
        dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : "",
        priority: editingTask.priority,
        status: editingTask.status,
      }
    : {
        title: "",
        description: "",
        dueDate: "",
        priority: "MEDIUM",
        status: "NOT_STARTED",
      };

  const [fields, setFields] = useState<TaskFormData>(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!fields.title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit(fields);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Task Title"
        placeholder="e.g. Complete Lab Report"
        value={fields.title}
        onChange={(e) => setFields((p) => ({ ...p, title: e.target.value }))}
        error={error}
      />

      <Input
        label="Due Date (optional)"
        type="date"
        value={fields.dueDate}
        onChange={(e) => setFields((p) => ({ ...p, dueDate: e.target.value }))}
      />

      {/* Priority selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Priority</label>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFields((prev) => ({ ...prev, priority: p }))}
              className={`flex-1 rounded-xl border py-2 text-xs font-semibold capitalize transition-all ${
                fields.priority === p
                  ? PRIORITY_STYLES[p] + " ring-2 ring-offset-1 ring-current"
                  : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {p.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Status selector — only show when editing */}
      {editingTask && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFields((prev) => ({ ...prev, status: s }))}
                className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                  fields.status === s
                    ? STATUS_STYLES[s] + " ring-2 ring-offset-1 ring-current"
                    : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Notes (optional)
        </label>
        <textarea
          rows={2}
          placeholder="Any extra details..."
          value={fields.description}
          onChange={(e) =>
            setFields((p) => ({ ...p, description: e.target.value }))
          }
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={loading}>
          {editingTask ? "Save Changes" : "Add Task"}
        </Button>
      </div>
    </form>
  );
}

export default function TaskFormModal({
  open,
  onClose,
  onSubmit,
  editingTask,
}: TaskFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTask ? "Edit Task" : "Add Task"}
    >
      <TaskForm
        key={open ? (editingTask?.id ?? "new") : "closed"}
        onClose={onClose}
        onSubmit={onSubmit}
        editingTask={editingTask}
      />
    </Modal>
  );
}

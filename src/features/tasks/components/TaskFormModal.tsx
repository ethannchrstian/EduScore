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

const PRIORITIES: { key: TaskPriority; label: string; color: string }[] = [
  {
    key: "LOW",
    label: "Low",
    color: "border-zinc-200 text-zinc-500 hover:border-zinc-300",
  },
  {
    key: "MEDIUM",
    label: "Medium",
    color: "border-amber-200 text-amber-600 hover:border-amber-300",
  },
  {
    key: "HIGH",
    label: "High",
    color: "border-red-200 text-red-500 hover:border-red-300",
  },
];
const PRIORITIES_ACTIVE: Record<TaskPriority, string> = {
  LOW: "border-zinc-900 bg-zinc-900 text-white",
  MEDIUM: "border-amber-500 bg-amber-500 text-white",
  HIGH: "border-red-500 bg-red-500 text-white",
};
const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: "NOT_STARTED", label: "Not Started" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "LATE", label: "Late" },
];

function TaskForm({
  onClose,
  onSubmit,
  editingTask,
}: {
  onClose: () => void;
  onSubmit: (f: TaskFormData) => Promise<void>;
  editingTask?: Task | null;
}) {
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
        label="Title"
        placeholder="e.g. Complete Lab Report"
        value={fields.title}
        onChange={(e) => setFields((p) => ({ ...p, title: e.target.value }))}
        error={error}
      />
      <Input
        label="Due Date"
        type="date"
        value={fields.dueDate}
        onChange={(e) => setFields((p) => ({ ...p, dueDate: e.target.value }))}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Priority
        </label>
        <div className="flex gap-2">
          {PRIORITIES.map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFields((p) => ({ ...p, priority: key }))}
              className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all duration-150 ${fields.priority === key ? PRIORITIES_ACTIVE[key] : `bg-white ${color}`}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {editingTask && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFields((p) => ({ ...p, status: key }))}
                className={`rounded-xl border py-2 text-xs font-medium transition-all duration-150 ${fields.status === key ? "border-indigo-600 bg-indigo-600 text-white" : "border-zinc-200 text-zinc-500 hover:border-zinc-300 bg-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Notes
        </label>
        <textarea
          rows={2}
          placeholder="Optional details..."
          value={fields.description}
          onChange={(e) =>
            setFields((p) => ({ ...p, description: e.target.value }))
          }
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
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
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (f: TaskFormData) => Promise<void>;
  editingTask?: Task | null;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingTask ? "Edit Task" : "New Task"}
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

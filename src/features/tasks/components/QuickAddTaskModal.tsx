import { useState, useEffect } from "react";
import { ChevronDown, ListTodo } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import { useRefresh } from "../../../shared/context/RefreshContext";
import { fetchCourses } from "../../courses/services/courseService";
import { createTask } from "../services/taskService";
import type { Course } from "../../courses/services/courseService";
import type { TaskPriority } from "../services/taskService";

const PRIORITIES: { key: TaskPriority; label: string; activeClass: string; idleClass: string }[] = [
  { key: "LOW",    label: "Low",    activeClass: "border-zinc-900 bg-zinc-900 text-white",     idleClass: "border-zinc-200 text-zinc-500 hover:border-zinc-300" },
  { key: "MEDIUM", label: "Medium", activeClass: "border-amber-500 bg-amber-500 text-white",   idleClass: "border-amber-200 text-amber-600 hover:border-amber-300" },
  { key: "HIGH",   label: "High",   activeClass: "border-red-500 bg-red-500 text-white",       idleClass: "border-red-200 text-red-500 hover:border-red-300" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCourseId?: string;
}

function QuickAddForm({ onClose, defaultCourseId }: { onClose: () => void; defaultCourseId?: string }) {
  const { user } = useAuthContext();
  const toast = useToast();
  const { notifyChange } = useRefresh();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseId, setCourseId] = useState(defaultCourseId ?? "");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [titleError, setTitleError] = useState("");
  const [courseError, setCourseError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchCourses(user.id)
      .then((list) => {
        setCourses(list);
        if (!defaultCourseId && list.length > 0) setCourseId(list[0].id);
      })
      .finally(() => setCoursesLoading(false));
  }, [user, defaultCourseId]);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    let valid = true;
    if (!title.trim()) { setTitleError("Title is required"); valid = false; }
    else setTitleError("");
    if (!courseId) { setCourseError("Select a course"); valid = false; }
    else setCourseError("");
    if (!valid) return;

    setLoading(true);
    try {
      await createTask(courseId, {
        title: title.trim(),
        dueDate: dueDate || undefined,
        priority,
        status: "NOT_STARTED",
      });
      notifyChange();
      toast("Task added", "success");
      onClose();
    } catch {
      toast("Failed to add task", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Course selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Course
        </label>
        {coursesLoading ? (
          <div className="h-10 rounded-xl bg-zinc-100 animate-pulse" />
        ) : courses.length === 0 ? (
          <p className="text-sm text-zinc-400">No courses yet — add a course first.</p>
        ) : (
          <div className="relative">
            <select
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setCourseError(""); }}
              className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-9 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          </div>
        )}
        {courseError && <p className="text-xs text-red-500">{courseError}</p>}
      </div>

      <Input
        label="Title"
        placeholder="e.g. Complete Lab Report"
        value={title}
        onChange={(e) => { setTitle(e.target.value); setTitleError(""); }}
        error={titleError}
      />

      <Input
        label="Due Date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      {/* Priority */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Priority
        </label>
        <div className="flex gap-2">
          {PRIORITIES.map(({ key, label, activeClass, idleClass }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPriority(key)}
              className={`flex-1 rounded-xl border py-2 text-xs font-semibold transition-all duration-150 ${priority === key ? activeClass : `bg-white ${idleClass}`}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={loading} disabled={courses.length === 0}>
          Add Task
        </Button>
      </div>
    </form>
  );
}

export default function QuickAddTaskModal({ open, onClose, defaultCourseId }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quick Add Task"
      icon={<ListTodo size={15} />}
      iconClassName="bg-amber-50 text-amber-500"
    >
      <QuickAddForm key={open ? "open" : "closed"} onClose={onClose} defaultCourseId={defaultCourseId} />
    </Modal>
  );
}

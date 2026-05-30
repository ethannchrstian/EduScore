import { useState } from "react";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import type { Course, CourseFormData } from "../services/courseService";

const PALETTE = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#64748b",
];

function CourseForm({
  onClose,
  onSubmit,
  editingCourse,
}: {
  onClose: () => void;
  onSubmit: (f: CourseFormData) => Promise<void>;
  editingCourse?: Course | null;
}) {
  const initial: CourseFormData = editingCourse
    ? {
        name: editingCourse.name,
        code: editingCourse.code,
        description: editingCourse.description ?? "",
        semester: editingCourse.semester ?? "",
        color: editingCourse.color,
      }
    : { name: "", code: "", description: "", semester: "", color: PALETTE[0] };
  const [fields, setFields] = useState<CourseFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CourseFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Partial<Record<keyof CourseFormData, string>> = {};
    if (!fields.name.trim()) e.name = "Required";
    if (!fields.code.trim()) e.code = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(fields);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  const set =
    (key: keyof CourseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((p) => ({ ...p, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Course Name"
        placeholder="e.g. Data Structures"
        value={fields.name}
        onChange={set("name")}
        error={errors.name}
      />
      <Input
        label="Course Code"
        placeholder="e.g. CS301"
        value={fields.code}
        onChange={set("code")}
        error={errors.code}
      />
      <Input
        label="Semester"
        placeholder="e.g. 2024/2025 Ganjil"
        value={fields.semester}
        onChange={set("semester")}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Color
        </label>
        <div className="flex gap-2.5 flex-wrap">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFields((p) => ({ ...p, color: c }))}
              className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: c,
                boxShadow:
                  fields.color === c
                    ? `0 0 0 3px white, 0 0 0 5px ${c}`
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Notes
        </label>
        <textarea
          rows={2}
          placeholder="Optional description..."
          value={fields.description}
          onChange={set("description")}
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
          {editingCourse ? "Save Changes" : "Add Course"}
        </Button>
      </div>
    </form>
  );
}

export default function CourseFormModal({
  open,
  onClose,
  onSubmit,
  editingCourse,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (f: CourseFormData) => Promise<void>;
  editingCourse?: Course | null;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingCourse ? "Edit Course" : "New Course"}
    >
      <CourseForm
        key={open ? (editingCourse?.id ?? "new") : "closed"}
        onClose={onClose}
        onSubmit={onSubmit}
        editingCourse={editingCourse}
      />
    </Modal>
  );
}

import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import type { Course, CourseFormData } from "../services/courseService";
import { useState } from "react";

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

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: CourseFormData) => Promise<void>;
  editingCourse?: Course | null;
}

// Inner form is remounted fresh each time the modal opens via `key`
function CourseForm({
  onClose,
  onSubmit,
  editingCourse,
}: Omit<CourseFormModalProps, "open">) {
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
    if (!fields.name.trim()) e.name = "Course name is required";
    if (!fields.code.trim()) e.code = "Course code is required";
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
        label="Semester (optional)"
        placeholder="e.g. 2024/2025 Ganjil"
        value={fields.semester}
        onChange={set("semester")}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Description (optional)
        </label>
        <textarea
          rows={2}
          placeholder="Short description..."
          value={fields.description}
          onChange={set("description")}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Color</label>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFields((p) => ({ ...p, color: c }))}
              className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{ backgroundColor: c }}
              aria-label={c}
            >
              {fields.color === c && (
                <span className="flex h-full w-full items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
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
}: CourseFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingCourse ? "Edit Course" : "Add Course"}
    >
      {/* key remounts CourseForm fresh on every open, no useEffect needed */}
      <CourseForm
        key={open ? (editingCourse?.id ?? "new") : "closed"}
        onClose={onClose}
        onSubmit={onSubmit}
        editingCourse={editingCourse}
      />
    </Modal>
  );
}

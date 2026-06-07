import { useState } from "react";
import { BookOpen, ChevronDown, Pipette } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import type { Course, CourseFormData } from "../services/courseService";
import { PALETTE } from "../colors";

const SEMESTERS = Array.from({ length: 14 }, (_, i) => i + 1);

// Keep only valid 1–14 semester numbers; legacy free-text values become "" (unset).
function normalizeSemester(s: string | null | undefined): string {
  if (!s) return "";
  return /^([1-9]|1[0-4])$/.test(s) ? s : "";
}

function CourseForm({
  onClose,
  onSubmit,
  editingCourse,
  defaultColor,
}: {
  onClose: () => void;
  onSubmit: (f: CourseFormData) => Promise<void>;
  editingCourse?: Course | null;
  defaultColor?: string;
}) {
  const initial: CourseFormData = editingCourse
    ? {
        name: editingCourse.name,
        code: editingCourse.code ?? "",
        description: editingCourse.description ?? "",
        semester: normalizeSemester(editingCourse.semester),
        color: editingCourse.color,
      }
    : {
        name: "",
        code: "",
        description: "",
        semester: "",
        color: defaultColor ?? PALETTE[0],
      };
  const [fields, setFields] = useState<CourseFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CourseFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Partial<Record<keyof CourseFormData, string>> = {};
    if (!fields.name.trim()) e.name = "Required";
    // Course code is optional — many students don't have it handy.
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Empty semester → undefined so it's stored as null, not ""
      await onSubmit({ ...fields, semester: fields.semester || undefined });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  const set =
    (key: keyof CourseFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((p) => ({ ...p, [key]: e.target.value }));

  const isCustomColor = !PALETTE.some(
    (c) => c.toLowerCase() === fields.color.toLowerCase(),
  );

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
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Semester
        </label>
        <div className="relative">
          <select
            value={fields.semester ?? ""}
            onChange={(e) =>
              setFields((p) => ({ ...p, semester: e.target.value }))
            }
            className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-9 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          >
            <option value="">Not set</option>
            {SEMESTERS.map((n) => (
              <option key={n} value={String(n)}>
                Semester {n}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Color
          </label>
          <span className="font-mono text-[10px] uppercase text-zinc-400">
            {fields.color}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFields((p) => ({ ...p, color: c }))}
              className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
              style={{
                backgroundColor: c,
                boxShadow:
                  fields.color.toLowerCase() === c.toLowerCase()
                    ? `0 0 0 3px white, 0 0 0 5px ${c}`
                    : "none",
              }}
            />
          ))}
          {/* Custom color picker */}
          <label
            className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-transform hover:scale-110"
            title="Custom color"
            style={
              isCustomColor
                ? {
                    backgroundColor: fields.color,
                    boxShadow: `0 0 0 3px white, 0 0 0 5px ${fields.color}`,
                  }
                : { border: "2px dashed #d4d4d8" }
            }
          >
            {!isCustomColor && <Pipette size={12} className="text-zinc-400" />}
            <input
              type="color"
              value={fields.color}
              onChange={(e) =>
                setFields((p) => ({ ...p, color: e.target.value }))
              }
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Custom color"
            />
          </label>
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
  defaultColor,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (f: CourseFormData) => Promise<void>;
  editingCourse?: Course | null;
  defaultColor?: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingCourse ? "Edit Course" : "New Course"}
      icon={<BookOpen size={15} />}
      iconClassName="bg-indigo-50 text-indigo-500"
    >
      <CourseForm
        key={open ? (editingCourse?.id ?? "new") : "closed"}
        onClose={onClose}
        onSubmit={onSubmit}
        editingCourse={editingCourse}
        defaultColor={defaultColor}
      />
    </Modal>
  );
}

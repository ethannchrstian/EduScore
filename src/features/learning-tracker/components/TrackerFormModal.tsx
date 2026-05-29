import { useState } from "react";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import type {
  TrackerEntry,
  TrackerFormData,
} from "../services/learningTrackerService";

interface TrackerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: TrackerFormData) => Promise<void>;
  editingEntry?: TrackerEntry | null;
}

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

function TrackerForm({
  onClose,
  onSubmit,
  editingEntry,
}: Omit<TrackerFormModalProps, "open">) {
  const today = new Date().toISOString().slice(0, 10);

  const initial: TrackerFormData = editingEntry
    ? {
        studyDate: editingEntry.studyDate.slice(0, 10),
        topic: editingEntry.topic,
        durationMins: editingEntry.durationMins,
        notes: editingEntry.notes ?? "",
      }
    : { studyDate: today, topic: "", durationMins: 30, notes: "" };

  const [fields, setFields] = useState<TrackerFormData>(initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof TrackerFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: Partial<Record<keyof TrackerFormData, string>> = {};
    if (!fields.topic.trim()) e.topic = "Topic is required";
    if (!fields.studyDate) e.studyDate = "Date is required";
    if (fields.durationMins < 1)
      e.durationMins = "Duration must be at least 1 minute";
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Topic"
        placeholder="e.g. Binary Trees, Chapter 4"
        value={fields.topic}
        onChange={(e) => setFields((p) => ({ ...p, topic: e.target.value }))}
        error={errors.topic}
      />

      <Input
        label="Study Date"
        type="date"
        value={fields.studyDate}
        onChange={(e) =>
          setFields((p) => ({ ...p, studyDate: e.target.value }))
        }
        error={errors.studyDate}
      />

      {/* Duration */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Duration —{" "}
          <span className="font-bold text-indigo-600">
            {fields.durationMins} mins
          </span>
        </label>
        {/* Preset chips */}
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFields((p) => ({ ...p, durationMins: d }))}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                fields.durationMins === d
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {d >= 60 ? `${d / 60}h` : `${d}m`}
            </button>
          ))}
        </div>
        {/* Manual input */}
        <input
          type="number"
          min={1}
          max={480}
          value={fields.durationMins}
          onChange={(e) =>
            setFields((p) => ({ ...p, durationMins: Number(e.target.value) }))
          }
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          placeholder="Or enter custom minutes"
        />
        {errors.durationMins && (
          <p className="text-xs text-red-500">{errors.durationMins}</p>
        )}
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Notes (optional)
        </label>
        <textarea
          rows={2}
          placeholder="What did you cover?"
          value={fields.notes}
          onChange={(e) => setFields((p) => ({ ...p, notes: e.target.value }))}
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
          {editingEntry ? "Save Changes" : "Log Session"}
        </Button>
      </div>
    </form>
  );
}

export default function TrackerFormModal({
  open,
  onClose,
  onSubmit,
  editingEntry,
}: TrackerFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingEntry ? "Edit Session" : "Log Study Session"}
    >
      <TrackerForm
        key={open ? (editingEntry?.id ?? "new") : "closed"}
        onClose={onClose}
        onSubmit={onSubmit}
        editingEntry={editingEntry}
      />
    </Modal>
  );
}

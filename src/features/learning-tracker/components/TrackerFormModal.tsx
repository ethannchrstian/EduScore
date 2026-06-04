import { useState } from "react";
import { Clock } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import type {
  TrackerEntry,
  TrackerFormData,
} from "../services/learningTrackerService";

const PRESETS = [15, 30, 45, 60, 90, 120];

function TrackerForm({
  onClose,
  onSubmit,
  editingEntry,
}: {
  onClose: () => void;
  onSubmit: (f: TrackerFormData) => Promise<void>;
  editingEntry?: TrackerEntry | null;
}) {
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
    if (!fields.topic.trim()) e.topic = "Required";
    if (!fields.studyDate) e.studyDate = "Required";
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

  const durationLabel =
    fields.durationMins < 60
      ? `${fields.durationMins}m`
      : `${Math.floor(fields.durationMins / 60)}h${fields.durationMins % 60 ? ` ${fields.durationMins % 60}m` : ""}`;

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
        label="Date"
        type="date"
        value={fields.studyDate}
        onChange={(e) =>
          setFields((p) => ({ ...p, studyDate: e.target.value }))
        }
        error={errors.studyDate}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Duration —{" "}
          <span className="text-indigo-600 font-semibold">{durationLabel}</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setFields((p) => ({ ...p, durationMins: d }))}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                fields.durationMins === d
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "border-zinc-200 text-zinc-500 bg-white hover:border-indigo-200 hover:text-indigo-500"
              }`}
            >
              {d >= 60 ? `${d / 60}h` : `${d}m`}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          max={480}
          value={fields.durationMins}
          onChange={(e) =>
            setFields((p) => ({ ...p, durationMins: Number(e.target.value) }))
          }
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Notes
        </label>
        <textarea
          rows={2}
          placeholder="What did you cover?"
          value={fields.notes}
          onChange={(e) => setFields((p) => ({ ...p, notes: e.target.value }))}
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
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (f: TrackerFormData) => Promise<void>;
  editingEntry?: TrackerEntry | null;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingEntry ? "Edit Session" : "Log Study Session"}
      icon={<Clock size={15} />}
      iconClassName="bg-violet-50 text-violet-500"
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

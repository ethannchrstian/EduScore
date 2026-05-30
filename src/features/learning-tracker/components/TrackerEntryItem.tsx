import { useState } from "react";
import { Trash2, Clock } from "lucide-react";
import type { TrackerEntry } from "../services/learningTrackerService";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";

interface Props {
  entry: TrackerEntry;
  onEdit: (e: TrackerEntry) => void;
  onDelete: (id: string) => void;
}

function formatDate(d: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (d.slice(0, 10) === today) return "Today";
  if (d.slice(0, 10) === yesterday) return "Yesterday";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function TrackerEntryItem({ entry, onEdit, onDelete }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => onEdit(entry)}
        className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3.5 cursor-pointer transition-all duration-200 hover:border-indigo-100 hover:shadow-sm active:scale-[0.99]"
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 mt-0.5">
          <Clock size={15} />
        </div>
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium text-zinc-900 truncate">
            {entry.topic}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              {formatDate(entry.studyDate)}
            </span>
            <span className="h-1 w-1 rounded-full bg-zinc-200" />
            <span className="text-xs font-semibold text-indigo-600">
              {formatDuration(entry.durationMins)}
            </span>
            {entry.notes && (
              <>
                <span className="h-1 w-1 rounded-full bg-zinc-200" />
                <span className="text-xs text-zinc-400 truncate">
                  {entry.notes}
                </span>
              </>
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
          aria-label="Delete session"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Session"
        message={`Delete the "${entry.topic}" study session?`}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(entry.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

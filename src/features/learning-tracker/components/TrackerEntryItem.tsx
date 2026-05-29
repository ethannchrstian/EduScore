import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Clock } from "lucide-react";
import type { TrackerEntry } from "../services/learningTrackerService";

interface TrackerEntryItemProps {
  entry: TrackerEntry;
  onEdit: (entry: TrackerEntry) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = dateStr.slice(0, 10) === today.toISOString().slice(0, 10);
  const isYesterday =
    dateStr.slice(0, 10) === yesterday.toISOString().slice(0, 10);

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default function TrackerEntryItem({
  entry,
  onEdit,
  onDelete,
}: TrackerEntryItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm">
      {/* Icon */}
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 mt-0.5">
        <Clock size={16} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold text-gray-900 truncate">
          {entry.topic}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">
            {formatDate(entry.studyDate)}
          </span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span className="text-xs font-semibold text-indigo-600">
            {formatDuration(entry.durationMins)}
          </span>
        </div>
        {entry.notes && (
          <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
            {entry.notes}
          </p>
        )}
      </div>

      {/* Kebab */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <MoreVertical size={15} />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-8 z-20 min-w-[130px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(entry);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(entry.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

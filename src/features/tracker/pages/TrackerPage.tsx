import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Clock, CalendarDays, Plus } from "lucide-react";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import { formatDuration } from "../../../shared/utils/date";
import {
  fetchAllEntries,
  type AllTrackerEntry,
} from "../../learning-tracker/services/learningTrackerService";
import Skeleton from "../../../shared/components/ui/Skeleton";
import EmptyState from "../../../shared/components/ui/EmptyState";
import QuickLogModal from "../../learning-tracker/components/QuickLogModal";

type Filter = "today" | "7d" | "30d";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
];

interface DayGroup {
  date: string;
  label: string;
  entries: AllTrackerEntry[];
  totalMins: number;
}

function getDayLabel(d: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (d === today) return "Today";
  if (d === yesterday) return "Yesterday";
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function groupByDay(rows: AllTrackerEntry[]): DayGroup[] {
  const map = new Map<string, AllTrackerEntry[]>();
  for (const row of rows) {
    const key = row.studyDate.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, entries]) => ({
      date,
      label: getDayLabel(date),
      entries,
      totalMins: entries.reduce((s, e) => s + e.durationMins, 0),
    }));
}

function filterEntries(entries: AllTrackerEntry[], filter: Filter): AllTrackerEntry[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  if (filter === "today")
    return entries.filter((e) => e.studyDate.slice(0, 10) === today);
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - (filter === "7d" ? 7 : 30));
  return entries.filter((e) => new Date(e.studyDate) >= cutoff);
}

export default function TrackerPage() {
  const { user } = useAuthContext();
  const toast = useToast();
  const [entries, setEntries] = useState<AllTrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("7d");
  const location = useLocation();
  // Auto-open the log form when sent here from the Getting Started checklist.
  const [logOpen, setLogOpen] = useState(
    () => (location.state as { autoLog?: boolean } | null)?.autoLog === true,
  );
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const allEntries = await fetchAllEntries(user.id);
      setEntries(allEntries);
    } catch {
      toastRef.current("Failed to load study log", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filterEntries(entries, filter);
  const totalFiltered = filtered.reduce((s, e) => s + e.durationMins, 0);
  const todayMins = entries
    .filter(
      (e) => e.studyDate.slice(0, 10) === new Date().toISOString().slice(0, 10),
    )
    .reduce((s, e) => s + e.durationMins, 0);
  const groups = groupByDay(filtered);

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300">
      <div className="px-5 pt-10 pb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Activity
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">
          Study Log
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="mx-5 mb-4 flex rounded-xl bg-zinc-100 p-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all duration-200 ${filter === key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="mx-5 grid grid-cols-2 gap-3 mb-5">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : (
        <div className="mx-5 grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl bg-white border border-zinc-100 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-zinc-400 mb-2">
              <Clock size={12} />
              Today
            </div>
            <p className="text-2xl font-bold tracking-tight text-zinc-900">
              {formatDuration(todayMins)}
            </p>
          </div>
          <div className="rounded-2xl bg-indigo-600 p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-indigo-200 mb-2">
              <CalendarDays size={12} />
              {filter === "today"
                ? "Today"
                : filter === "7d"
                  ? "7 days"
                  : "30 days"}
            </div>
            <p className="text-2xl font-bold tracking-tight text-white">
              {formatDuration(totalFiltered)}
            </p>
          </div>
        </div>
      )}

      {/* Grouped entries */}
      <div className="flex-1 px-5 pb-6">
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon={<Clock size={20} strokeWidth={1.5} />}
            title="No sessions"
            description="Tap + to log your first study session"
          />
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    {group.label}
                  </span>
                  <span className="text-xs font-bold text-indigo-600">
                    {formatDuration(group.totalMins)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 hover:border-indigo-100 transition-colors"
                    >
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full mt-0.5"
                        style={{ backgroundColor: `${entry.courseColor}18` }}
                      >
                        <Clock size={13} style={{ color: entry.courseColor }} />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-zinc-900 truncate">
                          {entry.topic}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium truncate"
                            style={{ color: entry.courseColor }}
                          >
                            {entry.courseName}
                          </span>
                          {entry.notes && (
                            <>
                              <span className="h-1 w-1 flex-shrink-0 rounded-full bg-zinc-200" />
                              <span className="text-xs text-zinc-400 truncate">
                                {entry.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="flex-shrink-0 text-xs font-bold text-zinc-600">
                        {formatDuration(entry.durationMins)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setLogOpen(true)}
        className="fixed bottom-[5.5rem] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-300 transition-all duration-200 hover:bg-indigo-700 hover:scale-105 active:scale-95"
        aria-label="Log study session"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <QuickLogModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onLogged={load}
      />
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Clock, CalendarDays } from "lucide-react";
import { supabase } from "../../../config/supabase";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import { formatDuration } from "../../../shared/utils/date";
import Skeleton from "../../../shared/components/ui/Skeleton";
import EmptyState from "../../../shared/components/ui/EmptyState";

interface TrackerRow {
  id: string;
  topic: string;
  studyDate: string;
  durationMins: number;
  notes: string | null;
  courseName: string;
  courseColor: string;
}

interface RawRow {
  id: string;
  topic: string;
  study_date: string;
  duration_mins: number;
  notes: string | null;
  matakuliah: { name: string; color: string };
}

interface DayGroup {
  date: string;
  label: string;
  entries: TrackerRow[];
  totalMins: number;
}

function getDayLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function groupByDay(rows: TrackerRow[]): DayGroup[] {
  const map = new Map<string, TrackerRow[]>();
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

export default function TrackerPage() {
  const { user } = useAuthContext();
  const toast = useToast();
  const [entries, setEntries] = useState<TrackerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("learning_tracker")
          .select(
            "id, topic, study_date, duration_mins, notes, matakuliah!inner(name, color, user_id)",
          )
          .eq("matakuliah.user_id", user.id)
          .order("study_date", { ascending: false });
        if (error) throw error;
        if (!cancelled) {
          setEntries(
            (data as unknown as RawRow[]).map((r) => ({
              id: r.id,
              topic: r.topic,
              studyDate: r.study_date,
              durationMins: r.duration_mins,
              notes: r.notes,
              courseName: r.matakuliah.name,
              courseColor: r.matakuliah.color,
            })),
          );
        }
      } catch {
        if (!cancelled) toastRef.current("Failed to load study log", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const totalAllTime = entries.reduce((s, e) => s + e.durationMins, 0);
  const todayMins = entries
    .filter(
      (e) => e.studyDate.slice(0, 10) === new Date().toISOString().slice(0, 10),
    )
    .reduce((s, e) => s + e.durationMins, 0);

  const groups = groupByDay(entries);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Study Log</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          All your sessions across courses
        </p>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="mx-5 grid grid-cols-2 gap-3 mb-5">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
      ) : (
        <div className="mx-5 grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
              <Clock size={13} /> Today
            </div>
            <span className="text-2xl font-extrabold text-gray-900 leading-none">
              {formatDuration(todayMins)}
            </span>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-1">
              <CalendarDays size={13} /> All time
            </div>
            <span className="text-2xl font-extrabold text-gray-900 leading-none">
              {formatDuration(totalAllTime)}
            </span>
          </div>
        </div>
      )}

      {/* Grouped entries */}
      <div className="flex-1 px-5 pb-24">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            icon={<Clock size={24} />}
            title="No sessions yet"
            description="Log study sessions from inside any course"
          />
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <div key={group.date}>
                {/* Day header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {group.label}
                  </span>
                  <span className="text-xs font-semibold text-indigo-500">
                    {formatDuration(group.totalMins)}
                  </span>
                </div>
                {/* Entries */}
                <div className="flex flex-col gap-2">
                  {group.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm"
                    >
                      <div
                        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${entry.courseColor}20` }}
                      >
                        <Clock size={14} style={{ color: entry.courseColor }} />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-semibold text-gray-900 truncate">
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
                              <span className="h-1 w-1 rounded-full bg-gray-300 flex-shrink-0" />
                              <span className="text-xs text-gray-400 truncate">
                                {entry.notes}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="flex-shrink-0 text-xs font-bold text-gray-500">
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
    </div>
  );
}

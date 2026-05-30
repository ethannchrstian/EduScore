import { useState, useEffect, useRef, useCallback } from "react";
import { Clock, CalendarDays, Plus, ChevronDown } from "lucide-react";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import { formatDuration } from "../../../shared/utils/date";
import {
  fetchAllEntries,
  createEntry,
  type AllTrackerEntry,
  type TrackerFormData,
} from "../../learning-tracker/services/learningTrackerService";
import { fetchCourses } from "../../courses/services/courseService";
import Skeleton from "../../../shared/components/ui/Skeleton";
import EmptyState from "../../../shared/components/ui/EmptyState";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";

type Filter = "today" | "7d" | "30d";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
];

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

interface CourseSummary {
  id: string;
  name: string;
  color: string;
}

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

function QuickLogModal({
  open,
  onClose,
  courses,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  courses: CourseSummary[];
  onSubmit: (matakuliahId: string, form: TrackerFormData) => Promise<void>;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [fields, setFields] = useState<TrackerFormData>({
    studyDate: today,
    topic: "",
    durationMins: 30,
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCourseId(courses[0]?.id ?? "");
      setFields({ studyDate: today, topic: "", durationMins: 30, notes: "" });
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function validate() {
    const e: Record<string, string> = {};
    if (!courseId) e.course = "Select a course";
    if (!fields.topic.trim()) e.topic = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(courseId, fields);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  const durationLabel =
    fields.durationMins < 60
      ? `${fields.durationMins}m`
      : `${Math.floor(fields.durationMins / 60)}h${fields.durationMins % 60 ? ` ${fields.durationMins % 60}m` : ""}`;

  if (courses.length === 0) {
    return (
      <Modal open={open} onClose={onClose} title="Log Study Session">
        <p className="text-sm text-zinc-500 text-center py-6">
          Add a course first before logging a study session.
        </p>
        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Study Session">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Course selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Course
          </label>
          <div className="relative">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>
          {errors.course && (
            <span className="text-xs text-red-500">{errors.course}</span>
          )}
        </div>

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
        />

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Duration —{" "}
            <span className="text-indigo-600 font-semibold">{durationLabel}</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {DURATION_PRESETS.map((d) => (
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
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Notes
          </label>
          <textarea
            rows={2}
            placeholder="What did you cover?"
            value={fields.notes}
            onChange={(e) =>
              setFields((p) => ({ ...p, notes: e.target.value }))
            }
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
            Log Session
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function TrackerPage() {
  const { user } = useAuthContext();
  const toast = useToast();
  const [entries, setEntries] = useState<AllTrackerEntry[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("7d");
  const [logOpen, setLogOpen] = useState(false);
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
      const [allEntries, allCourses] = await Promise.all([
        fetchAllEntries(user.id),
        fetchCourses(user.id),
      ]);
      setEntries(allEntries);
      setCourses(allCourses.map((c) => ({ id: c.id, name: c.name, color: c.color })));
    } catch {
      toastRef.current("Failed to load study log", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLogSession(matakuliahId: string, form: TrackerFormData) {
    await createEntry(matakuliahId, form);
    await load();
    toast("Session logged", "success");
  }

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
        courses={courses}
        onSubmit={handleLogSession}
      />
    </div>
  );
}

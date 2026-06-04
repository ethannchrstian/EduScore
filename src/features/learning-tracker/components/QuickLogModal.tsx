import { useState, useEffect } from "react";
import { ChevronDown, Clock } from "lucide-react";
import Modal from "../../../shared/components/ui/Modal";
import Input from "../../../shared/components/ui/Input";
import Button from "../../../shared/components/ui/Button";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import { useRefresh } from "../../../shared/context/RefreshContext";
import { fetchCourses } from "../../courses/services/courseService";
import { createEntry } from "../services/learningTrackerService";
import type { Course } from "../../courses/services/courseService";

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

function durationLabel(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function QuickLogForm({
  onClose,
  onLogged,
}: {
  onClose: () => void;
  onLogged?: () => void;
}) {
  const { user } = useAuthContext();
  const toast = useToast();
  const { notifyChange } = useRefresh();
  const today = new Date().toISOString().slice(0, 10);

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseId, setCourseId] = useState("");
  const [topic, setTopic] = useState("");
  const [studyDate, setStudyDate] = useState(today);
  const [durationMins, setDurationMins] = useState(30);
  const [notes, setNotes] = useState("");
  const [topicError, setTopicError] = useState("");
  const [courseError, setCourseError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch courses on open; set the default selection once they arrive.
  useEffect(() => {
    if (!user) return;
    fetchCourses(user.id)
      .then((list) => {
        setCourses(list);
        if (list.length > 0) setCourseId(list[0].id);
      })
      .finally(() => setCoursesLoading(false));
  }, [user]);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    let valid = true;
    if (!topic.trim()) { setTopicError("Topic is required"); valid = false; }
    else setTopicError("");
    if (!courseId) { setCourseError("Select a course"); valid = false; }
    else setCourseError("");
    if (!valid) return;

    setLoading(true);
    try {
      await createEntry(courseId, {
        studyDate,
        topic: topic.trim(),
        durationMins,
        notes: notes || undefined,
      });
      notifyChange();
      onLogged?.();
      toast("Session logged", "success");
      onClose();
    } catch {
      toast("Failed to log session", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Course selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Course
        </label>
        {coursesLoading ? (
          <div className="h-10 rounded-xl bg-zinc-100 animate-pulse" />
        ) : courses.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No courses yet — add a course first.
          </p>
        ) : (
          <div className="relative">
            <select
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setCourseError(""); }}
              className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-9 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>
        )}
        {courseError && <p className="text-xs text-red-500">{courseError}</p>}
      </div>

      <Input
        label="Topic"
        placeholder="e.g. Binary Trees, Chapter 4"
        value={topic}
        onChange={(e) => { setTopic(e.target.value); setTopicError(""); }}
        error={topicError}
      />

      <Input
        label="Date"
        type="date"
        value={studyDate}
        onChange={(e) => setStudyDate(e.target.value)}
      />

      {/* Duration */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Duration —{" "}
          <span className="font-semibold text-violet-600">
            {durationLabel(durationMins)}
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDurationMins(d)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                durationMins === d
                  ? "border-violet-600 bg-violet-600 text-white shadow-sm shadow-violet-200"
                  : "border-zinc-200 bg-white text-zinc-500 hover:border-violet-200 hover:text-violet-500"
              }`}
            >
              {d >= 60 ? `${d / 60}h` : `${d}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Notes
        </label>
        <textarea
          rows={2}
          placeholder="What did you cover?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={loading} disabled={courses.length === 0}>
          Log Session
        </Button>
      </div>
    </form>
  );
}

export default function QuickLogModal({
  open,
  onClose,
  onLogged,
}: {
  open: boolean;
  onClose: () => void;
  onLogged?: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log Study Session"
      icon={<Clock size={15} />}
      iconClassName="bg-violet-50 text-violet-500"
    >
      <QuickLogForm key={open ? "open" : "closed"} onClose={onClose} onLogged={onLogged} />
    </Modal>
  );
}

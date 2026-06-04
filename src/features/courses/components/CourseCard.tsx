import { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../services/courseService";
import ConfirmDialog from "../../../shared/components/ui/ConfirmDialog";

function ProgressRing({ progress, color }: { progress: number; color: string }) {
  const size = 44;
  const sw = 3.5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress / 100);
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f4f4f5" strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
      />
    </svg>
  );
}

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

export default function CourseCard({
  course,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const semesterLabel = course.semester
    ? /^\d+$/.test(course.semester)
      ? `Semester ${course.semester}`
      : course.semester
    : null;

  return (
    <>
      <div
        onClick={() => navigate(`/courses/${course.id}`)}
        className="relative flex cursor-pointer flex-col rounded-2xl bg-white border border-zinc-100 overflow-hidden transition-all duration-200 hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50 hover:-translate-y-0.5 active:scale-[0.99]"
      >
        {/* Color bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: course.color }} />

        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="text-sm font-bold tracking-tight text-zinc-900 truncate">
                {course.name}
              </span>
              <div className="flex items-center gap-2">
                {course.code && (
                  <span
                    className="inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: course.color }}
                  >
                    {course.code}
                  </span>
                )}
                {semesterLabel && (
                  <span className="text-[10px] text-zinc-400 truncate">
                    {semesterLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all duration-150"
                aria-label="Edit course"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmOpen(true);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
                aria-label="Delete course"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              {course.completedTasks} of {course.totalTasks} done
            </p>
            <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
              <ProgressRing progress={course.progress} color={course.color} />
              <span
                className="absolute text-[10px] font-bold leading-none"
                style={{ color: course.progress > 0 ? course.color : "#a1a1aa" }}
              >
                {course.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Course"
        message={`Delete "${course.name}"? All tasks and study sessions for this course will also be removed.`}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(course.id);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}

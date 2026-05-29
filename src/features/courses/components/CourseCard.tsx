import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Pencil, Trash2, BookOpen } from "lucide-react";
import type { Course } from "../services/courseService";

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
  const [menuOpen, setMenuOpen] = useState(false);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(course.id);
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit(course);
  }

  return (
    <div
      onClick={() => navigate(`/courses/${course.id}`)}
      className="group relative flex cursor-pointer flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
    >
      {/* Color bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: course.color }} />

      <div className="flex flex-col gap-3 p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="truncate text-sm font-bold text-gray-900 leading-tight">
              {course.name}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: course.color }}
              >
                {course.code}
              </span>
              {course.semester && (
                <span className="text-[10px] text-gray-400 truncate">
                  {course.semester}
                </span>
              )}
            </div>
          </div>

          {/* Kebab menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((p) => !p);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 top-8 z-20 min-w-[130px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                  <button
                    onClick={handleEdit}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-bold" style={{ color: course.color }}>
              {course.progress}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${course.progress}%`,
                backgroundColor: course.color,
              }}
            />
          </div>
        </div>

        {/* Task count */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <BookOpen size={12} />
          <span>
            {course.completedTasks}/{course.totalTasks} tasks done
          </span>
        </div>
      </div>
    </div>
  );
}

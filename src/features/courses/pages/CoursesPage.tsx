import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus, BookOpen } from "lucide-react";
import { useCourses } from "../hooks/useCourses";
import CourseCard from "../components/CourseCard";
import CourseFormModal from "../components/CourseFormModal";
import { CourseCardSkeleton } from "../../../shared/components/ui/Skeleton";
import EmptyState from "../../../shared/components/ui/EmptyState";
import type { Course, CourseFormData } from "../services/courseService";

export default function CoursesPage() {
  const { courses, loading, addCourse, editCourse, removeCourse } =
    useCourses();
  const location = useLocation();
  // Auto-open the form when sent here from the Getting Started checklist.
  const [modalOpen, setModalOpen] = useState(
    () => (location.state as { autoNew?: boolean } | null)?.autoNew === true,
  );
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  function openAdd() {
    setEditingCourse(null);
    setModalOpen(true);
  }
  function openEdit(course: Course) {
    setEditingCourse(course);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditingCourse(null);
  }

  async function handleSubmit(form: CourseFormData) {
    if (editingCourse) await editCourse(editingCourse.id, form);
    else await addCourse(form);
  }

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300">
      <div className="px-5 pt-10 pb-5">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Library
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">
          Courses
        </h1>
        {!loading && (
          <p className="mt-0.5 text-sm text-zinc-400">
            {courses.length} enrolled
          </p>
        )}
      </div>

      <div className="flex-1 px-5 pb-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={20} strokeWidth={1.5} />}
            title="No courses yet"
            description="Tap the + button to add your first course"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course, i) => (
              <div
                key={course.id}
                style={{ animation: `stagger-in 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 75}ms both` }}
              >
                <CourseCard
                  course={course}
                  onEdit={openEdit}
                  onDelete={removeCourse}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB — positioned above dock */}
      <button
        onClick={openAdd}
        className="fixed bottom-[5.5rem] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-300 transition-all duration-200 hover:bg-indigo-700 hover:scale-105 active:scale-95"
        aria-label="Add course"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <CourseFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editingCourse={editingCourse}
      />
    </div>
  );
}

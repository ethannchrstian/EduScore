import { useState } from "react";
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
  const [modalOpen, setModalOpen] = useState(false);
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
    if (editingCourse) {
      await editCourse(editingCourse.id, form);
    } else {
      await addCourse(form);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading…"
              : `${courses.length} course${courses.length !== 1 ? "s" : ""} enrolled`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={26} />}
            title="No courses yet"
            description="Tap the + button to add your first course"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEdit={openEdit}
                onDelete={removeCourse}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-all duration-150 hover:bg-indigo-700 active:scale-95"
        aria-label="Add course"
      >
        <Plus size={24} strokeWidth={2.5} />
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

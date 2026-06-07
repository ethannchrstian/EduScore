import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "../../../shared/context/AuthContext";
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type Course,
  type CourseFormData,
} from "../services/courseService";
import { useToast } from "../../../shared/context/ToastContext";

// Postgres unique-violation → human message. The constraint is on
// (user_id, code, semester), so a clash means a real duplicate course code.
function courseErrorMessage(err: unknown, fallback: string): string {
  if ((err as { code?: string })?.code === "23505")
    return "A course with that code already exists for this semester";
  return fallback;
}

interface UseCoursesReturn {
  courses: Course[];
  loading: boolean;
  addCourse: (form: CourseFormData) => Promise<void>;
  editCourse: (id: string, form: CourseFormData) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCourses(): UseCoursesReturn {
  const { user } = useAuthContext();
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const userRef = useRef(user);
  const toastRef = useRef(toast);

  useEffect(() => {
    userRef.current = user;
  }, [user]);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  const load = useCallback(async () => {
    if (!userRef.current) return;
    try {
      const data = await fetchCourses(userRef.current.id);
      setCourses(data);
    } catch {
      toastRef.current("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!userRef.current) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchCourses(userRef.current.id);
        if (!cancelled) setCourses(data);
      } catch {
        if (!cancelled) toastRef.current("Failed to load courses", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const addCourse = useCallback(async (form: CourseFormData) => {
    if (!userRef.current) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic: Course = {
      id: tempId,
      userId: userRef.current.id,
      ...form,
      description: form.description ?? null,
      semester: form.semester ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      totalTasks: 0,
      completedTasks: 0,
    };
    setCourses((prev) => [optimistic, ...prev]);
    try {
      const created = await createCourse(userRef.current.id, form);
      setCourses((prev) => prev.map((c) => (c.id === tempId ? created : c)));
      toastRef.current("Course added", "success");
    } catch (err) {
      setCourses((prev) => prev.filter((c) => c.id !== tempId));
      toastRef.current(courseErrorMessage(err, "Failed to add course"), "error");
    }
  }, []);

  const editCourse = useCallback(
    async (id: string, form: CourseFormData) => {
      setCourses((all) =>
        all.map((c) =>
          c.id === id
            ? {
                ...c,
                ...form,
                description: form.description ?? null,
                semester: form.semester ?? null,
              }
            : c,
        ),
      );
      try {
        const updated = await updateCourse(id, form);
        setCourses((all) => all.map((c) => (c.id === id ? updated : c)));
        toastRef.current("Course updated", "success");
      } catch (err) {
        load();
        toastRef.current(
          courseErrorMessage(err, "Failed to update course"),
          "error",
        );
      }
    },
    [load],
  );

  const removeCourse = useCallback(
    async (id: string) => {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      try {
        await deleteCourse(id);
        toastRef.current("Course deleted", "success");
      } catch {
        load();
        toastRef.current("Failed to delete course", "error");
      }
    },
    [load],
  );

  return {
    courses,
    loading,
    addCourse,
    editCourse,
    removeCourse,
    refresh: load,
  };
}

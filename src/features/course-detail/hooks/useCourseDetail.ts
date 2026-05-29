import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../config/supabase";
import type { Course } from "../../courses/services/courseService";
import { useToast } from "../../../shared/context/ToastContext";

interface RawCourse {
  id: string;
  user_id: string;
  name: string;
  code: string;
  description: string | null;
  semester: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  tugas: { status: string }[];
}

function mapCourse(raw: RawCourse): Course {
  const tasks = raw.tugas ?? [];
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  return {
    id: raw.id,
    userId: raw.user_id,
    name: raw.name,
    code: raw.code,
    description: raw.description,
    semester: raw.semester,
    color: raw.color ?? "#6366f1",
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    progress:
      tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
    totalTasks: tasks.length,
    completedTasks: completed,
  };
}

export function useCourseDetail(courseId: string) {
  const toast = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const { data, error } = await supabase
          .from("matakuliah")
          .select("*, tugas(status)")
          .eq("id", courseId)
          .single();
        if (error) throw error;
        if (!cancelled) setCourse(mapCourse(data as RawCourse));
      } catch {
        if (!cancelled) toastRef.current("Failed to load course", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // Re-derive progress whenever called (after task mutations)
  const refreshProgress = async () => {
    try {
      const { data, error } = await supabase
        .from("matakuliah")
        .select("*, tugas(status)")
        .eq("id", courseId)
        .single();
      if (error) throw error;
      setCourse(mapCourse(data as RawCourse));
    } catch {
      // silent — progress will sync on next full load
    }
  };

  return { course, loading, refreshProgress };
}

import { supabase } from "../../../config/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Course {
  id: string;
  userId: string;
  name: string;
  code: string;
  description: string | null;
  semester: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  // Derived — computed client-side from task counts
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export interface CourseFormData {
  name: string;
  code: string;
  description?: string;
  semester?: string;
  color: string;
}

// Raw row from Supabase (snake_case, with task aggregate)
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveProgress(tasks: { status: string }[]) {
  if (tasks.length === 0)
    return { progress: 0, totalTasks: 0, completedTasks: 0 };
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  return {
    progress: Math.round((completed / tasks.length) * 100),
    totalTasks: tasks.length,
    completedTasks: completed,
  };
}

function mapCourse(raw: RawCourse): Course {
  const { progress, totalTasks, completedTasks } = deriveProgress(
    raw.tugas ?? [],
  );
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
    progress,
    totalTasks,
    completedTasks,
  };
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function fetchCourses(userId: string): Promise<Course[]> {
  const { data, error } = await supabase
    .from("matakuliah")
    .select("*, tugas(status)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as RawCourse[]).map(mapCourse);
}

export async function createCourse(
  userId: string,
  form: CourseFormData,
): Promise<Course> {
  const { data, error } = await supabase
    .from("matakuliah")
    .insert({
      user_id: userId,
      name: form.name,
      code: form.code,
      description: form.description ?? null,
      semester: form.semester ?? null,
      color: form.color,
    })
    .select("*, tugas(status)")
    .single();

  if (error) throw error;
  return mapCourse(data as RawCourse);
}

export async function updateCourse(
  id: string,
  form: CourseFormData,
): Promise<Course> {
  const { data, error } = await supabase
    .from("matakuliah")
    .update({
      name: form.name,
      code: form.code,
      description: form.description ?? null,
      semester: form.semester ?? null,
      color: form.color,
    })
    .eq("id", id)
    .select("*, tugas(status)")
    .single();

  if (error) throw error;
  return mapCourse(data as RawCourse);
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase.from("matakuliah").delete().eq("id", id);
  if (error) throw error;
}

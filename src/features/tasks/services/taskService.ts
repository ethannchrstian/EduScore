import { supabase } from "../../../config/supabase";

export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "LATE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  matakuliahId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
}

interface RawTask {
  id: string;
  matakuliah_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapTask(raw: RawTask): Task {
  let status = raw.status;
  if (status !== "COMPLETED" && raw.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(raw.due_date);
    due.setHours(0, 0, 0, 0);
    if (due < today) status = "LATE";
  }
  return {
    id: raw.id,
    matakuliahId: raw.matakuliah_id,
    title: raw.title,
    description: raw.description,
    dueDate: raw.due_date,
    priority: raw.priority,
    status,
    completedAt: raw.completed_at,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function fetchTasks(matakuliahId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tugas")
    .select("*")
    .eq("matakuliah_id", matakuliahId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as RawTask[]).map(mapTask);
}

export interface SearchTask {
  id: string;
  title: string;
  matakuliahId: string;
  courseName: string;
  courseColor: string;
  status: TaskStatus;
  dueDate: string | null;
}

interface RawSearchTask {
  id: string;
  title: string;
  status: TaskStatus;
  due_date: string | null;
  matakuliah_id: string;
  matakuliah: { name: string; color: string; user_id: string };
}

// All of a user's tasks across courses, with course info — used for search.
export async function fetchAllTasks(userId: string): Promise<SearchTask[]> {
  const { data, error } = await supabase
    .from("tugas")
    .select(
      "id, title, status, due_date, matakuliah_id, matakuliah!inner(name, color, user_id)",
    )
    .eq("matakuliah.user_id", userId);
  if (error) throw error;
  return (data as unknown as RawSearchTask[]).map((r) => ({
    id: r.id,
    title: r.title,
    matakuliahId: r.matakuliah_id,
    courseName: r.matakuliah.name,
    courseColor: r.matakuliah.color,
    status: r.status,
    dueDate: r.due_date,
  }));
}

export async function createTask(
  matakuliahId: string,
  form: TaskFormData,
): Promise<Task> {
  const { data, error } = await supabase
    .from("tugas")
    .insert({
      matakuliah_id: matakuliahId,
      title: form.title,
      description: form.description ?? null,
      due_date: form.dueDate ?? null,
      priority: form.priority,
      status: form.status,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapTask(data as RawTask);
}

export async function updateTask(
  id: string,
  form: Partial<TaskFormData>,
): Promise<Task> {
  const payload: Record<string, unknown> = {};
  if (form.title !== undefined) payload.title = form.title;
  if (form.description !== undefined)
    payload.description = form.description ?? null;
  if (form.dueDate !== undefined) payload.due_date = form.dueDate ?? null;
  if (form.priority !== undefined) payload.priority = form.priority;
  if (form.status !== undefined) {
    payload.status = form.status;
    payload.completed_at =
      form.status === "COMPLETED" ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from("tugas")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapTask(data as RawTask);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tugas").delete().eq("id", id);
  if (error) throw error;
}

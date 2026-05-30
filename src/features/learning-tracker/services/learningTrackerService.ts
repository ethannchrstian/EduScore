import { supabase } from "../../../config/supabase";

export interface TrackerEntry {
  id: string;
  matakuliahId: string;
  studyDate: string;
  topic: string;
  durationMins: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackerFormData {
  studyDate: string;
  topic: string;
  durationMins: number;
  notes?: string;
}

interface RawEntry {
  id: string;
  matakuliah_id: string;
  study_date: string;
  topic: string;
  duration_mins: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapEntry(raw: RawEntry): TrackerEntry {
  return {
    id: raw.id,
    matakuliahId: raw.matakuliah_id,
    studyDate: raw.study_date,
    topic: raw.topic,
    durationMins: raw.duration_mins,
    notes: raw.notes,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function fetchEntries(
  matakuliahId: string,
): Promise<TrackerEntry[]> {
  const { data, error } = await supabase
    .from("learning_tracker")
    .select("*")
    .eq("matakuliah_id", matakuliahId)
    .order("study_date", { ascending: false });
  if (error) throw error;
  return (data as RawEntry[]).map(mapEntry);
}

export async function fetchTodayMinutes(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("learning_tracker")
    .select("duration_mins, matakuliah!inner(user_id)")
    .eq("matakuliah.user_id", userId)
    .eq("study_date", today);
  if (error) throw error;
  return (data as { duration_mins: number }[]).reduce(
    (sum, r) => sum + r.duration_mins,
    0,
  );
}

export async function createEntry(
  matakuliahId: string,
  form: TrackerFormData,
): Promise<TrackerEntry> {
  const { data, error } = await supabase
    .from("learning_tracker")
    .insert({
      matakuliah_id: matakuliahId,
      study_date: form.studyDate,
      topic: form.topic,
      duration_mins: form.durationMins,
      notes: form.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapEntry(data as RawEntry);
}

export async function updateEntry(
  id: string,
  form: TrackerFormData,
): Promise<TrackerEntry> {
  const { data, error } = await supabase
    .from("learning_tracker")
    .update({
      study_date: form.studyDate,
      topic: form.topic,
      duration_mins: form.durationMins,
      notes: form.notes ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapEntry(data as RawEntry);
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from("learning_tracker")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export interface AllTrackerEntry extends TrackerEntry {
  courseName: string;
  courseColor: string;
}

interface RawAllEntry extends RawEntry {
  matakuliah: { name: string; color: string; user_id: string };
}

export async function fetchAllEntries(userId: string): Promise<AllTrackerEntry[]> {
  const { data, error } = await supabase
    .from("learning_tracker")
    .select("*, matakuliah!inner(name, color, user_id)")
    .eq("matakuliah.user_id", userId)
    .order("study_date", { ascending: false });
  if (error) throw error;
  return (data as unknown as RawAllEntry[]).map((raw) => ({
    ...mapEntry(raw),
    courseName: raw.matakuliah.name,
    courseColor: raw.matakuliah.color,
  }));
}

import { supabase } from "../../../config/supabase";

export interface DashboardTask {
  id: string;
  matakuliahId: string;
  title: string;
  courseName: string;
  courseColor: string;
  dueDate: string;
  status: string;
}

export interface StudyLog {
  duration_mins: number;
  study_date: string;
}

export interface DashboardData {
  overallProgress: number;
  totalTasks: number;
  completedTasks: number;
  urgentTasks: DashboardTask[];
  studyLogs: StudyLog[];
  totalCourses: number;
}

interface RawTask {
  id: string;
  matakuliah_id: string;
  title: string;
  status: string;
  due_date: string;
  matakuliah: {
    name: string;
    color: string;
  };
}

export async function fetchDashboardData(
  userId: string,
): Promise<DashboardData> {
  // Fetch all tasks with course info
  const { data: tasksData, error: tasksError } = await supabase
    .from("tugas")
    .select(
      "id, matakuliah_id, title, status, due_date, matakuliah!inner(name, color, user_id)",
    )
    .eq("matakuliah.user_id", userId);

  if (tasksError) throw tasksError;

  const tasks = (tasksData ?? []) as unknown as RawTask[];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const overallProgress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Urgent = not completed, has due date, due within 7 days or overdue
  const now = new Date();
  const sevenDaysOut = new Date(now);
  sevenDaysOut.setDate(now.getDate() + 7);

  const urgentTasks: DashboardTask[] = tasks
    .filter((t) => {
      if (t.status === "COMPLETED" || !t.due_date) return false;
      const due = new Date(t.due_date);
      return due <= sevenDaysOut;
    })
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    )
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      matakuliahId: t.matakuliah_id,
      title: t.title,
      courseName: t.matakuliah.name,
      courseColor: t.matakuliah.color,
      dueDate: t.due_date,
      status: t.status,
    }));

  // Study logs for metrics
  const { data: trackerData, error: trackerError } = await supabase
    .from("learning_tracker")
    .select("duration_mins, study_date, matakuliah!inner(user_id)")
    .eq("matakuliah.user_id", userId);

  if (trackerError) throw trackerError;
  const studyLogs = (trackerData ?? []).map((r) => ({
    duration_mins: r.duration_mins,
    study_date: r.study_date,
  }));

  // Course count
  const { count } = await supabase
    .from("matakuliah")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  return {
    overallProgress,
    totalTasks,
    completedTasks,
    urgentTasks,
    studyLogs,
    totalCourses: count ?? 0,
  };
}

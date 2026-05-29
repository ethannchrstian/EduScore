import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  type Task,
  type TaskFormData,
  type TaskStatus,
} from "../services/taskService";
import { useToast } from "../../../shared/context/ToastContext";

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  addTask: (form: TaskFormData) => Promise<void>;
  editTask: (id: string, form: Partial<TaskFormData>) => Promise<void>;
  toggleStatus: (id: string, current: TaskStatus) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
}

export function useTasks(matakuliahId: string): UseTasksReturn {
  const toast = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await fetchTasks(matakuliahId);
        if (!cancelled) setTasks(data);
      } catch {
        if (!cancelled) toastRef.current("Failed to load tasks", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [matakuliahId]);

  const addTask = useCallback(
    async (form: TaskFormData) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: Task = {
        id: tempId,
        matakuliahId,
        title: form.title,
        description: form.description ?? null,
        dueDate: form.dueDate ?? null,
        priority: form.priority,
        status: form.status,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => [optimistic, ...prev]);
      try {
        const created = await createTask(matakuliahId, form);
        setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
        toastRef.current("Task added", "success");
      } catch {
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        toastRef.current("Failed to add task", "error");
      }
    },
    [matakuliahId],
  );

  const editTask = useCallback(
    async (id: string, form: Partial<TaskFormData>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...form } : t)),
      );
      try {
        const updated = await updateTask(id, form);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        toastRef.current("Task updated", "success");
      } catch {
        toastRef.current("Failed to update task", "error");
      }
    },
    [],
  );

  const toggleStatus = useCallback(async (id: string, current: TaskStatus) => {
    // Cycle: NOT_STARTED → COMPLETED → NOT_STARTED
    const next: TaskStatus =
      current === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: next,
              completedAt:
                next === "COMPLETED" ? new Date().toISOString() : null,
            }
          : t,
      ),
    );
    try {
      const updated = await updateTask(id, { status: next });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      // Revert
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: current } : t)),
      );
      toastRef.current("Failed to update task", "error");
    }
  }, []);

  const removeTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
      toastRef.current("Task deleted", "success");
    } catch {
      toastRef.current("Failed to delete task", "error");
    }
  }, []);

  return { tasks, loading, addTask, editTask, toggleStatus, removeTask };
}

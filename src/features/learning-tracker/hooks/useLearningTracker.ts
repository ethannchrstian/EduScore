import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  type TrackerEntry,
  type TrackerFormData,
} from "../services/learningTrackerService";
import { useToast } from "../../../shared/context/ToastContext";

interface UseLearningTrackerReturn {
  entries: TrackerEntry[];
  loading: boolean;
  totalMins: number;
  addEntry: (form: TrackerFormData) => Promise<void>;
  editEntry: (id: string, form: TrackerFormData) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

export function useLearningTracker(
  matakuliahId: string,
): UseLearningTrackerReturn {
  const toast = useToast();
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(toast);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await fetchEntries(matakuliahId);
        if (!cancelled) setEntries(data);
      } catch {
        if (!cancelled) toastRef.current("Failed to load study log", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [matakuliahId]);

  const totalMins = entries.reduce((sum, e) => sum + e.durationMins, 0);

  const addEntry = useCallback(
    async (form: TrackerFormData) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: TrackerEntry = {
        id: tempId,
        matakuliahId,
        studyDate: form.studyDate,
        topic: form.topic,
        durationMins: form.durationMins,
        notes: form.notes ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEntries((prev) => [optimistic, ...prev]);
      try {
        const created = await createEntry(matakuliahId, form);
        setEntries((prev) => prev.map((e) => (e.id === tempId ? created : e)));
        toastRef.current("Session logged", "success");
      } catch {
        setEntries((prev) => prev.filter((e) => e.id !== tempId));
        toastRef.current("Failed to log session", "error");
      }
    },
    [matakuliahId],
  );

  const editEntry = useCallback(async (id: string, form: TrackerFormData) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...form, notes: form.notes ?? null } : e,
      ),
    );
    try {
      const updated = await updateEntry(id, form);
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      toastRef.current("Session updated", "success");
    } catch {
      toastRef.current("Failed to update session", "error");
    }
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteEntry(id);
      toastRef.current("Session deleted", "success");
    } catch {
      toastRef.current("Failed to delete session", "error");
    }
  }, []);

  return { entries, loading, totalMins, addEntry, editEntry, removeEntry };
}

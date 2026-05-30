import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../../../shared/context/AuthContext";
import {
  fetchDashboardData,
  type DashboardData,
} from "../services/dashboardService";
import { useToast } from "../../../shared/context/ToastContext";

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const EMPTY: DashboardData = {
  overallProgress: 0,
  totalTasks: 0,
  completedTasks: 0,
  urgentTasks: [],
  studyLogs: [],
  totalCourses: 0,
};

export function useDashboardData(): UseDashboardDataReturn {
  const { user } = useAuthContext();
  const toast = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const toastRef = useRef(toast);
  const userRef = useRef(user);
  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const load = async () => {
    if (!userRef.current) {
      setLoading(false);
      return;
    }
    try {
      const result = await fetchDashboardData(userRef.current.id);
      setData(result);
    } catch {
      toastRef.current("Failed to load dashboard", "error");
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!userRef.current) {
        setLoading(false);
        return;
      }
      try {
        const result = await fetchDashboardData(userRef.current.id);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) {
          toastRef.current("Failed to load dashboard", "error");
          setData(EMPTY);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, refresh: load };
}

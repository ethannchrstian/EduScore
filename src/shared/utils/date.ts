export function getCountdownLabel(dueDate: string): {
  label: string;
  color: string;
  bgColor: string;
} {
  const due = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - now.getTime()) / 86400000);

  if (diffDays < 0)
    return { label: "Overdue", color: "text-red-600", bgColor: "bg-red-50" };
  if (diffDays === 0)
    return { label: "Due today", color: "text-red-600", bgColor: "bg-red-50" };
  if (diffDays === 1)
    return {
      label: "1 day left",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    };
  if (diffDays <= 3)
    return {
      label: `${diffDays} days left`,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    };
  return {
    label: `${diffDays} days left`,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  };
}

export function formatDuration(mins: number): string {
  if (mins === 0) return "0m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

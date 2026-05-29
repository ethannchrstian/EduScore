import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

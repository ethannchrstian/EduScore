import { cn } from "../../utils/cn";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-gray-200", className)} />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-1.5 w-full bg-gray-200" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

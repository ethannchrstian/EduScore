import { cn } from "../../utils/cn";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-zinc-100", className)} />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-white border border-zinc-100 overflow-hidden">
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-1 w-full rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

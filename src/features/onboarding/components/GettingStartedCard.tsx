import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  BookOpen,
  ListTodo,
  Clock,
  Check,
  Lock,
  ChevronRight,
  Compass,
  X,
} from "lucide-react";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { cn } from "../../../shared/utils/cn";
import { useTour } from "./TourProvider";

type StepKey = "course" | "task" | "log";

interface Props {
  loading: boolean;
  hasCourse: boolean;
  hasTask: boolean;
  hasLog: boolean;
  /** The user's most recent course — where the "create a task" step sends them. */
  firstCourseId: string | null;
}

const STEPS: {
  key: StepKey;
  label: string;
  hint: string;
  icon: typeof BookOpen;
  circle: string; // tinted icon circle while pending
  highlight: string; // bg + ring when this is the next step
  segment: string; // progress segment fill
  accent: string; // arrow color when this is the next step
}[] = [
  {
    key: "course",
    label: "Add your first course",
    hint: "Organize your subjects",
    icon: BookOpen,
    circle: "border-indigo-200 bg-indigo-50 text-indigo-500",
    highlight: "bg-indigo-50/80 ring-indigo-100",
    segment: "bg-indigo-500",
    accent: "text-indigo-500",
  },
  {
    key: "task",
    label: "Create a task",
    hint: "Track an assignment or deadline",
    icon: ListTodo,
    circle: "border-amber-200 bg-amber-50 text-amber-500",
    highlight: "bg-amber-50/80 ring-amber-100",
    segment: "bg-amber-500",
    accent: "text-amber-500",
  },
  {
    key: "log",
    label: "Log a study session",
    hint: "Record your study time",
    icon: Clock,
    circle: "border-violet-200 bg-violet-50 text-violet-500",
    highlight: "bg-violet-50/80 ring-violet-100",
    segment: "bg-violet-500",
    accent: "text-violet-500",
  },
];

const CONFETTI_COLORS = [
  "#6366f1", "#8b5cf6", "#22c55e", "#f97316",
  "#ec4899", "#eab308", "#14b8a6", "#06b6d4",
];

// Deterministic pseudo-random in [0, 1) — pure, so it's safe during render
// and the confetti scatter looks identically varied every time.
function rand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function CelebrationView() {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * 360 + (rand(i + 1) - 0.5) * 20;
        const dist = 45 + rand(i + 50) * 55;
        return {
          tx: Math.cos((angle * Math.PI) / 180) * dist,
          ty: Math.sin((angle * Math.PI) / 180) * dist,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          size: 6 + Math.floor(rand(i + 100) * 6),
          delay: rand(i + 150) * 0.1,
          dur: 0.7 + rand(i + 200) * 0.3,
        };
      }),
    [],
  );

  return (
    <div className="flex flex-col items-center gap-1 py-3 text-center">
      <div className="relative flex items-center justify-center">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animation: `burst-out ${p.dur}s ease-out ${p.delay}s both`,
            } as React.CSSProperties}
          />
        ))}
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"
          style={{ animation: "big-check-in 0.55s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <Check size={32} strokeWidth={2.5} className="text-white" />
        </div>
      </div>
      <p className="mt-2 text-sm font-bold text-zinc-900">You're all set! 🎉</p>
      <p className="text-xs text-zinc-400">Your workspace is ready to go.</p>
    </div>
  );
}

export default function GettingStartedCard({
  loading,
  hasCourse,
  hasTask,
  hasLog,
  firstCourseId,
}: Props) {
  const { user } = useAuthContext();
  const { startTour } = useTour();
  const navigate = useNavigate();
  const uid = user?.id ?? "anon";
  const dismissedKey = `eduscore_gs_dismissed_${uid}`;
  // Marks that the user has begun (but not finished) onboarding. Lets the
  // celebration fire even when the final step is completed on another page.
  const progressKey = `eduscore_gs_inprogress_${uid}`;

  const done: Record<StepKey, boolean> = {
    course: hasCourse,
    task: hasTask,
    log: hasLog,
  };
  const doneCount = [hasCourse, hasTask, hasLog].filter(Boolean).length;
  const allDone = doneCount === 3;

  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(dismissedKey) === "1";
    } catch {
      return false;
    }
  });
  // null = undecided (loading); then "checklist" | "celebrate" | "hidden".
  const [mode, setMode] = useState<
    "checklist" | "celebrate" | "hidden" | null
  >(null);
  const [leaving, setLeaving] = useState(false);
  const celebratedRef = useRef(false);

  const handleDismiss = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => {
      setDismissed(true);
      try {
        localStorage.setItem(dismissedKey, "1");
        localStorage.removeItem(progressKey);
      } catch {
        /* ignore */
      }
    }, 280);
  }, [dismissedKey, progressKey]);

  // Decide what to render once data has loaded.
  useEffect(() => {
    if (loading || dismissed) return;
    let inProgress = false;
    try {
      inProgress = localStorage.getItem(progressKey) === "1";
    } catch {
      /* ignore */
    }
    let next: "checklist" | "celebrate" | "hidden";
    if (!allDone) {
      try {
        localStorage.setItem(progressKey, "1");
      } catch {
        /* ignore */
      }
      next = "checklist";
    } else if (inProgress) {
      // Finished onboarding (possibly on another page) — celebrate.
      next = "celebrate";
    } else {
      // Already set up before onboarding existed — stay out of the way.
      next = "hidden";
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(next);
  }, [loading, dismissed, allDone, progressKey]);

  // Run the celebration once, then auto-dismiss.
  useEffect(() => {
    if (mode !== "celebrate" || celebratedRef.current) return;
    celebratedRef.current = true;
    const t = window.setTimeout(() => handleDismiss(), 3000);
    return () => window.clearTimeout(t);
  }, [mode, handleDismiss]);

  // --- Visibility ---------------------------------------------------------
  if (dismissed || mode === null || mode === "hidden") return null;
  const celebrating = mode === "celebrate";

  const locked: Record<StepKey, boolean> = {
    course: false,
    task: !hasCourse,
    log: !hasCourse,
  };
  const nextKey = STEPS.find((s) => !done[s.key])?.key;

  function handleStepClick(key: StepKey) {
    if (done[key] || locked[key]) return;
    if (key === "course") {
      navigate("/courses", { state: { autoNew: true } });
    } else if (key === "task") {
      // Tasks live inside a course — drop them into their course.
      if (firstCourseId) {
        navigate(`/courses/${firstCourseId}`, { state: { autoNewTask: true } });
      } else {
        navigate("/courses", { state: { autoNew: true } });
      }
    } else {
      navigate("/tracker", { state: { autoLog: true } });
    }
  }

  return (
    <div
      style={{
        animation: leaving
          ? "gs-leave 0.28s ease-in forwards"
          : "stagger-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-5 shadow-sm">
        {celebrating ? (
          <CelebrationView />
        ) : (
          <>
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-violet-200">
                  <Rocket size={17} />
                </div>
                <p className="text-sm font-bold tracking-tight text-zinc-900">
                  Getting Started
                </p>
              </div>
              <button
                onClick={handleDismiss}
                aria-label="Dismiss getting started"
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Primary CTA — orient first: see where everything lives */}
            <button
              type="button"
              onClick={startTour}
              className="group relative flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-left text-white transition-all hover:from-indigo-700 hover:to-violet-700"
              style={{ animation: "tour-pulse 2s ease-in-out infinite" }}
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <Compass size={18} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-bold">Take a quick tour</span>
                <span className="text-xs text-indigo-100">
                  See where everything lives
                </span>
              </span>
              <ChevronRight
                size={18}
                className="flex-shrink-0 text-indigo-100 transition-transform group-hover:translate-x-0.5"
              />
            </button>

            {/* Then, the setup steps */}
            <div className="mb-3 mt-5 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                Set up your workspace
              </p>
              <p className="text-[11px] font-semibold text-zinc-400">
                {doneCount} of 3
              </p>
            </div>

            {/* Segmented progress — one color per step */}
            <div className="mb-4 flex gap-1.5">
              {STEPS.map((step) => (
                <div
                  key={step.key}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100"
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      step.segment,
                    )}
                    style={{ width: done[step.key] ? "100%" : "0%" }}
                  />
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-1.5">
              {STEPS.map((step, i) => {
                const isDone = done[step.key];
                const isLocked = locked[step.key];
                const isNext = !isDone && !isLocked && step.key === nextKey;
                const clickable = !isDone && !isLocked;
                const Icon = step.icon;

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handleStepClick(step.key)}
                    disabled={!clickable}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                      isNext && `ring-1 ring-inset ${step.highlight}`,
                      clickable
                        ? "cursor-pointer hover:bg-zinc-50 active:scale-[0.99]"
                        : "cursor-default",
                    )}
                    style={{
                      animation: `stagger-in 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 70}ms both`,
                    }}
                  >
                    {/* Status circle */}
                    <span
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isLocked
                            ? "border-zinc-200 bg-zinc-50 text-zinc-300"
                            : step.circle,
                      )}
                    >
                      {isDone ? (
                        // Keyed so it mounts (and pops) exactly when the step completes
                        <span
                          key="check"
                          className="flex"
                          style={{ animation: "check-pop 0.45s cubic-bezier(0.16,1,0.3,1)" }}
                        >
                          <Check size={15} strokeWidth={3} />
                        </span>
                      ) : (
                        <Icon size={14} />
                      )}
                    </span>

                    {/* Label */}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isDone ? "text-zinc-400 line-through" : "text-zinc-900",
                        )}
                      >
                        {step.label}
                      </span>
                      <span className="truncate text-xs text-zinc-400">
                        {isLocked ? "Add a course first" : step.hint}
                      </span>
                    </span>

                    {/* Trailing affordance */}
                    {isDone ? null : isLocked ? (
                      <Lock size={13} className="flex-shrink-0 text-zinc-300" />
                    ) : (
                      <ChevronRight
                        size={16}
                        className={cn(
                          "flex-shrink-0",
                          isNext ? step.accent : "text-zinc-300",
                        )}
                        style={
                          isNext
                            ? { animation: "nudge-x 1.3s ease-in-out infinite" }
                            : undefined
                        }
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

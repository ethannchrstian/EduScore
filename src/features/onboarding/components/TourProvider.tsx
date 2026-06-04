import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { X } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

interface TourStep {
  selector: string;
  title: string;
  body: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="nav-dashboard"]',
    title: "Dashboard",
    body: "Your home base — overall progress and the tasks due soon, all in one glance.",
  },
  {
    selector: '[data-tour="nav-courses"]',
    title: "Courses",
    body: "All your courses live here. Open one to add tasks and log study time for it.",
  },
  {
    selector: '[data-tour="nav-tracker"]',
    title: "Study Log",
    body: "Track and review every study session across all of your courses.",
  },
  {
    selector: '[data-tour="fab"]',
    title: "The + button",
    body: "Tap + to quickly add a task from anywhere. On the Courses page it adds a course, and in the Study Log it logs a session.",
  },
];

interface TourContextValue {
  startTour: () => void;
}

const TourContext = createContext<TourContextValue>({ startTour: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useTour = () => useContext(TourContext);

interface Layout {
  rect: DOMRect | null;
  vw: number;
  vh: number;
}

const PAD = 8;

function TourOverlay({
  steps,
  onClose,
}: {
  steps: TourStep[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [layout, setLayout] = useState<Layout>({ rect: null, vw: 0, vh: 0 });
  const step = steps[index];

  // Measure the current target after render and on resize.
  useLayoutEffect(() => {
    const measure = () => {
      const el = document.querySelector(step.selector);
      setLayout({
        rect: el ? el.getBoundingClientRect() : null,
        vw: window.innerWidth,
        vh: window.innerHeight,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [step.selector]);

  // Lock background scroll while the tour is open.
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const { rect, vw, vh } = layout;
  const isLast = index === steps.length - 1;

  function next() {
    if (isLast) onClose();
    else setIndex((i) => i + 1);
  }
  function back() {
    setIndex((i) => Math.max(0, i - 1));
  }

  // --- Geometry -----------------------------------------------------------
  const spotlight = rect
    ? {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
        bottom: rect.bottom + PAD,
      }
    : null;

  const tooltipWidth = Math.min(300, vw - 32);
  const targetCenterX = rect ? rect.left + rect.width / 2 : vw / 2;
  const tooltipLeft = Math.max(
    16,
    Math.min(targetCenterX - tooltipWidth / 2, vw - 16 - tooltipWidth),
  );
  // Place tooltip above the target when it sits in the lower half of the screen.
  const placeAbove = rect ? rect.top > vh / 2 : false;
  const caretLeft = Math.max(
    18,
    Math.min(targetCenterX - tooltipLeft, tooltipWidth - 18),
  );

  const tooltipStyle: React.CSSProperties = {
    width: tooltipWidth,
    left: tooltipLeft,
    ...(placeAbove
      ? { bottom: vh - (spotlight?.top ?? 0) + 12 }
      : { top: (spotlight?.bottom ?? 0) + 12 }),
  };

  return (
    <div className="fixed inset-0 z-[120]">
      {/* Spotlight (box-shadow dims everything except the target) */}
      {spotlight ? (
        <div
          className="absolute rounded-2xl transition-all duration-300 ease-out"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: "0 0 0 9999px rgba(9, 9, 11, 0.72)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-zinc-950/70" />
      )}

      {/* Tooltip */}
      <div key={index} className="absolute" style={tooltipStyle}>
        <div
          className="relative rounded-2xl bg-white p-4 shadow-2xl shadow-zinc-900/30"
          style={{ animation: "stagger-in 0.25s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {/* Caret */}
          <span
            className="absolute h-3 w-3 rotate-45 bg-white"
            style={
              placeAbove
                ? { bottom: -5, left: caretLeft - 6 }
                : { top: -5, left: caretLeft - 6 }
            }
          />

          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">
              Step {index + 1} of {steps.length}
            </span>
            <button
              onClick={onClose}
              aria-label="Skip tour"
              className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          <p className="text-sm font-bold tracking-tight text-zinc-900">
            {step.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">{step.body}</p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200",
                    i === index ? "w-4 bg-indigo-600" : "w-1.5 bg-zinc-200",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  onClick={back}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                {isLast ? "Done" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [running, setRunning] = useState(false);
  const startTour = useCallback(() => setRunning(true), []);

  return (
    <TourContext.Provider value={{ startTour }}>
      {children}
      {running && (
        <TourOverlay steps={TOUR_STEPS} onClose={() => setRunning(false)} />
      )}
    </TourContext.Provider>
  );
}

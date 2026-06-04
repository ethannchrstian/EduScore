import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, BookOpen, Search, X, ListFilter } from "lucide-react";
import { useCourses } from "../hooks/useCourses";
import { useAuthContext } from "../../../shared/context/AuthContext";
import CourseCard from "../components/CourseCard";
import CourseFormModal from "../components/CourseFormModal";
import { PALETTE } from "../colors";
import { CourseCardSkeleton } from "../../../shared/components/ui/Skeleton";
import EmptyState from "../../../shared/components/ui/EmptyState";
import { cn } from "../../../shared/utils/cn";
import { fetchAllTasks, type SearchTask } from "../../tasks/services/taskService";
import type { Course, CourseFormData } from "../services/courseService";

interface SemesterGroup {
  key: string;
  label: string;
  chip: string;
  courses: Course[];
}

function semesterLabel(course: Course): string | null {
  if (!course.semester) return null;
  return /^\d+$/.test(course.semester)
    ? `Semester ${course.semester}`
    : course.semester;
}

function buildGroups(courses: Course[]): SemesterGroup[] {
  const map = new Map<string, Course[]>();
  for (const c of courses) {
    const key = c.semester && /^\d+$/.test(c.semester) ? c.semester : "none";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return Array.from(map.keys())
    .sort((a, b) => {
      if (a === "none") return 1;
      if (b === "none") return -1;
      return Number(b) - Number(a);
    })
    .map((k) => ({
      key: k,
      label: k === "none" ? "Unscheduled" : `Semester ${k}`,
      chip: k === "none" ? "Other" : `Sem ${k}`,
      courses: map.get(k)!,
    }));
}

export default function CoursesPage() {
  const { courses, loading, addCourse, editCourse, removeCourse } =
    useCourses();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  // Auto-open the form when sent here from the Getting Started checklist.
  const [modalOpen, setModalOpen] = useState(
    () => (location.state as { autoNew?: boolean } | null)?.autoNew === true,
  );
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeSemester, setActiveSemester] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [allTasks, setAllTasks] = useState<SearchTask[]>([]);

  // Auto-pick a color not already used by another course (user can still change it).
  const suggestedColor = useMemo(() => {
    const used = new Set(courses.map((c) => c.color.toLowerCase()));
    return (
      PALETTE.find((c) => !used.has(c.toLowerCase())) ??
      PALETTE[courses.length % PALETTE.length]
    );
  }, [courses]);

  // Load all tasks once for search.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchAllTasks(user.id)
      .then((t) => {
        if (!cancelled) setAllTasks(t);
      })
      .catch(() => {
        /* search is non-critical */
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const groups = useMemo(() => buildGroups(courses), [courses]);
  const grouped = groups.length > 1;
  const visibleGroups =
    activeSemester === "all"
      ? groups
      : groups.filter((g) => g.key === activeSemester);
  const effectiveGroups = visibleGroups.length > 0 ? visibleGroups : groups;
  const activeFilterLabel =
    activeSemester === "all"
      ? "All semesters"
      : groups.find((g) => g.key === activeSemester)?.label ?? "All semesters";

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const courseMatches = useMemo(
    () =>
      searching
        ? courses.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              (c.code && c.code.toLowerCase().includes(q)),
          )
        : [],
    [searching, courses, q],
  );
  const taskMatches = useMemo(
    () =>
      searching ? allTasks.filter((t) => t.title.toLowerCase().includes(q)) : [],
    [searching, allTasks, q],
  );
  const noResults = searching && courseMatches.length === 0 && taskMatches.length === 0;

  function openAdd() {
    setEditingCourse(null);
    setModalOpen(true);
  }
  function openEdit(course: Course) {
    setEditingCourse(course);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditingCourse(null);
  }

  async function handleSubmit(form: CourseFormData) {
    if (editingCourse) await editCourse(editingCourse.id, form);
    else await addCourse(form);
  }

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-300">
      <div className="px-5 pt-10 pb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
          Library
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-900">
          Courses
        </h1>
        {!loading && (
          <p className="mt-0.5 text-sm text-zinc-400">
            {courses.length} enrolled
          </p>
        )}
      </div>

      {/* Search */}
      {!loading && courses.length > 0 && (
        <div className="px-5 mb-4">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses & tasks"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Semester filter (hidden while searching) */}
      {!loading && grouped && !searching && (
        <div className="mb-4 flex justify-end px-5">
          <div className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-200"
            >
              <ListFilter size={13} />
              {activeFilterLabel}
            </button>
            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setFilterOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl border border-zinc-100 bg-white p-1 shadow-xl animate-in zoom-in-95 duration-150">
                  {[
                    { key: "all", label: "All semesters", count: courses.length },
                    ...groups.map((g) => ({
                      key: g.key,
                      label: g.label,
                      count: g.courses.length,
                    })),
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setActiveSemester(opt.key);
                        setFilterOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
                        activeSemester === opt.key
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-zinc-600 hover:bg-zinc-50",
                      )}
                    >
                      {opt.label}
                      <span
                        className={
                          activeSemester === opt.key
                            ? "text-indigo-300"
                            : "text-zinc-300"
                        }
                      >
                        {opt.count}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 px-5 pb-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={20} strokeWidth={1.5} />}
            title="No courses yet"
            description="Tap the + button to add your first course"
          />
        ) : searching ? (
          // --- Search results ---
          noResults ? (
            <EmptyState
              icon={<Search size={20} strokeWidth={1.5} />}
              title="No matches"
              description={`Nothing found for "${query.trim()}"`}
            />
          ) : (
            <div className="flex flex-col gap-6">
              {courseMatches.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Courses
                  </p>
                  <div className="flex flex-col gap-2">
                    {courseMatches.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/courses/${c.id}`)}
                        className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-100"
                      >
                        <span
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${c.color}1a`, color: c.color }}
                        >
                          <BookOpen size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900">
                            {c.name}
                          </p>
                          <p className="truncate text-xs text-zinc-400">
                            {[c.code, semesterLabel(c)].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {taskMatches.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Tasks
                  </p>
                  <div className="flex flex-col gap-2">
                    {taskMatches.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => navigate(`/courses/${t.matakuliahId}`)}
                        className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-100"
                      >
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: t.courseColor }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900">
                            {t.title}
                          </p>
                          <p className="truncate text-xs text-zinc-400">
                            {t.courseName}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        ) : grouped ? (
          <div className="flex flex-col gap-6">
            {effectiveGroups.map((group) => (
              <div key={group.key}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    {group.label}
                  </span>
                  <span className="text-xs font-medium text-zinc-300">
                    {group.courses.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {group.courses.map((course, i) => (
                    <div
                      key={course.id}
                      style={{ animation: `stagger-in 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}
                    >
                      <CourseCard
                        course={course}
                        onEdit={openEdit}
                        onDelete={removeCourse}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course, i) => (
              <div
                key={course.id}
                style={{ animation: `stagger-in 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 75}ms both` }}
              >
                <CourseCard
                  course={course}
                  onEdit={openEdit}
                  onDelete={removeCourse}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB — positioned above dock */}
      <button
        onClick={openAdd}
        className="fixed bottom-[5.5rem] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-300 transition-all duration-200 hover:bg-indigo-700 hover:scale-105 active:scale-95"
        aria-label="Add course"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <CourseFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editingCourse={editingCourse}
        defaultColor={suggestedColor}
      />
    </div>
  );
}

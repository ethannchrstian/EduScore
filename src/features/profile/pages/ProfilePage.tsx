import { useState } from "react";
import {
  LogOut,
  User,
  Mail,
  BookOpen,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../shared/context/AuthContext";
import { useDashboardData } from "../../dashboard/hooks/useDashboardData";
import { signOut } from "../../auth/services/authService";
import { useToast } from "../../../shared/context/ToastContext";
import { formatDuration } from "../../../shared/utils/date";
import Button from "../../../shared/components/ui/Button";

export default function ProfilePage() {
  const { user } = useAuthContext();
  const { data } = useDashboardData();
  const toast = useToast();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ?? "Student";
  const email = user?.email ?? "";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await signOut();
    if (error) {
      toast("Failed to sign out", "error");
      setSigningOut(false);
    } else {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-400 mt-0.5">Your account & stats</p>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-24">
        {/* Avatar + name card */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white text-xl font-bold shadow-md shadow-indigo-100">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg font-bold text-gray-900 truncate">
              {fullName}
            </span>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-0.5">
              <Mail size={13} />
              <span className="truncate">{email}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Your Stats
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
              <BookOpen size={18} className="text-indigo-400" />
              <span className="text-xl font-extrabold text-gray-900">
                {data?.totalCourses ?? "—"}
              </span>
              <span className="text-[10px] text-gray-400 text-center leading-tight">
                Courses
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span className="text-xl font-extrabold text-gray-900">
                {data?.completedTasks ?? "—"}
              </span>
              <span className="text-[10px] text-gray-400 text-center leading-tight">
                Tasks Done
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
              <Clock size={18} className="text-blue-400" />
              <span className="text-xl font-extrabold text-gray-900">
                {data ? formatDuration(data.todayStudyMins) : "—"}
              </span>
              <span className="text-[10px] text-gray-400 text-center leading-tight">
                Today
              </span>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Account
          </p>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm divide-y divide-gray-50">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <User size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Full name</span>
                <span className="text-sm font-medium text-gray-900">
                  {fullName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Mail size={16} className="text-gray-400 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-gray-400">Email</span>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <Button
          variant="danger"
          size="lg"
          className="w-full"
          loading={signingOut}
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

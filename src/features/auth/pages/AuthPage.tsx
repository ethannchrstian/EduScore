import { useState } from "react";
import { Navigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { useAuthContext } from "../../../shared/context/AuthContext";

type Tab = "login" | "register";

export default function AuthPage() {
  const { user, loading } = useAuthContext();
  const [tab, setTab] = useState<Tab>("login");

  // Already authenticated → push to dashboard
  if (!loading && user) return <Navigate to="/" replace />;

  // While checking session, show nothing (ProtectedRoute handles its own spinner)
  if (loading) return null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-12">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <GraduationCap size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              EduScore
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Your academic command center
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all duration-200 ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/60">
          {tab === "login" ? (
            <LoginForm onSwitch={() => setTab("register")} />
          ) : (
            <RegisterForm onSwitch={() => setTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
}

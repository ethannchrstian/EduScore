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
  if (!loading && user) return <Navigate to="/" replace />;
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <GraduationCap size={26} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              EduScore
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Your academic command center
            </p>
          </div>
        </div>

        <div className="mb-5 flex rounded-xl bg-zinc-100 p-1">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${tab === t ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
            >
              {t === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
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

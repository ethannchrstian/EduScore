import { useState } from "react";
import { Navigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import { useAuthContext } from "../../../shared/context/AuthContext";

type Tab = "login" | "register" | "forgot";

const COPY: Record<Tab, { title: string; subtitle: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to pick up where you left off.",
  },
  register: {
    title: "Create your account",
    subtitle: "Start tracking your courses and deadlines.",
  },
  forgot: {
    title: "Reset your password",
    subtitle: "Enter your email and we'll send you a reset link.",
  },
};

export default function AuthPage() {
  const { user, loading } = useAuthContext();
  const [tab, setTab] = useState<Tab>("login");

  if (!loading && user) return <Navigate to="/" replace />;
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );

  return (
    <AuthShell title={COPY[tab].title} subtitle={COPY[tab].subtitle}>
      {tab === "login" && <LoginForm onForgot={() => setTab("forgot")} />}
      {tab === "register" && (
        <RegisterForm onSwitch={() => setTab("login")} />
      )}
      {tab === "forgot" && (
        <ForgotPasswordForm onBack={() => setTab("login")} />
      )}

      {tab !== "forgot" && (
        <p className="mt-7 text-center text-sm text-slate-400">
          {tab === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => setTab(tab === "login" ? "register" : "login")}
            className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
          >
            {tab === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      )}
    </AuthShell>
  );
}

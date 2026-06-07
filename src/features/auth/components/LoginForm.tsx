import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import AuthField from "./AuthField";
import Button from "../../../shared/components/ui/Button";
import { signIn } from "../services/authService";
import { useToast } from "../../../shared/context/ToastContext";

export default function LoginForm({ onForgot }: { onForgot: () => void }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  function emailError(v: string) {
    if (!v.trim()) return "Email is required";
    if (!v.includes("@")) return "Enter a valid email";
    return undefined;
  }
  function passwordError(v: string) {
    if (!v) return "Password is required";
    return undefined;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = { email: emailError(email), password: passwordError(password) };
    setErrors(e);
    setTouched({ email: true, password: true });
    if (e.email || e.password) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) toast(error.message, "error");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <AuthField
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@university.edu"
        leftIcon={<Mail size={15} />}
        value={email}
        onChange={(ev) => {
          setEmail(ev.target.value);
          if (touched.email)
            setErrors((p) => ({ ...p, email: emailError(ev.target.value) }));
        }}
        onBlur={() => {
          setTouched((p) => ({ ...p, email: true }));
          setErrors((p) => ({ ...p, email: emailError(email) }));
        }}
        error={touched.email ? errors.email : undefined}
      />
      <AuthField
        label="Password"
        revealable
        autoComplete="current-password"
        placeholder="Enter your password"
        leftIcon={<Lock size={15} />}
        value={password}
        onChange={(ev) => {
          setPassword(ev.target.value);
          if (touched.password)
            setErrors((p) => ({ ...p, password: passwordError(ev.target.value) }));
        }}
        onBlur={() => {
          setTouched((p) => ({ ...p, password: true }));
          setErrors((p) => ({ ...p, password: passwordError(password) }));
        }}
        error={touched.password ? errors.password : undefined}
      />
      <button
        type="button"
        onClick={onForgot}
        className="-mt-1 self-end text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
      >
        Forgot password?
      </button>
      <Button type="submit" size="lg" className="mt-1 w-full" loading={loading}>
        Sign in <ArrowRight size={16} />
      </Button>
    </form>
  );
}

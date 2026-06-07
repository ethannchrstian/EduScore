import { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import AuthField from "./AuthField";
import PasswordStrength from "./PasswordStrength";
import Button from "../../../shared/components/ui/Button";
import { signUp } from "../services/authService";
import { useToast } from "../../../shared/context/ToastContext";

export default function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<{
    fullName?: boolean;
    email?: boolean;
    password?: boolean;
  }>({});

  function nameError(v: string) {
    return v.trim() ? undefined : "Full name is required";
  }
  function emailError(v: string) {
    if (!v.trim()) return "Email is required";
    if (!v.includes("@")) return "Enter a valid email";
    return undefined;
  }
  function passwordError(v: string) {
    if (!v) return "Password is required";
    if (v.length < 8) return "At least 8 characters";
    return undefined;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = {
      fullName: nameError(fullName),
      email: emailError(email),
      password: passwordError(password),
    };
    setErrors(e);
    setTouched({ fullName: true, email: true, password: true });
    if (e.fullName || e.email || e.password) return;

    setLoading(true);
    const { error, emailInUse } = await signUp(email, password, fullName);
    setLoading(false);
    if (emailInUse) {
      setErrors((p) => ({
        ...p,
        email: "An account with this email already exists",
      }));
      setTouched((p) => ({ ...p, email: true }));
    } else if (error) {
      toast(error.message, "error");
    } else {
      setDone(true);
    }
  }

  if (done)
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg text-emerald-500">
          ✓
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Check your inbox</p>
          <p className="mt-1 text-sm text-zinc-400">
            Confirm <strong className="text-zinc-700">{email}</strong> then sign
            in
          </p>
        </div>
        <button
          onClick={onSwitch}
          className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          Back to sign in
        </button>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <AuthField
        label="Full Name"
        type="text"
        autoComplete="name"
        placeholder="Jane Doe"
        leftIcon={<User size={15} />}
        value={fullName}
        onChange={(ev) => {
          setFullName(ev.target.value);
          if (touched.fullName)
            setErrors((p) => ({ ...p, fullName: nameError(ev.target.value) }));
        }}
        onBlur={() => {
          setTouched((p) => ({ ...p, fullName: true }));
          setErrors((p) => ({ ...p, fullName: nameError(fullName) }));
        }}
        error={touched.fullName ? errors.fullName : undefined}
      />
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
      <div className="flex flex-col gap-2">
        <AuthField
          label="Password"
          revealable
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          leftIcon={<Lock size={15} />}
          value={password}
          onChange={(ev) => {
            setPassword(ev.target.value);
            if (touched.password)
              setErrors((p) => ({
                ...p,
                password: passwordError(ev.target.value),
              }));
          }}
          onBlur={() => {
            setTouched((p) => ({ ...p, password: true }));
            setErrors((p) => ({ ...p, password: passwordError(password) }));
          }}
          error={touched.password ? errors.password : undefined}
        />
        <PasswordStrength password={password} />
      </div>
      <Button type="submit" size="lg" className="mt-1 w-full" loading={loading}>
        Create account <ArrowRight size={16} />
      </Button>
    </form>
  );
}

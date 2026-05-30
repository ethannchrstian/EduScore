import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import { signUp } from "../services/authService";
import { useToast } from "../../../shared/context/ToastContext";

export default function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<typeof fields>>({});

  function validate() {
    const e: Partial<typeof fields> = {};
    if (!fields.fullName.trim()) e.fullName = "Required";
    if (!fields.email.includes("@")) e.email = "Enter a valid email";
    if (fields.password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error, emailInUse } = await signUp(
      fields.email,
      fields.password,
      fields.fullName,
    );
    setLoading(false);
    if (emailInUse) {
      setErrors((prev) => ({ ...prev, email: "An account with this email already exists" }));
    } else if (error) {
      toast(error.message, "error");
    } else {
      setDone(true);
    }
  }

  if (done)
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-900 text-lg">
          ✓
        </div>
        <div>
          <p className="font-semibold text-zinc-900">Check your inbox</p>
          <p className="text-sm text-zinc-400 mt-1">
            Confirm <strong>{fields.email}</strong> then sign in
          </p>
        </div>
        <button
          onClick={onSwitch}
          className="text-xs font-medium text-zinc-900 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Full Name"
        type="text"
        placeholder="Jane Doe"
        autoComplete="name"
        leftIcon={<User size={14} />}
        value={fields.fullName}
        onChange={(e) => setFields((p) => ({ ...p, fullName: e.target.value }))}
        error={errors.fullName}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@university.edu"
        autoComplete="email"
        leftIcon={<Mail size={14} />}
        value={fields.email}
        onChange={(e) => setFields((p) => ({ ...p, email: e.target.value }))}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Min. 6 characters"
        autoComplete="new-password"
        leftIcon={<Lock size={14} />}
        value={fields.password}
        onChange={(e) => setFields((p) => ({ ...p, password: e.target.value }))}
        error={errors.password}
      />
      <Button type="submit" size="lg" className="w-full mt-1" loading={loading}>
        Create account
      </Button>
      <p className="text-center text-xs text-zinc-400">
        Have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-zinc-900 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

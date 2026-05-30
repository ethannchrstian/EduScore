import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import { signIn } from "../services/authService";
import { useToast } from "../../../shared/context/ToastContext";

export default function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof fields>>({});

  function validate() {
    const e: Partial<typeof fields> = {};
    if (!fields.email.includes("@")) e.email = "Enter a valid email";
    if (fields.password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signIn(fields.email, fields.password);
    setLoading(false);
    if (error) toast(error.message, "error");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        placeholder="••••••••"
        autoComplete="current-password"
        leftIcon={<Lock size={14} />}
        value={fields.password}
        onChange={(e) => setFields((p) => ({ ...p, password: e.target.value }))}
        error={errors.password}
      />
      <Button type="submit" size="lg" className="w-full mt-1" loading={loading}>
        Sign in
      </Button>
      <p className="text-center text-xs text-zinc-400">
        No account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-zinc-900 hover:underline"
        >
          Register
        </button>
      </p>
    </form>
  );
}

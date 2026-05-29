import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import Button from "../../../shared/components/ui/Button";
import Input from "../../../shared/components/ui/Input";
import { signUp } from "../services/authService";
import { useToast } from "../../../shared/context/ToastContext";

interface RegisterFormProps {
  onSwitch: () => void;
}

export default function RegisterForm({ onSwitch }: RegisterFormProps) {
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
    if (!fields.fullName.trim()) e.fullName = "Full name is required";
    if (!fields.email.includes("@")) e.email = "Enter a valid email";
    if (fields.password.length < 6)
      e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp(
      fields.email,
      fields.password,
      fields.fullName,
    );
    setLoading(false);
    if (error) {
      toast(error.message, "error");
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-2xl">
          ✓
        </div>
        <h3 className="font-bold text-gray-900">Check your inbox</h3>
        <p className="text-sm text-gray-500">
          We sent a confirmation link to <strong>{fields.email}</strong>.
          Confirm it, then sign in.
        </p>
        <button
          onClick={onSwitch}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Full Name"
        type="text"
        placeholder="Jane Doe"
        autoComplete="name"
        leftIcon={<User size={16} />}
        value={fields.fullName}
        onChange={(e) => setFields((p) => ({ ...p, fullName: e.target.value }))}
        error={errors.fullName}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@university.edu"
        autoComplete="email"
        leftIcon={<Mail size={16} />}
        value={fields.email}
        onChange={(e) => setFields((p) => ({ ...p, email: e.target.value }))}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Min. 6 characters"
        autoComplete="new-password"
        leftIcon={<Lock size={16} />}
        value={fields.password}
        onChange={(e) => setFields((p) => ({ ...p, password: e.target.value }))}
        error={errors.password}
      />
      <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
        Create Account
      </Button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-indigo-600 hover:underline"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}

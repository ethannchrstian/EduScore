import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import AuthField from "./AuthField";
import Button from "../../../shared/components/ui/Button";
import { requestPasswordReset } from "../services/authService";
import { useToast } from "../../../shared/context/ToastContext";

export default function ForgotPasswordForm({
  onBack,
}: {
  onBack: () => void;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  function emailError(v: string) {
    if (!v.trim()) return "Email is required";
    if (!v.includes("@")) return "Enter a valid email";
    return undefined;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = emailError(email);
    setError(e);
    setTouched(true);
    if (e) return;

    setLoading(true);
    const { error: reqError } = await requestPasswordReset(email);
    setLoading(false);
    if (reqError) toast(reqError.message, "error");
    else setDone(true);
  }

  if (done)
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg text-emerald-500">
          ✓
        </div>
        <div>
          <p className="font-semibold text-indigo-950">Check your inbox</p>
          <p className="mt-1 text-sm text-slate-500">
            If <strong className="text-slate-700">{email}</strong> has an
            account, a reset link is on its way.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
        >
          Back to sign in
        </button>
      </div>
    );

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
          if (touched) setError(emailError(ev.target.value));
        }}
        onBlur={() => {
          setTouched(true);
          setError(emailError(email));
        }}
        error={touched ? error : undefined}
      />
      <Button type="submit" size="lg" className="mt-1 w-full" loading={loading}>
        Send reset link <ArrowRight size={16} />
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="mx-auto flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
      >
        <ArrowLeft size={13} /> Back to sign in
      </button>
    </form>
  );
}

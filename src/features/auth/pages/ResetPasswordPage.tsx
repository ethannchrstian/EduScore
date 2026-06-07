import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import AuthShell from "../components/AuthShell";
import AuthField from "../components/AuthField";
import PasswordStrength from "../components/PasswordStrength";
import Button from "../../../shared/components/ui/Button";
import { updatePassword } from "../services/authService";
import { useToast } from "../../../shared/context/ToastContext";

export default function ResetPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});
  const [touched, setTouched] = useState<{
    password?: boolean;
    confirm?: boolean;
  }>({});

  function passwordError(v: string) {
    if (!v) return "Password is required";
    if (v.length < 8) return "At least 8 characters";
    return undefined;
  }
  function confirmError(v: string, pw: string) {
    if (!v) return "Please confirm your password";
    if (v !== pw) return "Passwords don't match";
    return undefined;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = {
      password: passwordError(password),
      confirm: confirmError(confirm, password),
    };
    setErrors(e);
    setTouched({ password: true, confirm: true });
    if (e.password || e.confirm) return;

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      toast(error.message, "error");
    } else {
      setDone(true);
    }
  }

  if (done)
    return (
      <AuthShell
        title="Password updated"
        subtitle="Your new password is ready to use."
      >
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg text-emerald-500">
            ✓
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/", { replace: true })}
          >
            Continue to EduScore <ArrowRight size={16} />
          </Button>
        </div>
      </AuthShell>
    );

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password for your account."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <AuthField
            label="New Password"
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
              if (touched.confirm)
                setErrors((p) => ({
                  ...p,
                  confirm: confirmError(confirm, ev.target.value),
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
        <AuthField
          label="Confirm Password"
          revealable
          autoComplete="new-password"
          placeholder="Re-enter your password"
          leftIcon={<Lock size={15} />}
          value={confirm}
          onChange={(ev) => {
            setConfirm(ev.target.value);
            if (touched.confirm)
              setErrors((p) => ({
                ...p,
                confirm: confirmError(ev.target.value, password),
              }));
          }}
          onBlur={() => {
            setTouched((p) => ({ ...p, confirm: true }));
            setErrors((p) => ({
              ...p,
              confirm: confirmError(confirm, password),
            }));
          }}
          error={touched.confirm ? errors.confirm : undefined}
        />
        <Button type="submit" size="lg" className="mt-1 w-full" loading={loading}>
          Update password <ArrowRight size={16} />
        </Button>
      </form>
    </AuthShell>
  );
}

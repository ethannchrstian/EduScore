// Deterministic password strength scoring (no randomness — keeps lint happy).
// Returns 0–4 based on length and character variety.
function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const LEVELS = [
  { label: "Too weak", color: "bg-red-500", text: "text-red-500" },
  { label: "Weak", color: "bg-red-500", text: "text-red-500" },
  { label: "Fair", color: "bg-amber-500", text: "text-amber-500" },
  { label: "Good", color: "bg-indigo-500", text: "text-indigo-500" },
  { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" },
];

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);
  const level = LEVELS[score];

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? level.color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${level.text}`}>
        Password strength: {level.label}
      </p>
    </div>
  );
}

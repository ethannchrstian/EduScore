import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  // Password fields: render a show/hide toggle and own the type.
  revealable?: boolean;
}

// Auth input matching the app's light form styling, plus a show/hide toggle.
export default function AuthField({
  label,
  error,
  leftIcon,
  revealable,
  type,
  id,
  className,
  ...props
}: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const inputType = revealable ? (show ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-xs font-medium uppercase tracking-wide text-slate-500"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          type={inputType}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400",
            "transition-all duration-150 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20",
            leftIcon && "pl-10",
            revealable && "pr-10",
            error && "border-red-300 focus:border-red-400 focus:ring-red-100",
            className,
          )}
          {...props}
        />
        {revealable && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

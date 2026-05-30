import React from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none gap-2";
  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-sm shadow-indigo-200",
    ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200",
    outline:
      "bg-transparent border border-zinc-200 text-zinc-700 hover:bg-zinc-50",
    danger: "bg-transparent border border-red-200 text-red-500 hover:bg-red-50",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
  };
  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

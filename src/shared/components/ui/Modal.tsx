import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Optional icon shown in a colored badge before the title. */
  icon?: React.ReactNode;
  /** Tailwind classes for the icon badge, e.g. "bg-indigo-50 text-indigo-500". */
  iconClassName?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
  icon,
  iconClassName,
}: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-zinc-950/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-t-2xl bg-white px-5 pb-8 pt-4 shadow-2xl shadow-zinc-900/10 sm:rounded-2xl",
          "animate-in slide-in-from-bottom-4 duration-200",
          className,
        )}
      >
        <div className="mx-auto mb-5 h-1 w-8 rounded-full bg-zinc-200 sm:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {icon && (
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl",
                  iconClassName ?? "bg-zinc-100 text-zinc-500",
                )}
              >
                {icon}
              </span>
            )}
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

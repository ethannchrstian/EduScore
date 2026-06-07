import React from "react";

// Shared auth screen frame: animated aurora background + centered content,
// navy heading. Used by the login/register page and the reset-password page.
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 px-6 py-12">
      {/* Animated aurora background — cohesive blue → indigo → violet family */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          data-aurora
          className="absolute -left-24 -top-12 h-72 w-72 rounded-full bg-indigo-400/35 blur-3xl"
          style={{ animation: "aurora-a 18s ease-in-out infinite" }}
        />
        <div
          data-aurora
          className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-blue-400/30 blur-3xl"
          style={{ animation: "aurora-b 23s ease-in-out infinite" }}
        />
        <div
          data-aurora
          className="absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl"
          style={{ animation: "aurora-c 20s ease-in-out infinite" }}
        />
        <div
          data-aurora
          className="absolute bottom-12 right-6 h-56 w-56 rounded-full bg-indigo-300/25 blur-3xl"
          style={{ animation: "aurora-a 27s ease-in-out infinite" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-indigo-600">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

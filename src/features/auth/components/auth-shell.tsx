import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: ReactNode;
}>) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-foreground p-4 font-mono text-background sm:p-6">
      <Card className="w-full max-w-lg border-background/10 bg-background/5 text-background ring-background/10">
        <CardHeader className="gap-3">
          <Link
            href="/"
            className="w-fit text-sm font-semibold text-background underline-offset-4 hover:text-background hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            LegacyLift
          </Link>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-sm leading-6 text-background/80">{description}</p>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}

export function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  describedBy,
  autoComplete,
}: Readonly<{
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  describedBy?: string;
  autoComplete?: string;
}>) {
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={[describedBy, error ? errorId : undefined].filter(Boolean).join(" ") || undefined}
        className="h-10 w-full rounded-lg border border-background/30 bg-background/10 px-3 text-sm text-background placeholder:text-background/70 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
      />
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

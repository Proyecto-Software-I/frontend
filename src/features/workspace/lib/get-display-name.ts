import type { AuthUser } from "@/features/auth/types/auth";

export function getDisplayName(user: AuthUser): string {
  const displayName = user.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  const fullName = [user.firstName, user.lastName]
    .filter((name): name is string => Boolean(name?.trim()))
    .join(" ");

  return fullName || user.email;
}

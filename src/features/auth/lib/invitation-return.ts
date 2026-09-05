export function getValidInvitationReturnTo(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  if (!/^\/invite\/[^/?#]+$/.test(value)) {
    return null;
  }

  const token = value.slice("/invite/".length);

  try {
    const decodedToken = decodeURIComponent(token);
    return decodedToken.length > 0 && !decodedToken.includes("/")
      ? value
      : null;
  } catch {
    return null;
  }
}

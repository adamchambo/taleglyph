export function readPreference<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`talechemy.v1.${key}`);
    return raw ? ((JSON.parse(raw) as T) ?? fallback) : fallback;
  } catch {
    return fallback;
  }
}
export function writePreference(key: string, value: unknown) {
  try {
    localStorage.setItem(`talechemy.v1.${key}`, JSON.stringify(value));
  } catch {
    /* Storage can be unavailable in private sessions. */
  }
}

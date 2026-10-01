const prefix = "taleglyph.v1.";
const previousPrefix = "talechemy.v1.";

export function readPreference<T>(key: string, fallback: T): T {
  try {
    const raw =
      localStorage.getItem(prefix + key) ??
      localStorage.getItem(previousPrefix + key);
    return raw ? ((JSON.parse(raw) as T) ?? fallback) : fallback;
  } catch {
    return fallback;
  }
}
export function writePreference(key: string, value: unknown) {
  try {
    localStorage.setItem(prefix + key, JSON.stringify(value));
  } catch {
    /* Storage can be unavailable in private sessions. */
  }
}

import { createContext, useContext } from "react";
export const decorations = [
  "none",
  "botanical",
  "orbital",
  "ruled",
  "graph",
  "stars",
] as const;
export type Decoration = (typeof decorations)[number];
export type Appearance = {
  mode: "light" | "dark";
  accent: "sage" | "violet" | "blue" | "ember";
  decoration: Decoration;
};
export const ThemeContext = createContext<{
  appearance: Appearance;
  setAppearance: (value: Appearance) => void;
} | null>(null);
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("Theme provider required");
  return value;
}

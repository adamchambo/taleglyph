import { createContext, useContext } from "react";
export type Appearance = {
  mode: "light" | "dark";
  accent: "sage" | "violet" | "blue" | "ember";
  decoration: "none" | "botanical" | "orbital";
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

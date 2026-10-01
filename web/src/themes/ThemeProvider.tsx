import { useState, type ReactNode } from "react";
import { decorations, ThemeContext, type Appearance } from "./themeContext";
import { readPreference, writePreference } from "../lib/preferences";
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setState] = useState<Appearance>(() => {
    const v = readPreference<Partial<Appearance>>("appearance", {});
    return {
      mode: v?.mode === "dark" ? "dark" : "light",
      accent: ["sage", "violet", "blue", "ember"].includes(v?.accent ?? "")
        ? v.accent!
        : "sage",
      decoration:
        v.decoration && decorations.includes(v.decoration)
          ? v.decoration
          : "none",
    };
  });
  function setAppearance(value: Appearance) {
    setState(value);
    writePreference("appearance", value);
  }
  return (
    <ThemeContext.Provider value={{ appearance, setAppearance }}>
      <div
        className="app-root"
        data-theme={appearance.mode}
        data-accent={appearance.accent}
        data-decoration={appearance.decoration}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

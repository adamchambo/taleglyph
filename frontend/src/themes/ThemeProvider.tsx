import { useState, type ReactNode } from "react";
import { ThemeContext, type Theme } from "./themeContext";
import "./fantasy.css";
import "./scifi.css";
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("fantasy");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="app-root" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

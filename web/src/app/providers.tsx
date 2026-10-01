import type { ReactNode } from "react";
import { ThemeProvider } from "../themes/ThemeProvider";
export function AppProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

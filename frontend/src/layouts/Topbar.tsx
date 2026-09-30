import { useTheme } from "../themes/themeContext";
export function Topbar() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="topbar">
      <span>Creative workspace</span>
      <label>
        World theme
        <select
          value={theme}
          onChange={(event) =>
            setTheme(event.target.value === "scifi" ? "scifi" : "fantasy")
          }
        >
          <option value="fantasy">Fantasy</option>
          <option value="scifi">Sci-fi</option>
        </select>
      </label>
    </header>
  );
}

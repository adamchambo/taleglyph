import { useTheme, type Appearance } from "../../../themes/themeContext";
export function AppearancePage() {
  const { appearance, setAppearance } = useTheme();
  return (
    <section className="library-page">
      <p className="eyebrow">Make room for your imagination</p>
      <h1>Make it yours.</h1>
      <p className="intro">
        A quiet canvas or a little atmosphere. Your tools stay in the same
        place.
      </p>
      <div className="appearance-grid">
        {(
          [
            {
              key: "mode",
              title: "Light & dark",
              items: [
                ["light", "Light"],
                ["dark", "Dark"],
              ],
            },
            {
              key: "accent",
              title: "Studio accent",
              items: [
                ["sage", "Sage"],
                ["violet", "Iris"],
                ["blue", "Ink blue"],
                ["ember", "Ember"],
              ],
            },
            {
              key: "decoration",
              title: "A touch of atmosphere",
              items: [
                ["none", "Clean"],
                ["botanical", "Botanical"],
                ["orbital", "Orbital"],
              ],
            },
          ] as const
        ).map((group) => (
          <fieldset key={group.key}>
            <legend>{group.title}</legend>
            <div className="choice-row">
              {group.items.map(([value, label]) => (
                <label
                  key={value}
                  className={`appearance-choice ${appearance[group.key] === value ? "selected" : ""}`}
                  data-swatch={group.key === "accent" ? value : undefined}
                >
                  <input
                    type="radio"
                    name={group.key}
                    value={value}
                    checked={appearance[group.key] === value}
                    onChange={() =>
                      setAppearance({
                        ...appearance,
                        [group.key]: value,
                      } as Appearance)
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <p className="muted">
        Appearance is saved on this device. Genre and tone tags live in each
        story’s details.
      </p>
    </section>
  );
}

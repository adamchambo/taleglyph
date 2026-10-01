# Shared UI primitives

Keep reusable, domain-independent controls here. Feature components own story/character/comic behavior; primitives never fetch data or import feature APIs.

- `Button`: native button props; `type` defaults to `button`, preventing accidental form submissions. `variant` selects `primary` or `secondary`; `className` adds contextual styling.
- `Input`, `Textarea`, `Select`: native typed props including `id`, `value`, `onChange`, `disabled`, `required`, `aria-*` and `ref`. `className` extends shared `form-control` styling. Use an associated label and `aria-describedby` for help/errors.
- `Icon`: `name` selects the named icon, `size` controls its dimensions. Decorative SVGs are hidden from assistive technology; icon-only actions need an accessible name.
- `ResourceState`: shared loading/error/retry presentation.
- `TitleForm`: `label` names the field, `action` names the submit button, `onCreate(title)` receives the trimmed title and returns a promise; rejection keeps the draft.

Use semantic HTML and Talechemy CSS tokens. Add complex primitives when a feature needs them, preserving keyboard operation and reduced motion. shadcn/Radix can be adopted incrementally without copying a generic visual theme.

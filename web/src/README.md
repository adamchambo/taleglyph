# Frontend boundaries

- `app/`: routing, providers, active story context and application preferences.
- `layouts/`: application shell, sidebar and top bar.
- `components/ui/`: reusable domain-independent primitives and shared form/status helpers.
- `features/<feature>/`: domain pages, components, API modules, hooks and types. Keep editor state in its owning feature; share by explicit props/context only when needed.
- `hooks/`: reusable behavior such as resource loading and unsaved-change protection.
- `lib/`: HTTP/configuration and local preference helpers.
- `styles/`: design tokens, shell and current legacy feature styles. Gradually split legacy global styles as features are completed.
- `themes/`: appearance state; independent of story genre/tone tags.
- `test/`, `../e2e/`: unit setup and browser journeys.

Data path: page/feature → API module → shared HTTP client → .NET controller → service → repository → EF Core/PostgreSQL. UI preferences alone use local storage. Explicit editor saves and revision checks remain required.

The development backlog is `planning/TODO.md` at the repository root (Git-ignored). A routed screen or schema entity does not imply a completed feature.

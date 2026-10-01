# Talechemy

A connected workspace for worlds, characters, stories, and comic adaptations.

## Repository

```text
server/
  Talechemy.Api/
    Controllers/          HTTP routes and request validation
    Services/             Application workflows; Interfaces/ contains contracts
    Repositories/         EF queries and writes; Interfaces/ contains contracts
    Models/               World, Stories, Comics, Assets, Exploration entities
    DTOs/                 API request and response contracts
    Data/
      TalechemyDbContext.cs
      Configurations/     Entity mappings, foreign keys, indexes
      Migrations/         Versioned PostgreSQL schema
      Seeding/            Reserved for explicit seed routines
    Mapping/              Entity-to-response conversion
    Providers/AI/         AI provider abstraction and simulated provider
    Middleware/           Exception handling
    Extensions/           Dependency injection registration
    Validation/           Request validators
    Properties/           Local launch settings
  Talechemy.Tests/         Backend checks
web/
  public/                 Static assets
  src/
    app/                  Router and providers
    layouts/              Shared workspace layout
    components/           Shared navigation and UI
    features/
      world/              World and character screens, forms, hooks, API, types
      library/            Story library, onboarding, dashboard and appearance
      stories/            Chapter and scene writing workflow
      comics/             Comic workflow scaffold
      assets/             Asset library scaffold
      explore/            AI playground scaffold
      notes/              Notes scaffold
    hooks/                Shared resource loading
    lib/                  API client and configuration
    styles/               Studio shell, appearance tokens and editor styles
    test/                 Unit test setup
  e2e/                    Browser checks
planning/                 Private planning context; ignored by Git
```

The browser calls controllers through `/api`. Controllers delegate to services,
repositories use a scoped EF Core `DbContext`, and Npgsql persists data in
PostgreSQL. DTOs keep database entities out of the HTTP contract. Reads use
no-tracking queries; writes are asynchronous. Migrations run explicitly.

## Local setup

Requires .NET 10 SDK, Node 22.12+ and PostgreSQL 18 (or Docker Compose).

1. For Docker, copy `.env.example` to `.env`, choose a local password, then run
   `docker compose up -d postgres`. The database listens on localhost:54329.
   You can instead use an existing local PostgreSQL database.
2. Set the API connection string (substitute your local password and port):

   ```sh
   dotnet user-secrets set 'ConnectionStrings:Talechemy' 'Host=localhost;Port=54329;Database=talechemy;Username=talechemy;Password=YOUR_LOCAL_PASSWORD' --project server/Talechemy.Api
   ```

   On hosted environments use `ConnectionStrings__Talechemy` instead. Never
   commit credentials. The API refuses to start without a connection string.
3. Restore and apply the schema:

   ```sh
   dotnet restore Talechemy.sln
   dotnet tool restore
   dotnet ef database update --project server/Talechemy.Api -- --environment Development
   ```
4. Start the API:

   ```sh
   dotnet run --project server/Talechemy.Api
   ```

   API: `http://localhost:5080`. `/api/health` reports process availability only;
   it does not test database connectivity.
5. In another terminal:

   ```sh
   cd web
   npm ci
   npm run dev
   ```

   Open `http://127.0.0.1:5173`. Vite proxies `/api` to localhost:5080.
   Optional `web/.env` settings are described in its `.env.example`.

## Implemented scope

- Create/list worlds; create, view and update characters.
- Create manuscripts and chapters; add and edit plain-text scenes, with optimistic concurrency checks.
- Select scenes and adapt them into comic pages using 1–3 blank panels or a saved template.
- Edit panel titles and image/text layers, position, width, order, visibility and locking; add/remove/reorder panels.
- Upload PNG/JPEG/WebP artwork (8 MB limit) into world-scoped asset libraries.
- Save a page as a reusable template with its artwork, text and placements. Reuse creates independent pages/layers.
- View current prose or the original source snapshot beside each comic page. Changes are flagged for review without overwriting comic work.
- Explicit saves and unsaved-change navigation guards. This is not autosave or a full history browser.
- Story library, search, space/series grouping, artwork covers, editable overview/tags and preferred starting section.
- Name-only onboarding with automatic space creation; direct blank comic creation.
- Story dashboard, persistent expanded/rail/focus navigation and story context in existing editors.
- Light/dark appearance, accents and restrained decoration, separate from genre/tone tags.
- PostgreSQL schema for the remaining worldbuilding entities.

The current mapping is one selected scene per comic page, in chapter order. Pages
can have 1–12 panels; layers use percentage positions and widths. Fine-grained
passage links, automatic pacing, freehand drawing and drag handles are later work.

`IAdaptationPlanner` receives the selected scenes and template and returns a page
plan. The current planner is manual/deterministic. Real AI planning will need a
proposal-review step before persistence; no AI service is called by this flow.
`AdaptationLink` preserves source prose/title/revision and separately tracks the
revision reviewed by the creator. EF commits each adaptation/page save atomically.

Images are stored outside source code in `server/Talechemy.Api/App_Data/uploads/`
(ignored by Git), with metadata in PostgreSQL. Configure `Storage:AssetDirectory`
to change this location. Back up both the database and uploaded files. Object
storage, authentication, collaboration and publishing are not implemented.

## Local checkpoint on this machine

A password-protected PostgreSQL 18 cluster was prepared in `.local/postgres/`
(ignored by Git) on `127.0.0.1:54329`. Its connection string is in .NET user secrets.
The development database contains **The Verdant Reach**, an example chapter,
comic, two previously generated reference images and a reusable page template.
AI generation is not connected to the app; these are ordinary uploaded assets.

If PostgreSQL is stopped, restart it from the repository root:

```sh
/opt/homebrew/opt/postgresql@18/bin/pg_ctl -D .local/postgres -l .local/postgres.log -o '-h 127.0.0.1 -p 54329 -k /private/tmp' start
```

Then start the API and Vite using the commands above. This native cluster and
Docker Compose use the same port; run one at a time. The native cluster is a
machine-local convenience, not a deployment configuration.

## Verification

```sh
dotnet build Talechemy.sln
dotnet test Talechemy.sln
cd web
npm run build
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
```

The default browser check tests the shell with a mocked API. The full adaptation
check runs only with `TALECHEMY_LIVE_TESTS=1` and creates test worlds through the
real API. Supply a disposable test API/database using `TALECHEMY_TEST_API`; browser requests are routed to it without changing the local app proxy.

```sh
TALECHEMY_LIVE_TESTS=1 TALECHEMY_TEST_API=http://127.0.0.1:5087/api npm run test:e2e
```

A standalone backend integration check creates test worlds and verifies source
snapshots, template independence, invalid selections, foreign-world rejection and
stale writes. It deletes nothing. From the repository root, with a disposable API:

```sh
TALECHEMY_TEST_API=http://127.0.0.1:5087/api python3 server/Talechemy.Tests/Integration/verify_workflow.py
TALECHEMY_TEST_API=http://127.0.0.1:5087/api python3 server/Talechemy.Tests/Integration/verify_library.py
```

If Chromium is already installed elsewhere, the Playwright configuration accepts
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` instead of downloading another copy.

To add a schema change: update an entity and its EF configuration, then run
`dotnet ef migrations add DESCRIPTIVE_NAME --project server/Talechemy.Api --output-dir Data/Migrations -- --environment Development`.
Inspect the generated migration before applying it with `database update`.

## Story-first overhaul — Checkpoint A

The new library and shell are ready for visual review. `World` records currently
back the Space API, retaining their existing IDs. The additive `StoryLibrary`
migration adds metadata, series membership and cover references. Story detail
writes use a revision token; invalid cross-space artwork/series links are rejected.
Navigation/appearance/recent-work preferences are local to the device.

Notes/tasks and Story plan show labelled upcoming sections. Separate novel
records, story-specific character participation, relationship graphs, maps,
timelines, structured writing/instructions and enhanced canvas interaction remain
for checkpoints B/C. No AI generation is simulated. The full approved scope and
checkpoint criteria are in ignored `planning/story-first-overhaul.md`.

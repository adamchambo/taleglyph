# Taleglyph

Taleglyph is a local studio for one story universe at a time. A **space** holds the world, the people in it, and the artwork you reuse. Inside that space, a **story** is what happens, broken into arcs. **Novels and comics** are how you tell it: a book can cover several stories, and a comic can cover one arc, or part of one.

There is no account and no hosted service. The app in your browser talks to an API on your machine, and that API stores everything in PostgreSQL. Uploaded images stay on disk next to the API.

## What you can do

- Create a space, give it a cover, and switch between spaces.
- Plan stories and order their arcs.
- Write a novel as chapters and scenes.
- Start a blank comic, or adapt a chapter into comic pages and edit the panels.
- Keep characters, notes, and artwork on the space. A note, novel, or comic can be linked to the stories or arcs it is about.

The Timeline section and richer world tools (maps, regions, lore) are in the navigation and are not editable yet. Sign-in, collaboration, and publishing are not part of this app.

## Run it

You need the [.NET 10 SDK](https://dotnet.microsoft.com/download), Node.js 22.12 or newer, and Docker. Docker is only used for PostgreSQL. If you already run PostgreSQL 18, skip the Compose step and point the connection string at that database instead.

From the repository root:

### 1. Start the database

```sh
cp .env.example .env
```

Set `POSTGRES_PASSWORD` in `.env` to a password you choose. Then:

```sh
docker compose up -d postgres
```

PostgreSQL listens on `127.0.0.1:54329`. The user and database name both default to `talechemy`.

### 2. Give the API that connection string

The API will not start without one, and the password is not stored in the repo.

```sh
dotnet user-secrets set 'ConnectionStrings:Talechemy' 'Host=localhost;Port=54329;Database=talechemy;Username=talechemy;Password=YOUR_LOCAL_PASSWORD' --project server/Talechemy.Api
```

Use the password from `.env`. On a hosted machine, set the environment variable `ConnectionStrings__Talechemy` to the same value instead of using user secrets.

### 3. Create the tables

```sh
dotnet restore Talechemy.sln
dotnet tool restore
dotnet ef database update --project server/Talechemy.Api -- --environment Development
```

`dotnet tool restore` installs the EF Core tool used by the command above. The `--environment Development` flag is what lets that command read the user secret.

### 4. Start the API

```sh
dotnet run --project server/Talechemy.Api
```

The API is at `http://localhost:5080`. `http://localhost:5080/api/health` returns ok when the process is up. It does not check the database.

### 5. Start the web app

In a second terminal:

```sh
cd web
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. The page is empty until you create a space. The browser calls `/api` on that same origin, and Vite forwards those requests to the API on port 5080. Leave both terminals running.

The server project directory is `server/Talechemy.Api`. That folder name is older than the Taleglyph product name.

## Where things are saved

- Stories, chapters, comics, and asset records are rows in PostgreSQL.
- Image files are written to `server/Talechemy.Api/App_Data/uploads/`, which Git ignores. Set `Storage:AssetDirectory` if you want them somewhere else. Back up the database and that folder together.
- Appearance, the sidebar, and recent work are saved in the browser, not the database.

PNG, JPEG, and WebP uploads are limited to 8 MB.

## Project layout

```text
server/Talechemy.Api/     ASP.NET Core API
server/Talechemy.Tests/   API tests
web/                      React app (Vite)
web/e2e/                  Browser tests
```

The web app is organised by feature under `web/src/features`: `library` (spaces, stories, works), `stories` (chapters and scenes), `comics`, `world`, `assets`, and `notes`.

## Checks

```sh
dotnet test Talechemy.sln
cd web
npm run lint
npm test
npm run build
```

The Playwright check needs Chromium (`npx playwright install chromium` once). By default it exercises the shell against a mocked API:

```sh
npm run test:e2e
```

The full flow, which creates data through a real API, stays off unless you point it at a disposable database. Do not aim it at the database you write in.

```sh
TALECHEMY_LIVE_TESTS=1 TALECHEMY_TEST_API=http://127.0.0.1:5087/api npm run test:e2e
```

To change the schema, edit the entity and its EF configuration, then generate a migration and read it before applying:

```sh
dotnet ef migrations add DESCRIPTIVE_NAME --project server/Talechemy.Api --output-dir Data/Migrations -- --environment Development
dotnet ef database update --project server/Talechemy.Api -- --environment Development
```

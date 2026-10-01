import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  if (process.env.TALECHEMY_TEST_API)
    await page.route(
      (url) => url.pathname.startsWith("/api/"),
      async (route) => {
        const incoming = new URL(route.request().url());
        const response = await route.fetch({
          url:
            process.env.TALECHEMY_TEST_API +
            incoming.pathname.replace(/^\/api/, "") +
            incoming.search,
        });
        return route.fulfill({ response });
      },
    );
});

test("library navigation and appearance persist without changing the layout", async ({
  page,
}) => {
  await page.route("**/api/library", (route) =>
    route.fulfill({ json: { stories: [], spaces: [] } }),
  );
  await page.addInitScript(() =>
    localStorage.setItem("taleglyph.v1.navigation", JSON.stringify("expanded")),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your spaces live here." }),
  ).toBeVisible();
  const sidebar = page.locator(".studio-sidebar");
  const before = await page.locator("main").boundingBox();
  await expect(page.locator(".sidebar-toggle")).toBeHidden();
  await sidebar.hover();
  await expect.poll(async () => (await sidebar.boundingBox())!.width).toBe(244);
  expect((await page.locator("main").boundingBox())!.x).toBe(before!.x);

  await page.getByRole("heading", { name: "Your spaces live here." }).hover();
  await expect.poll(async () => (await sidebar.boundingBox())!.width).toBe(76);
  await expect(page.locator(".studio-shell")).toHaveClass(/nav-rail/);
  await page.reload();
  await expect(page.locator(".studio-shell")).toHaveClass(/nav-rail/);
  await page
    .getByRole("link", { name: "Appearance settings", exact: true })
    .click();
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  await expect(page.locator(".app-root")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("radio", { name: "Botanical", exact: true }).check();
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Dark", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Focus mode", exact: true }).click();
  await expect(page.locator(".studio-sidebar")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Exit focus mode", exact: true })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileToggle = page.getByRole("button", { name: "Open navigation" });
  await expect(mobileToggle).toBeVisible();
  await mobileToggle.click();
  await expect(page.locator(".studio-sidebar")).toHaveClass(/is-open/);
  await page.getByRole("button", { name: "Close navigation" }).click();
  await expect(page.locator(".studio-sidebar")).not.toHaveClass(/is-open/);
});

test("space hub, story arcs, linked comic, notes and context survive reload", async ({
  page,
}) => {
  test.skip(
    !process.env.TALECHEMY_LIVE_TESTS,
    "Needs disposable PostgreSQL API.",
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", async (dialog) => {
    errors.push(dialog.message());
    await dialog.dismiss();
  });
  const spaceName = `Browser space ${Date.now()}`;
  const name = `Browser story ${Date.now()}`;
  await page.goto("/spaces/new");
  await page.getByLabel("Space name", { exact: true }).fill(spaceName);
  await page.getByRole("button", { name: "Create space", exact: true }).click();
  await expect(page).toHaveURL(/\/spaces\/[a-f0-9-]+$/);
  const spaceId = page.url().split("/").at(-1)!;
  await page.goto(`/spaces/${spaceId}/stories/new`);
  await page.getByLabel("Story name", { exact: true }).fill(name);
  await page
    .getByLabel("Brief story overview", { exact: false })
    .fill("A journey through a changing forest.");
  await page.getByRole("button", { name: "Create story", exact: true }).click();
  await expect(page).toHaveURL(/\/stories\/[a-f0-9-]+$/);
  const storyId = page.url().split("/").at(-1)!;
  await expect(page.getByLabel("Arc title", { exact: true })).toBeVisible();
  await page.getByLabel("Arc title", { exact: true }).fill("The crossing");
  await page.getByRole("button", { name: "Add arc", exact: true }).click();
  await page.getByRole("button", { name: "New arc", exact: true }).click();
  await page.getByLabel("Arc title", { exact: true }).fill("The return");
  await page.getByRole("button", { name: "Add arc", exact: true }).click();
  await page
    .getByRole("button", { name: "Move The return up", exact: true })
    .click();
  await expect(page.locator(".arc-list strong")).toHaveText([
    "The return",
    "The crossing",
  ]);
  await page.goto(`/spaces/${spaceId}/graphic-novels`);
  await expect(page.getByLabel("Switch space")).toHaveValue(spaceId);
  await page
    .getByRole("button", { name: "New graphic novel", exact: true })
    .click();
  await page
    .getByLabel("Graphic novel title", { exact: true })
    .fill("An independent comic");
  await page
    .getByRole("button", { name: "Add graphic novel", exact: true })
    .click();
  await expect(page).toHaveURL(/\/comics\/[a-f0-9-]+$/);
  await expect(page.locator(".comic-panel")).toHaveCount(3);
  await page.reload();
  await expect(page.getByLabel("Switch space")).toHaveValue(spaceId);
  await page.getByText("What this comic tells, title and cover").click();
  await page
    .getByLabel("Link a story or arc")
    .selectOption({ label: "1. The return" });
  await page.getByRole("button", { name: "Link", exact: true }).click();
  await expect(page.locator(".link-chips li")).toContainText(
    `${name} · The return`,
  );
  await page.goto(`/spaces/${spaceId}/stories/${storyId}`);
  await expect(page.locator(".comic-entry")).toContainText("The return");
  await page.goto(`/spaces/${spaceId}/notes`);
  await page.getByLabel("Note title", { exact: true }).fill("Open question");
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await expect(page.locator(".note-card h2")).toHaveText("Open question");
  await page.goto(`/stories/${storyId}`);
  await expect(page).toHaveURL(`/spaces/${spaceId}/stories/${storyId}`);
  await page.goto(`/spaces/${spaceId}/stories/${storyId}/settings`);
  await page.getByRole("button", { name: "Fantasy", exact: true }).click();
  await page.getByLabel("Story name", { exact: true }).fill(name + " revised");
  await page
    .getByRole("button", { name: "Save story details", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Story details saved.");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Fantasy", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/library");
  await page.getByLabel("Search spaces").fill(name + " revised");
  await expect(page.locator(".story-tile")).toHaveCount(1);
  await expect(page.locator(".story-tile h2")).toHaveText(spaceName);
  expect(errors).toEqual([]);
});

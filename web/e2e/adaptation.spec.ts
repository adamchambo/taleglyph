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

test("write, adapt, place artwork, reuse a template, and review changed prose", async ({
  page,
}) => {
  test.skip(
    !process.env.TALECHEMY_LIVE_TESTS,
    "Requires a running API with a disposable PostgreSQL database.",
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 500)
      errors.push(`${response.status()} ${response.url()}`);
  });
  const suffix = Date.now().toString();
  await page.goto("/spaces/new");
  await page
    .getByLabel("Space name", { exact: true })
    .fill(`Browser space ${suffix}`);
  await page.getByRole("button", { name: "Create space", exact: true }).click();
  await expect(page).toHaveURL(/\/spaces\/[a-f0-9-]+$/);
  await page.goto(`${page.url()}/works`);
  await page.getByLabel("Novel title").fill("The Lantern Road");
  await page.getByRole("button", { name: "Add novel", exact: true }).click();
  await page.getByLabel("Chapter title").fill("A Light Beyond the Trees");
  await page.getByRole("button", { name: "Add chapter", exact: true }).click();
  await expect(page).toHaveURL(/\/chapters\/[a-f0-9-]+$/);
  const chapterUrl = page.url();
  await page.getByLabel("New scene title").fill("The crossing");
  await page.getByRole("button", { name: "Add scene", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Scene prose", exact: true })
    .fill(
      "Mira raised her lantern. Beyond the gate, the forest answered with a thousand tiny lights.",
    );
  await page.getByRole("button", { name: "Save scene", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save scene", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Adapt to comic", exact: true })
    .click();
  await page.getByLabel("Comic title").fill("The Lantern Road — comic");
  await page.getByLabel("Panels per page").selectOption("2");
  await page
    .getByRole("button", { name: "Create 1 comic page", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "The Lantern Road — comic",
      exact: true,
    }),
  ).toBeVisible();
  const comicUrl = page.url();
  await expect(page.locator(".source-prose")).toContainText(
    "Mira raised her lantern.",
  );
  await page
    .getByText("Import artwork into this world", { exact: true })
    .click();
  await page
    .getByLabel("Asset name", { exact: true })
    .fill("Lantern reference");
  await page.getByLabel("Image file", { exact: true }).setInputFiles({
    name: "reference.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1ZkAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByRole("button", { name: "Upload asset", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "+ Image", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "+ Image", exact: true }).click();
  await page.getByRole("button", { name: "+ Text", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Dialogue or caption", exact: true })
    .fill("There is a way through.");
  await page.getByRole("button", { name: "Save page", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Page saved.");
  await page.reload();
  await expect(page.locator(".speech")).toHaveText("There is a way through.");
  const image = page.locator(".comic-panel img");
  await expect(image).toBeVisible();
  await expect
    .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await page.getByText("Save as a reusable template", { exact: true }).click();
  await page
    .getByLabel("Template name", { exact: true })
    .fill("Lantern opening");
  await page
    .getByRole("button", { name: "Save template", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Template saved.");
  await page.getByRole("link", { name: "Open chapter", exact: false }).click();
  await page
    .getByRole("textbox", { name: "Scene prose", exact: true })
    .fill("Mira lowered her lantern. The gate had vanished.");
  await page.getByRole("button", { name: "Save scene", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save scene", exact: true }),
  ).toBeDisabled();
  await page.goto(comicUrl);
  await expect(page.getByText("Source changed", { exact: true })).toBeVisible();
  await expect(page.locator(".speech")).toHaveText("There is a way through.");
  await expect(page.locator(".source-prose")).toHaveText(
    "Mira lowered her lantern. The gate had vanished.",
  );
  await page.getByRole("button", { name: "As adapted", exact: true }).click();
  await expect(page.locator(".source-prose")).toContainText(
    "Mira raised her lantern.",
  );
  await page
    .getByRole("button", { name: "Mark source reviewed", exact: true })
    .click();
  await expect(page.getByText("Source changed", { exact: true })).toHaveCount(
    0,
  );
  await page.goto(chapterUrl);
  await page
    .getByRole("button", { name: "Adapt to comic", exact: true })
    .click();
  await page
    .getByLabel("Starting template")
    .selectOption({ label: "Lantern opening · 2 panels" });
  await page
    .getByRole("button", { name: "Create 1 comic page", exact: true })
    .click();
  await expect(page.locator(".speech")).toHaveText("There is a way through.");
  await expect(page.locator(".comic-panel img")).toBeVisible();
  // Unsaved edits are guarded when leaving the editor.
  await page.getByRole("button", { name: "+ Text", exact: true }).click();
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("link", { name: "Novels & graphic novels", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Save page", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

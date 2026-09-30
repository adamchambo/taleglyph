import { test, expect } from "@playwright/test";
test("workspace routes and theme remain usable", async ({ page }) => {
  await page.route("**/api/worlds", (route) => route.fulfill({ json: [] }));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your worlds" }),
  ).toBeVisible();
  await page.getByLabel("World theme").selectOption("scifi");
  await expect(page.locator(".app-root")).toHaveAttribute(
    "data-theme",
    "scifi",
  );
  await page.getByRole("link", { name: "Comic studio" }).click();
  await expect(
    page.getByRole("heading", { name: "Comic studio" }),
  ).toBeVisible();
});

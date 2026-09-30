import { describe, expect, it, vi } from "vitest";
import { apiClient } from "./apiClient";
describe("API client", () => {
  it("surfaces ASP.NET validation details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            title: "Validation failed",
            errors: { Name: ["Name is required."] },
          }),
          { status: 400 },
        ),
      ),
    );
    await expect(apiClient("/worlds")).rejects.toThrow("Name is required.");
  });
  it("returns no content without parsing JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    await expect(apiClient("/worlds")).resolves.toBeUndefined();
  });
});

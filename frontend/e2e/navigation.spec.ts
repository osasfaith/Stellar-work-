import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should have main navigation landmark", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();
  });

  test("should navigate between pages using header links", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Jobs" }).click();
    await expect(page).toHaveURL("/");

    await page.getByRole("link", { name: "Post Job" }).click();
    await expect(page).toHaveURL(/\/post-job/);

    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should have skip to main content link", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeVisible();
  });

  test("skip link should move focus to main content", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    
    // Click the skip link
    await skipLink.click();
    
    // Verify focus is on the main content element
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeFocused();
  });

  test("skip link should work across routes", async ({ page }) => {
    // Test on dashboard route
    await page.goto("/dashboard");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await skipLink.click();
    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeFocused();

    // Test on post-job route
    await page.goto("/post-job");
    await skipLink.click();
    await expect(mainContent).toBeFocused();
  });
});

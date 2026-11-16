import { expect, test } from "@playwright/test";

test("mobile: bottom bar opens the filter drawer on catalog pages", async ({ page }) => {
  await page.goto("/ar/c/bracelets");
  await page.locator("nav[aria-label=Quick]").getByRole("button", { name: "الفلاتر" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
});

test("mobile: admin has no horizontal overflow", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("البريد الإلكتروني").fill("admin@vantor.store");
  await page.getByLabel("كلمة السر").fill("Admin@1234");
  await page.getByRole("button", { name: "دخول", exact: true }).click();
  await page.waitForURL("**/admin");
  await expect(page.getByText("الإيراد اليومي")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390 + 22);
});

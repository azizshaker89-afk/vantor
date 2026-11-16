import { expect, test } from "@playwright/test";
import { PRODUCT, trackErrors } from "./helpers";

test("home renders in Arabic RTL and switches to English", async ({ page }) => {
  const noErrors = trackErrors(page);
  await page.goto("/");
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("article.pcard").first()).toBeVisible();
  await page.getByRole("link", { name: "English" }).first().click();
  await expect(page).toHaveURL(/\/en/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  noErrors();
});

test("catalog filters, facet counts and sorting are URL driven", async ({ page }) => {
  await page.goto("/en/shop");
  const count = page.locator("[aria-live=polite]").first();
  await expect(count).toContainText("50");
  await page.locator("aside label", { hasText: "Halden" }).click();
  await expect(page).toHaveURL(/brand=halden/);
  await expect(count).toContainText("of 5");
  await page.locator("select").first().selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  const prices = (await page.locator("main article .text-brass-deep").allTextContents()).map((p) => Number(p.replace(/\D/g, "")));
  expect(prices.length).toBeGreaterThan(1);
  expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  // Reloading the URL reproduces the same state.
  await page.reload();
  await expect(count).toContainText("of 5");
});

test("Arabic search understands singular category words", async ({ page }) => {
  await page.goto("/ar");
  await page.getByRole("button", { name: "بحث" }).first().click();
  await page.keyboard.type("محفظة");
  await expect(page.getByRole("link", { name: /كل النتائج/ })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/q=/);
  await expect(page.locator("main article.pcard").first()).toBeVisible();
});

test("product page: gallery, JSON-LD and quick add", async ({ page }) => {
  await page.goto(`/ar/p/${PRODUCT}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("tab", { name: "المواصفات" })).toHaveAttribute("aria-selected", "true");
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().innerHTML());
  expect(ld[0]).toMatchObject({ "@type": "Product", offers: { priceCurrency: "EGP", price: 18900 } });
  expect(ld[1]["@type"]).toBe("BreadcrumbList");
  await page.getByRole("button", { name: "أضف للسلة" }).first().click();
  await expect(page.getByRole("dialog")).toContainText("هالدن");
});

test("unknown product returns a real 404", async ({ page }) => {
  const res = await page.goto("/ar/p/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("404")).toBeVisible();
});

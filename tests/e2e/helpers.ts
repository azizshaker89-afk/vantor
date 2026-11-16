import { expect, type Page } from "@playwright/test";

export const PRODUCT = "halden-aurum-chronograph"; // 18,900 EGP, in stock

export async function addToCartFromPdp(page: Page, slug = PRODUCT, locale = "ar") {
  await page.goto(`/${locale}/p/${slug}`);
  await page.getByRole("button", { name: locale === "ar" ? "أضف للسلة" : "Add to cart" }).first().click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("vantor-cart") ?? "{}").state?.lines?.length ?? 0)).toBeGreaterThan(0);
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/ar/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة السر").fill(password);
  await page.getByRole("button", { name: "دخول", exact: true }).click();
}

export async function adminLogin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("البريد الإلكتروني").fill("admin@vantor.store");
  await page.getByLabel("كلمة السر").fill("Admin@1234");
  await page.getByRole("button", { name: "دخول", exact: true }).click();
  await page.waitForURL("**/admin");
}

/** Fails the test on uncaught exceptions in the page. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return () => expect(errors, errors.join("\n")).toEqual([]);
}

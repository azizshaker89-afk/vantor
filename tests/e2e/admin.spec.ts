import { expect, test } from "@playwright/test";
import { adminLogin, login, trackErrors } from "./helpers";

test("admin is protected from guests and customers", async ({ page, request }) => {
  await page.goto("/admin/orders");
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect((await request.get("/admin/orders/export")).status()).toBe(403);
  await login(page, "demo@vantor.store", "Demo@1234");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("dashboard, order status change and CSV export", async ({ page }) => {
  const noErrors = trackErrors(page);
  await adminLogin(page);
  await expect(page.getByText("الإيراد اليومي")).toBeVisible();
  await page.getByRole("link", { name: "90 يوم" }).click();
  await expect(page).toHaveURL(/range=90/);

  await page.goto("/admin/orders?status=PENDING");
  await page.locator("tbody tr a").first().click();
  await page.locator("#st").selectOption("CONFIRMED");
  await page.getByRole("button", { name: "تحديث الحالة" }).click();
  await expect(page.getByRole("status")).toHaveText("اتحفظ ✓");

  const csv = await page.request.get("/admin/orders/export?status=DELIVERED");
  expect(csv.headers()["content-type"]).toContain("text/csv");
  expect((await csv.text()).split("\r\n")[0]).toContain("number,date,status");
  noErrors();
});

test("create, find and delete a product", async ({ page }) => {
  await adminLogin(page);
  await page.goto("/admin/products/new");
  await page.getByRole("button", { name: "إضافة المنتج" }).click();
  await expect(page.getByText("الاسم بالعربي مطلوب")).toBeVisible();

  const box = (label: string) => page.locator("label", { hasText: label });
  await box("الاسم بالعربي").locator("input").fill("ساعة اختبار آلي");
  await box("الاسم بالإنجليزي").locator("input").fill("E2E Test Watch");
  await expect(box("رابط المنتج").locator("input")).toHaveValue("e2e-test-watch");
  await box("الوصف بالعربي").locator("textarea").fill("منتج اتعمل من اختبار أوتوماتيك.");
  await box("الوصف بالإنجليزي").locator("textarea").fill("Created by an automated test.");
  await box("السعر (ج.م)").locator("input").fill("4200");
  await box("القسم").locator("select").selectOption({ label: "ساعات" });
  await box("البراند").locator("select").selectOption({ index: 1 });
  await page.locator("input[type=file]").setInputFiles("public/img/products/halden-aurum-chronograph.webp");
  await expect(page.getByText("رئيسية")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "إضافة المنتج" }).click();
  await expect(page).toHaveURL(/\/admin\/products\/c[a-z0-9]+$/);

  expect((await page.request.get("/ar/p/e2e-test-watch")).status()).toBe(200);

  await page.goto("/admin/products?q=E2E");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "حذف ساعة اختبار آلي" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
});

import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test("account pages require sign-in and redirect back", async ({ page }) => {
  await page.goto("/ar/account");
  await expect(page).toHaveURL(/\/ar\/login\?next=%2Far%2Faccount/);
});

test("wrong password shows an error; demo login lands on the dashboard", async ({ page }) => {
  await login(page, "demo@vantor.store", "wrong-password");
  await expect(page.getByText("البريد أو كلمة السر غلط")).toBeVisible();
  await login(page, "demo@vantor.store", "Demo@1234");
  await expect(page).toHaveURL(/\/ar\/account$/);
  await expect(page.getByText("آخر الطلبات")).toBeVisible();
  // Another customer's order number is not reachable.
  const res = await page.goto("/ar/account/orders/VN-10240");
  expect(res?.status()).toBe(404);
});

test("registration validates and signs the new customer in", async ({ page }) => {
  await page.goto("/ar/register");
  await page.getByLabel("الاسم").fill("مستخدم الاختبار");
  await page.getByLabel("البريد الإلكتروني").fill(`e2e-${Date.now()}@example.com`);
  await page.getByLabel("رقم الموبايل").fill("123");
  await page.getByLabel("كلمة السر").fill("Secret@123");
  await page.getByRole("button", { name: "إنشاء الحساب" }).click();
  await expect(page.getByText("رقم موبايل مصري صحيح")).toBeVisible();
  await page.getByLabel("رقم الموبايل").fill("01234567890");
  await page.getByRole("button", { name: "إنشاء الحساب" }).click();
  await expect(page).toHaveURL(/\/ar\/account$/);
  await expect(page.getByText("لسه معملتش طلبات")).toBeVisible();
});

test("contact form stores a message", async ({ page }) => {
  await page.goto("/ar/contact");
  await page.getByLabel("الاسم").fill("زائر الاختبار");
  await page.getByLabel("البريد الإلكتروني").fill("visitor@example.com");
  await page.getByLabel("رسالتك").fill("عايز أعرف لو فيه تغليف هدايا للمحافظ؟");
  await page.getByRole("button", { name: "إرسال" }).click();
  await expect(page.getByText("وصلتنا رسالتك")).toBeVisible();
});

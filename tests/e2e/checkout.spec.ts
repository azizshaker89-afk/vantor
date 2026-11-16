import { expect, test } from "@playwright/test";
import { addToCartFromPdp } from "./helpers";

test("guest checkout with coupon, server totals and order tracking", async ({ page }) => {
  await addToCartFromPdp(page);
  await page.goto("/ar/cart");
  await page.locator("#coupon").fill("NOPE");
  await page.getByRole("button", { name: "تطبيق" }).click();
  await expect(page.getByText("الكود ده مش صالح")).toBeVisible();
  await page.locator("#coupon").fill("VANTOR10");
  await page.getByRole("button", { name: "تطبيق" }).click();
  await expect(page.getByText("تم تطبيق VANTOR10")).toBeVisible();

  await page.getByRole("link", { name: "إتمام الطلب" }).click();
  await page.getByRole("button", { name: "أكّد الطلب" }).click();
  await expect(page.getByText("رقم موبايل مصري صحيح")).toBeVisible();

  await page.getByLabel("الاسم بالكامل").fill("عميل الاختبار");
  await page.getByLabel("رقم الموبايل").fill("01098765432");
  await page.locator("#gov").selectOption("alexandria");
  await page.getByLabel("المدينة / المنطقة").fill("سموحة");
  await page.getByLabel("العنوان بالتفصيل").fill("12 شارع فوزي معاذ، الدور 3");
  await page.getByRole("button", { name: "أكّد الطلب" }).click();

  await expect(page).toHaveURL(/\/ar\/order\/.+placed=1/);
  await expect(page.getByText("شكرًا، طلبك اتسجل!")).toBeVisible();
  // 18,900 − 10% (1,890) + free delivery (over 3,000)
  await expect(page.getByText("17,010 ج.م").first()).toBeVisible();
  const number = (await page.getByText(/VN-\d+/).first().innerText()).match(/VN-\d+/)![0];

  await page.goto(`/ar/track?n=${number}&p=01098765432`);
  await expect(page.getByText("قيد المراجعة").first()).toBeVisible();
  await page.goto(`/ar/track?n=${number}&p=01000000000`);
  await expect(page.getByText("مش لاقيين طلب")).toBeVisible();
});

test("server rejects tampered cart lines", async ({ page }) => {
  await page.goto("/ar");
  await page.evaluate(() => localStorage.setItem("vantor-cart", JSON.stringify({
    state: { lines: [{ id: "forged", slug: "x", name: "x", image: "/img/products/halden-aurum-chronograph.webp", price: 1, qty: 1, stock: 9 }], coupon: null }, version: 0,
  })));
  await page.goto("/ar/checkout");
  await page.getByLabel("الاسم بالكامل").fill("محاولة تلاعب");
  await page.getByLabel("رقم الموبايل").fill("01012345678");
  await page.locator("#gov").selectOption("cairo");
  await page.getByLabel("المدينة / المنطقة").fill("مدينة نصر");
  await page.getByLabel("العنوان بالتفصيل").fill("شارع عباس العقاد 12");
  await page.getByRole("button", { name: "أكّد الطلب" }).click();
  await expect(page.getByText("في منتج في السلة مبقاش متاح")).toBeVisible();
});

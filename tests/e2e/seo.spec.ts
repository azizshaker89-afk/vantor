import { expect, test } from "@playwright/test";

test("robots.txt points to the sitemap and hides private areas", async ({ request }) => {
  const txt = await (await request.get("/robots.txt")).text();
  expect(txt).toContain("Disallow: /admin");
  expect(txt).toMatch(/Sitemap: http:\/\/localhost:\d+\/sitemap\.xml/);
});

test("sitemap lists both languages with hreflang alternates", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/ar/p/halden-aurum-chronograph");
  expect(xml).toContain("/en/p/halden-aurum-chronograph");
  expect(xml).toContain('hreflang="en"');
  expect((xml.match(/<url>/g) ?? []).length).toBeGreaterThan(100);
});

test("pages declare canonical, hreflang and Open Graph", async ({ page }) => {
  await page.goto("/en/c/watches");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en\/c\/watches$/);
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", /\/ar\/c\/watches$/);
  await page.goto("/ar/p/halden-aurum-chronograph");
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute("content", /halden-aurum-chronograph\.webp/);
});

test("security headers are set", async ({ request }) => {
  const h = (await request.get("/ar")).headers();
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["x-frame-options"]).toBe("SAMEORIGIN");
  expect(h["x-powered-by"]).toBeUndefined();
});

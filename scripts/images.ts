// Converts the source photos (Desktop/brand) into optimised WebP files under public/img.
// Usage: npx tsx scripts/images.ts [sourceDir]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { products, categories, editorial } from "../prisma/catalog";

const src = process.argv[2] ?? path.join(process.env.USERPROFILE ?? "", "Desktop", "brand");
const files = fs.readdirSync(src).filter((f) => /\.jpe?g$/i.test(f)).sort();
const file = (n: number) => path.join(src, files[n - 1]);
const out = path.join(process.cwd(), "public", "img");
for (const d of ["products", "categories", "editorial"]) fs.mkdirSync(path.join(out, d), { recursive: true });

(async () => {
  // Per product: main square, a close-up (1.7x on the salient area) and the full uncropped frame on black.
  for (const p of products) {
    const dest = (suffix: string) => path.join(out, "products", `${p.slug}${suffix}.webp`);
    await sharp(file(p.img)).resize(900, 900, { fit: "cover", position: "attention" }).webp({ quality: 80 }).toFile(dest(""));
    const big = await sharp(file(p.img)).resize(1530, 1530, { fit: "cover", position: "attention" }).toBuffer();
    await sharp(big).extract({ left: 315, top: 315, width: 900, height: 900 }).webp({ quality: 80 }).toFile(dest("-detail"));
    await sharp(file(p.img)).resize(900, 900, { fit: "contain", background: "#000" }).webp({ quality: 80 }).toFile(dest("-full"));
  }
  for (const c of categories) {
    await sharp(file(c.cover)).resize(720, 960, { fit: "cover", position: "attention" })
      .webp({ quality: 80 }).toFile(path.join(out, "categories", `${c.slug}.webp`));
  }
  for (const e of editorial) {
    await sharp(file(e.img)).resize({ width: e.width, withoutEnlargement: true })
      .webp({ quality: 82 }).toFile(path.join(out, "editorial", `${e.name}.webp`));
  }
  console.log(`done: ${products.length} products, ${categories.length} categories, ${editorial.length} editorial`);
})();

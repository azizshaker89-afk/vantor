import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { brands, categories, products } from "./catalog";
import { GOVERNORATES, shippingFor } from "../src/lib/egypt";

const db = new PrismaClient();

// Deterministic PRNG so the demo data is identical on every seed.
let s = 20261115;
const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

const FIRST = ["أحمد", "محمد", "عمر", "يوسف", "كريم", "مصطفى", "خالد", "طارق", "مازن", "حسام", "شريف", "إياد", "زياد", "علي", "هشام"];
const LAST = ["السيد", "عبد الله", "منصور", "الشافعي", "فؤاد", "رمضان", "حسن", "إبراهيم", "صبري", "عادل", "نصار", "جلال"];
const STREETS = ["شارع التحرير", "شارع الهرم", "شارع عباس العقاد", "شارع 9", "شارع جامعة الدول", "كورنيش النيل", "شارع البحر", "شارع الجمهورية"];

async function main() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.brand.deleteMany();
  await db.coupon.deleteMany();
  await db.message.deleteMany();
  await db.user.deleteMany();
  await db.setting.deleteMany();

  const catIds: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const row = await db.category.create({
      data: { slug: c.slug, nameAr: c.nameAr, nameEn: c.nameEn, descAr: c.descAr, descEn: c.descEn, image: `/img/categories/${c.slug}.webp`, sort: i },
    });
    catIds[c.slug] = row.id;
  }
  const brandIds: Record<string, string> = {};
  for (const b of brands) brandIds[b.slug] = (await db.brand.create({ data: b })).id;

  const now = Date.now();
  const created: Awaited<ReturnType<typeof db.product.create>>[] = [];
  for (const [i, p] of products.entries()) {
    const gallery = ["", "-detail", "-full"].map((v) => `/img/products/${p.slug}${v}.webp`);
    created.push(
      await db.product.create({
        data: {
          slug: p.slug, nameAr: p.nameAr, nameEn: p.nameEn, descAr: p.descAr, descEn: p.descEn,
          specsAr: JSON.stringify(p.specsAr), specsEn: JSON.stringify(p.specsEn),
          price: p.price, compareAt: p.compareAt ?? null, stock: p.stock,
          image: `/img/products/${p.slug}.webp`, gallery: JSON.stringify(gallery),
          featured: !!p.featured, isNew: !!p.isNew, sold: p.sold,
          categoryId: catIds[p.cat], brandId: brandIds[p.brand],
          createdAt: new Date(now - (p.isNew ? i : 60 + i) * 86400000),
        },
      }),
    );
  }

  const adminHash = await bcrypt.hash("Admin@1234", 10);
  const demoHash = await bcrypt.hash("Demo@1234", 10);
  await db.user.create({ data: { name: "مدير المتجر", email: "admin@vantor.store", phone: "01000000000", passwordHash: adminHash, role: "ADMIN" } });
  const customers = [await db.user.create({ data: { name: "عميل تجريبي", email: "demo@vantor.store", phone: "01111111111", passwordHash: demoHash } })];
  for (let i = 0; i < 24; i++) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    customers.push(await db.user.create({ data: { name, email: `customer${i + 1}@example.com`, phone: `010${String(10000000 + Math.floor(rnd() * 89999999))}`, passwordHash: demoHash, createdAt: new Date(now - Math.floor(rnd() * 150) * 86400000) } }));
  }

  // ~140 orders over the last 120 days for the admin dashboard
  const statuses = ["DELIVERED", "DELIVERED", "DELIVERED", "SHIPPED", "CONFIRMED", "PENDING", "CANCELLED"];
  for (let i = 0; i < 140; i++) {
    const daysAgo = Math.floor(Math.pow(rnd(), 1.4) * 120);
    const when = new Date(now - daysAgo * 86400000 - Math.floor(rnd() * 86400000));
    const cust = rnd() < 0.8 ? pick(customers) : null;
    const gov = rnd() < 0.55 ? pick(GOVERNORATES.slice(0, 3)) : pick(GOVERNORATES);
    const lines = 1 + Math.floor(rnd() * 3);
    const chosen = new Set<number>();
    while (chosen.size < lines) chosen.add(Math.floor(rnd() * created.length));
    const items = [...chosen].map((idx) => ({ p: created[idx], qty: rnd() < 0.85 ? 1 : 2 }));
    const subtotal = items.reduce((a, x) => a + x.p.price * x.qty, 0);
    const shipping = shippingFor(gov.id, subtotal);
    const status = daysAgo < 2 ? "PENDING" : daysAgo < 5 ? pick(["CONFIRMED", "SHIPPED", "PENDING"]) : pick(statuses);
    await db.order.create({
      data: {
        number: `VN-${(10240 + i).toString()}`,
        userId: cust?.id ?? null,
        name: cust?.name ?? `${pick(FIRST)} ${pick(LAST)}`,
        phone: cust?.phone ?? "01222222222",
        email: cust?.email ?? null,
        governorate: gov.id,
        city: gov.ar,
        address: `${Math.floor(rnd() * 120) + 1} ${pick(STREETS)}`,
        subtotal, shipping, discount: 0, total: subtotal + shipping,
        status, createdAt: when,
        items: { create: items.map((x) => ({ productId: x.p.id, nameAr: x.p.nameAr, nameEn: x.p.nameEn, image: x.p.image, price: x.p.price, qty: x.qty })) },
      },
    });
  }

  await db.coupon.createMany({
    data: [
      { code: "VANTOR10", type: "PERCENT", value: 10, minTotal: 1500, uses: 31 },
      { code: "WELCOME200", type: "FIXED", value: 200, minTotal: 2000, uses: 12 },
      { code: "SUMMER25", type: "PERCENT", value: 25, minTotal: 5000, active: false, uses: 7 },
    ],
  });

  await db.message.createMany({
    data: [
      { name: "مازن فؤاد", email: "mazen@example.com", phone: "01012345678", body: "هل ساعة هالدن أوروم متاحة بسوار ستيل بدل الجلد؟" },
      { name: "Omar Hassan", email: "omar@example.com", body: "Do you offer gift wrapping for the wallets? I need it before Friday." },
      { name: "كريم عادل", email: "karim@example.com", body: "عايز أطلب 12 محفظة كهدايا لفريق الشغل، في خصم للكميات؟", read: true },
    ],
  });

  await db.setting.createMany({
    data: [
      { key: "whatsapp", value: "201000000000" },
      { key: "phone", value: "01000000000" },
      { key: "email", value: "hello@vantor.store" },
      { key: "freeShippingOver", value: "3000" },
    ],
  });

  console.log(`seeded ${created.length} products, ${customers.length} customers, 140 orders`);
}

main().finally(() => db.$disconnect());

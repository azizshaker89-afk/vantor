import "server-only";
import { db } from "./db";

export const productOptions = async () => {
  const [cats, brands] = await Promise.all([db.category.findMany({ orderBy: { sort: "asc" } }), db.brand.findMany({ orderBy: { name: "asc" } })]);
  return { categories: cats.map((c) => ({ id: c.id, name: c.nameAr })), brands: brands.map((b) => ({ id: b.id, name: b.name })) };
};

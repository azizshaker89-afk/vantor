// Plain, serialisable product shape passed from server to client components.
export interface CardProduct {
  id: string;
  slug: string;
  name: string;
  desc: string;
  brand: string;
  category: string;
  price: number;
  compareAt: number | null;
  stock: number;
  image: string;
  isNew: boolean;
}

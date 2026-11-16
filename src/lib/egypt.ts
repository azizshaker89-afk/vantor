// Egyptian governorates grouped into delivery zones. Fees in EGP.
export const ZONES = {
  metro: { fee: 60, daysAr: "١–٢ يوم", daysEn: "1–2 days" },
  north: { fee: 75, daysAr: "٢–٣ أيام", daysEn: "2–3 days" },
  south: { fee: 90, daysAr: "٣–٤ أيام", daysEn: "3–4 days" },
  remote: { fee: 120, daysAr: "٤–٦ أيام", daysEn: "4–6 days" },
} as const;

export type Zone = keyof typeof ZONES;

export const GOVERNORATES: { id: string; ar: string; en: string; zone: Zone }[] = [
  { id: "cairo", ar: "القاهرة", en: "Cairo", zone: "metro" },
  { id: "giza", ar: "الجيزة", en: "Giza", zone: "metro" },
  { id: "qalyubia", ar: "القليوبية", en: "Qalyubia", zone: "metro" },
  { id: "alexandria", ar: "الإسكندرية", en: "Alexandria", zone: "north" },
  { id: "beheira", ar: "البحيرة", en: "Beheira", zone: "north" },
  { id: "dakahlia", ar: "الدقهلية", en: "Dakahlia", zone: "north" },
  { id: "damietta", ar: "دمياط", en: "Damietta", zone: "north" },
  { id: "gharbia", ar: "الغربية", en: "Gharbia", zone: "north" },
  { id: "kafr-el-sheikh", ar: "كفر الشيخ", en: "Kafr El Sheikh", zone: "north" },
  { id: "monufia", ar: "المنوفية", en: "Monufia", zone: "north" },
  { id: "sharqia", ar: "الشرقية", en: "Sharqia", zone: "north" },
  { id: "ismailia", ar: "الإسماعيلية", en: "Ismailia", zone: "north" },
  { id: "port-said", ar: "بورسعيد", en: "Port Said", zone: "north" },
  { id: "suez", ar: "السويس", en: "Suez", zone: "north" },
  { id: "faiyum", ar: "الفيوم", en: "Faiyum", zone: "south" },
  { id: "beni-suef", ar: "بني سويف", en: "Beni Suef", zone: "south" },
  { id: "minya", ar: "المنيا", en: "Minya", zone: "south" },
  { id: "assiut", ar: "أسيوط", en: "Assiut", zone: "south" },
  { id: "sohag", ar: "سوهاج", en: "Sohag", zone: "south" },
  { id: "qena", ar: "قنا", en: "Qena", zone: "south" },
  { id: "luxor", ar: "الأقصر", en: "Luxor", zone: "south" },
  { id: "aswan", ar: "أسوان", en: "Aswan", zone: "south" },
  { id: "red-sea", ar: "البحر الأحمر", en: "Red Sea", zone: "remote" },
  { id: "matrouh", ar: "مطروح", en: "Matrouh", zone: "remote" },
  { id: "new-valley", ar: "الوادي الجديد", en: "New Valley", zone: "remote" },
  { id: "north-sinai", ar: "شمال سيناء", en: "North Sinai", zone: "remote" },
  { id: "south-sinai", ar: "جنوب سيناء", en: "South Sinai", zone: "remote" },
];

export const FREE_SHIPPING_OVER = 3000;

export function shippingFor(governorateId: string, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_OVER) return 0;
  const g = GOVERNORATES.find((x) => x.id === governorateId);
  return g ? ZONES[g.zone].fee : ZONES.remote.fee;
}

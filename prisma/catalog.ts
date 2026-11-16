// Single source of truth for demo content. Used by scripts/images.ts and prisma/seed.ts.
// Brand names are invented house lines — no real trademarks.

export type Spec = [string, string]; // [label, value]

export interface CatalogCategory {
  slug: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  cover: number; // source image index (1-based, sorted file order of Desktop/brand)
}

export interface CatalogBrand {
  slug: string;
  name: string;
  taglineAr: string;
  taglineEn: string;
}

export interface CatalogProduct {
  img: number;
  slug: string;
  cat: string;
  brand: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  compareAt?: number;
  stock: number;
  featured?: boolean;
  isNew?: boolean;
  sold: number;
  specsAr: Spec[];
  specsEn: Spec[];
}

export const categories: CatalogCategory[] = [
  {
    slug: "watches",
    nameAr: "ساعات",
    nameEn: "Watches",
    descAr: "كرونوغراف وساعات رسمية بمينا مدروسة وأساور ستيل وجلد طبيعي.",
    descEn: "Chronographs and dress watches with considered dials, steel and leather straps.",
    cover: 40,
  },
  {
    slug: "sunglasses",
    nameAr: "نظارات شمس",
    nameEn: "Sunglasses",
    descAr: "إطارات أسيتات ومعدن بعدسات مستقطبة تحمي من الأشعة فوق البنفسجية.",
    descEn: "Acetate and metal frames with polarised, UV400 lenses.",
    cover: 8,
  },
  {
    slug: "wallets",
    nameAr: "محافظ",
    nameEn: "Wallets",
    descAr: "جلد طبيعي مخيط يدويًا، يكبر معاك ويكتسب طابعه مع الوقت.",
    descEn: "Hand-stitched full-grain leather that ages with you.",
    cover: 13,
  },
  {
    slug: "bracelets",
    nameAr: "أساور",
    nameEn: "Bracelets",
    descAr: "ستيل مقاوم للصدأ، جلد مضفور وأحجار طبيعية بقفل محكم.",
    descEn: "Stainless steel, braided leather and natural stone with secure clasps.",
    cover: 34,
  },
];

export const brands: CatalogBrand[] = [
  { slug: "halden", name: "Halden", taglineAr: "كرونوغراف بروح الورشة", taglineEn: "Workshop-born chronographs" },
  { slug: "corvane", name: "Corvane", taglineAr: "ساعات رسمية هادئة", taglineEn: "Quiet dress watches" },
  { slug: "noirline", name: "Noirline", taglineAr: "نظارات بخطوط حادة", taglineEn: "Sharp-lined eyewear" },
  { slug: "atlas-hide", name: "Atlas Hide", taglineAr: "جلد طبيعي مدبوغ نباتيًا", taglineEn: "Vegetable-tanned leather" },
  { slug: "brask", name: "Brask", taglineAr: "معادن مطروقة يدويًا", taglineEn: "Hand-forged metal" },
  { slug: "vantor-atelier", name: "VANTOR Atelier", taglineAr: "خط VANTOR الخاص", taglineEn: "Our own line" },
];

const watchSpecs = (
  caseAr: string, caseEn: string, mm: number, moveAr: string, moveEn: string,
  strapAr: string, strapEn: string, wr: number,
): { specsAr: Spec[]; specsEn: Spec[] } => ({
  specsAr: [["الهيكل", caseAr], ["القطر", `${mm} مم`], ["الحركة", moveAr], ["السوار", strapAr], ["مقاومة الماء", `${wr} متر`], ["الضمان", "سنتان"]],
  specsEn: [["Case", caseEn], ["Diameter", `${mm} mm`], ["Movement", moveEn], ["Strap", strapEn], ["Water resistance", `${wr} m`], ["Warranty", "2 years"]],
});

const shadeSpecs = (frameAr: string, frameEn: string, lensAr: string, lensEn: string, w: number) => ({
  specsAr: [["الإطار", frameAr], ["العدسة", lensAr], ["الحماية", "UV400 مستقطبة"], ["عرض الإطار", `${w} مم`], ["في العلبة", "جراب جلد وقطعة تنظيف"]] as Spec[],
  specsEn: [["Frame", frameEn], ["Lens", lensEn], ["Protection", "UV400 polarised"], ["Frame width", `${w} mm`], ["In the box", "Leather case and cloth"]] as Spec[],
});

const walletSpecs = (leatherAr: string, leatherEn: string, cards: number, dimAr: string, dimEn: string) => ({
  specsAr: [["الخامة", leatherAr], ["أماكن الكروت", `${cards}`], ["المقاس", dimAr], ["الحماية", "بطانة RFID"], ["الخياطة", "يدوية بخيط شمعي"]] as Spec[],
  specsEn: [["Material", leatherEn], ["Card slots", `${cards}`], ["Size", dimEn], ["Protection", "RFID lining"], ["Stitching", "Hand, waxed thread"]] as Spec[],
});

const braceletSpecs = (matAr: string, matEn: string, claspAr: string, claspEn: string, sizeAr: string, sizeEn: string) => ({
  specsAr: [["الخامة", matAr], ["القفل", claspAr], ["المقاس", sizeAr], ["العناية", "تجنب العطور والكلور"]] as Spec[],
  specsEn: [["Material", matEn], ["Clasp", claspEn], ["Size", sizeEn], ["Care", "Keep away from perfume and chlorine"]] as Spec[],
});

export const products: CatalogProduct[] = [
  // ---------------- Watches ----------------
  {
    img: 46, slug: "halden-aurum-chronograph", cat: "watches", brand: "halden",
    nameAr: "هالدن أوروم كرونوغراف", nameEn: "Halden Aurum Chronograph",
    descAr: "مينا أسود بعدادات ذهبية وهيكل مطلي بالذهب على سوار جلد تمساح منقوش. الساعة اللي بتكمل البدلة.",
    descEn: "Black dial with gilt sub-dials and a gold-tone case on an embossed croc-grain strap. The one that finishes a suit.",
    price: 18900, compareAt: 21500, stock: 6, featured: true, sold: 41,
    ...watchSpecs("ستيل مطلي ذهب", "Gold-tone steel", 42, "كوارتز كرونوغراف ياباني", "Japanese quartz chronograph", "جلد طبيعي منقوش", "Embossed leather", 100),
  },
  {
    img: 47, slug: "corvane-elysian-gold", cat: "watches", brand: "corvane",
    nameAr: "كورفان إليزيان جولد", nameEn: "Corvane Elysian Gold",
    descAr: "ساعة رسمية بمينا أسود لامع وعقارب ذهبية رفيعة، بسيطة بما يكفي للمكتب وفخمة بما يكفي للسهرة.",
    descEn: "A glossy black dial with slim gold hands — plain enough for the office, rich enough for the evening.",
    price: 14500, stock: 9, featured: true, isNew: true, sold: 23,
    ...watchSpecs("ستيل مطلي ذهب", "Gold-tone steel", 41, "كوارتز سويسري", "Swiss quartz", "جلد إيطالي", "Italian leather", 50),
  },
  {
    img: 44, slug: "halden-forge-black-gold", cat: "watches", brand: "halden",
    nameAr: "هالدن فورج بلاك جولد", nameEn: "Halden Forge Black & Gold",
    descAr: "هيكل أسود مطفي بتفاصيل ذهبية ومسامير ظاهرة على البيزل. ساعة بحضور قوي ووزن محسوس.",
    descEn: "Matte black case with gold details and exposed bezel screws. Strong presence, real weight on the wrist.",
    price: 16800, stock: 4, isNew: true, sold: 17,
    ...watchSpecs("ستيل مطلي PVD أسود", "Black PVD steel", 45, "كوارتز كرونوغراف", "Quartz chronograph", "جلد وسيليكون", "Leather and silicone", 100),
  },
  {
    img: 45, slug: "corvane-panda-chrono", cat: "watches", brand: "corvane",
    nameAr: "كورفان باندا كرونو", nameEn: "Corvane Panda Chrono",
    descAr: "مينا أسود بعدادات فضية على طراز سباقات السبعينات، على سوار جلد أسود ناعم.",
    descEn: "A 70s racing layout: black dial, silver sub-dials, soft black leather.",
    price: 12900, compareAt: 14200, stock: 11, featured: true, sold: 38,
    ...watchSpecs("ستيل 316L", "316L steel", 40, "كوارتز كرونوغراف", "Quartz chronograph", "جلد طبيعي", "Genuine leather", 100),
  },
  {
    img: 41, slug: "halden-ridge-steel-chrono", cat: "watches", brand: "halden",
    nameAr: "هالدن ريدج ستيل كرونو", nameEn: "Halden Ridge Steel Chrono",
    descAr: "كرونوغراف ستيل بالكامل بمينا فضي وبيزل تاكيميتر أسود. ساعة يومية ما بتخذلكش.",
    descEn: "All-steel chronograph with a silver dial and black tachymeter bezel. An everyday watch that never lets you down.",
    price: 15400, stock: 7, sold: 29,
    ...watchSpecs("ستيل 316L", "316L steel", 41, "أوتوماتيك", "Automatic", "سوار ستيل", "Steel bracelet", 100),
  },
  {
    img: 42, slug: "corvane-meridian-steel", cat: "watches", brand: "corvane",
    nameAr: "كورفان ميريديان ستيل", nameEn: "Corvane Meridian Steel",
    descAr: "مينا أسود وعدادات متناسقة على سوار ستيل مصقول. اختيار آمن لأول ساعة جادة.",
    descEn: "Black dial, balanced sub-dials, polished steel bracelet. A safe pick for a first serious watch.",
    price: 11200, stock: 13, sold: 33,
    ...watchSpecs("ستيل 316L", "316L steel", 42, "كوارتز كرونوغراف", "Quartz chronograph", "سوار ستيل", "Steel bracelet", 100),
  },
  {
    img: 35, slug: "halden-graphite-chrono", cat: "watches", brand: "halden",
    nameAr: "هالدن جرافيت كرونو", nameEn: "Halden Graphite Chrono",
    descAr: "هيكل جرافيت مطفي بلمسات نحاسية على العقارب. رياضية من غير ما تكون صاخبة.",
    descEn: "Matte graphite case with copper touches on the hands. Sporty without being loud.",
    price: 13600, stock: 5, featured: true, sold: 26,
    ...watchSpecs("ستيل جرافيت", "Graphite steel", 44, "كوارتز كرونوغراف", "Quartz chronograph", "سوار ستيل جرافيت", "Graphite steel bracelet", 100),
  },
  {
    img: 39, slug: "vantor-obsidian-diver", cat: "watches", brand: "vantor-atelier",
    nameAr: "VANTOR أوبسيديان دايفر", nameEn: "VANTOR Obsidian Diver",
    descAr: "ساعة غوص من خطنا الخاص: مينا أسود وتفاصيل ذهبية ومقاومة ماء 200 متر.",
    descEn: "A diver from our own line: black dial, gold details, 200 m water resistance.",
    price: 9800, compareAt: 11500, stock: 8, isNew: true, sold: 19,
    ...watchSpecs("ستيل 316L", "316L steel", 43, "أوتوماتيك", "Automatic", "مطاط فاخر", "FKM rubber", 200),
  },
  {
    img: 40, slug: "corvane-nocturne-leather", cat: "watches", brand: "corvane",
    nameAr: "كورفان نوكترن ليذر", nameEn: "Corvane Nocturne Leather",
    descAr: "مينا أسود عميق وتدرجات فضية على سوار جلد أسود. أنيقة في الإضاءة الخافتة.",
    descEn: "Deep black dial with silver accents on black leather. At its best in low light.",
    price: 8900, stock: 10, sold: 21,
    ...watchSpecs("ستيل مصقول", "Polished steel", 40, "كوارتز", "Quartz", "جلد طبيعي", "Genuine leather", 50),
  },
  {
    img: 43, slug: "vantor-minimal-mesh", cat: "watches", brand: "vantor-atelier",
    nameAr: "VANTOR مينيمال ميش", nameEn: "VANTOR Minimal Mesh",
    descAr: "مينا أبيض نظيف بلا أرقام وسوار ميش ستيل يتعدل في ثانية. أخف ساعة في المجموعة.",
    descEn: "A clean white dial with no numerals and a mesh strap that adjusts in seconds. The lightest in the range.",
    price: 4950, stock: 18, isNew: true, sold: 52,
    ...watchSpecs("ستيل رفيع", "Slim steel", 38, "كوارتز ياباني", "Japanese quartz", "ميش ستيل", "Steel mesh", 30),
  },
  {
    img: 48, slug: "halden-midnight-steel", cat: "watches", brand: "halden",
    nameAr: "هالدن ميدنايت ستيل", nameEn: "Halden Midnight Steel",
    descAr: "أسود بالكامل من الهيكل للسوار، بأرقام عربية كبيرة سهلة القراءة.",
    descEn: "Black from case to bracelet, with large numerals that read at a glance.",
    price: 10400, stock: 6, sold: 14,
    ...watchSpecs("ستيل PVD أسود", "Black PVD steel", 44, "كوارتز كرونوغراف", "Quartz chronograph", "سوار ستيل أسود", "Black steel bracelet", 100),
  },
  {
    img: 49, slug: "corvane-roman-rose", cat: "watches", brand: "corvane",
    nameAr: "كورفان رومان روز", nameEn: "Corvane Roman Rose",
    descAr: "أرقام رومانية بلون الذهب الوردي على مينا أسود. لمسة كلاسيكية دافية.",
    descEn: "Rose-gold Roman numerals on a black dial. A warm classic.",
    price: 7600, compareAt: 8400, stock: 3, sold: 11,
    ...watchSpecs("ستيل مصقول", "Polished steel", 41, "كوارتز", "Quartz", "جلد تمساح منقوش", "Croc-grain leather", 50),
  },
  {
    img: 50, slug: "vantor-silver-dress", cat: "watches", brand: "vantor-atelier",
    nameAr: "VANTOR سيلفر دريس", nameEn: "VANTOR Silver Dress",
    descAr: "مينا فضي بلمعة شمسية وسوار ستيل متين. ساعة المناسبات اللي تنفع كل يوم.",
    descEn: "Sunray silver dial on a solid steel bracelet. An occasion watch you can wear daily.",
    price: 5800, stock: 0, sold: 37,
    ...watchSpecs("ستيل 316L", "316L steel", 40, "كوارتز ياباني", "Japanese quartz", "سوار ستيل", "Steel bracelet", 50),
  },

  // ---------------- Sunglasses ----------------
  {
    img: 1, slug: "noirline-verde-square", cat: "sunglasses", brand: "noirline",
    nameAr: "نوارلاين فيردي سكوير", nameEn: "Noirline Verde Square",
    descAr: "إطار أسيتات أسود سميك بعدسات خضراء داكنة كلاسيكية وأذرع منقوشة.",
    descEn: "Thick black acetate with classic dark-green lenses and textured temples.",
    price: 3450, stock: 12, featured: true, sold: 48,
    ...shadeSpecs("أسيتات إيطالي", "Italian acetate", "خضراء G-15", "G-15 green", 146),
  },
  {
    img: 2, slug: "noirline-halo-gold-rim", cat: "sunglasses", brand: "noirline",
    nameAr: "نوارلاين هالو جولد ريم", nameEn: "Noirline Halo Gold Rim",
    descAr: "عدسات سوداء بإطار سفلي ذهبي رفيع. خفيفة جدًا على الوش.",
    descEn: "Black lenses with a thin gold lower rim. Barely there on the face.",
    price: 2900, stock: 9, sold: 22,
    ...shadeSpecs("تيتانيوم وأسيتات", "Titanium and acetate", "سوداء", "Black", 142),
  },
  {
    img: 3, slug: "noirline-crystal-smoke", cat: "sunglasses", brand: "noirline",
    nameAr: "نوارلاين كريستال سموك", nameEn: "Noirline Crystal Smoke",
    descAr: "إطار شفاف مدخن يكشف المفصلات المعدنية، بعدسات رمادية.",
    descEn: "Smoked transparent frame showing the metal core, with grey lenses.",
    price: 3200, compareAt: 3800, stock: 7, isNew: true, sold: 15,
    ...shadeSpecs("أسيتات شفاف", "Clear acetate", "رمادية", "Grey", 148),
  },
  {
    img: 4, slug: "noirline-baroque-aviator", cat: "sunglasses", brand: "noirline",
    nameAr: "نوارلاين باروك أفياتور", nameEn: "Noirline Baroque Aviator",
    descAr: "أفياتور بجسر مزدوج وأذرع ذهبية منحوتة. القطعة اللي بتتشاف من بعيد.",
    descEn: "Double-bridge aviator with sculpted gold temples. Seen from across the room.",
    price: 4100, stock: 5, featured: true, sold: 19,
    ...shadeSpecs("معدن مطلي ذهب", "Gold-plated metal", "سوداء", "Black", 145),
  },
  {
    img: 5, slug: "vantor-marble-night", cat: "sunglasses", brand: "vantor-atelier",
    nameAr: "VANTOR ماربل نايت", nameEn: "VANTOR Marble Night",
    descAr: "إطار أسود لامع بمفصلات ذهبية وجراب جلد أسود بختم VANTOR.",
    descEn: "Glossy black frame, gold hinges and a black leather case stamped VANTOR.",
    price: 3650, stock: 10, isNew: true, sold: 12,
    ...shadeSpecs("أسيتات", "Acetate", "سوداء مستقطبة", "Polarised black", 147),
  },
  {
    img: 6, slug: "noirline-tortoise-edge", cat: "sunglasses", brand: "noirline",
    nameAr: "نوارلاين تورتويز إيدج", nameEn: "Noirline Tortoise Edge",
    descAr: "واجهة سوداء وأذرع بلون صدف السلحفاة مع قطعة ذهبية على الجانب.",
    descEn: "Black front, tortoiseshell temples and a gold side plate.",
    price: 3300, stock: 8, sold: 27,
    ...shadeSpecs("أسيتات", "Acetate", "رمادية", "Grey", 144),
  },
  {
    img: 7, slug: "noirline-hex-shield", cat: "sunglasses", brand: "noirline",
    nameAr: "نوارلاين هيكس شيلد", nameEn: "Noirline Hex Shield",
    descAr: "عدسات سداسية بدون إطار علوي وأذرع رفيعة. شكل معماري حاد.",
    descEn: "Rimless hexagonal lenses on slim temples. Sharp and architectural.",
    price: 2750, compareAt: 3100, stock: 14, sold: 31,
    ...shadeSpecs("معدن خفيف", "Lightweight metal", "سوداء", "Black", 140),
  },
  {
    img: 8, slug: "noirline-amber-fade", cat: "sunglasses", brand: "noirline",
    nameAr: "نوارلاين أمبر فيد", nameEn: "Noirline Amber Fade",
    descAr: "إطار يتدرج من الأسود للعسلي بأذرع ذهبية مزخرفة.",
    descEn: "A frame that fades from black to amber, with ornate gold temples.",
    price: 3900, stock: 6, featured: true, sold: 24,
    ...shadeSpecs("أسيتات متدرج", "Gradient acetate", "سوداء", "Black", 146),
  },
  {
    img: 9, slug: "vantor-basalt-square", cat: "sunglasses", brand: "vantor-atelier",
    nameAr: "VANTOR بازلت سكوير", nameEn: "VANTOR Basalt Square",
    descAr: "مربعة بسيطة بإطار أسود مطفي. أول نظارة تشتريها وآخر واحدة تتخلى عنها.",
    descEn: "A plain matte-black square. The first pair you buy and the last you give up.",
    price: 2600, stock: 20, sold: 64,
    ...shadeSpecs("أسيتات مطفي", "Matte acetate", "سوداء مستقطبة", "Polarised black", 145),
  },
  {
    img: 10, slug: "noirline-brass-temple", cat: "sunglasses", brand: "noirline",
    nameAr: "نوارلاين براس تمبل", nameEn: "Noirline Brass Temple",
    descAr: "إطار ضخم بقطع نحاسية على الأذرع. لمحبي الحضور الواضح.",
    descEn: "An oversized frame with brass temple bars. For a clear statement.",
    price: 4400, stock: 4, isNew: true, sold: 9,
    ...shadeSpecs("أسيتات ونحاس", "Acetate and brass", "سوداء", "Black", 152),
  },
  {
    img: 11, slug: "vantor-studio-classic", cat: "sunglasses", brand: "vantor-atelier",
    nameAr: "VANTOR ستوديو كلاسيك", nameEn: "VANTOR Studio Classic",
    descAr: "شكل كلاسيكي متوازن يناسب أغلب أشكال الوجه.",
    descEn: "A balanced classic shape that suits most faces.",
    price: 2450, stock: 16, sold: 40,
    ...shadeSpecs("أسيتات", "Acetate", "رمادية", "Grey", 143),
  },
  {
    img: 12, slug: "noirline-arrow-rivet", cat: "sunglasses", brand: "noirline",
    nameAr: "نوارلاين آرو ريفت", nameEn: "Noirline Arrow Rivet",
    descAr: "إطار أسود سميك بمسامير فضية على شكل سهم في الواجهة.",
    descEn: "Thick black frame with arrow-shaped silver rivets on the front.",
    price: 3100, stock: 0, sold: 18,
    ...shadeSpecs("أسيتات", "Acetate", "سوداء", "Black", 146),
  },
  {
    img: 16, slug: "vantor-everyday-square", cat: "sunglasses", brand: "vantor-atelier",
    nameAr: "VANTOR إيفري داي", nameEn: "VANTOR Everyday",
    descAr: "خفيفة ومريحة لليوم الطويل، بعدسات مستقطبة وسعر مناسب.",
    descEn: "Light and comfortable for long days, polarised, fairly priced.",
    price: 1950, stock: 25, sold: 71,
    ...shadeSpecs("أسيتات خفيف", "Light acetate", "سوداء مستقطبة", "Polarised black", 144),
  },

  // ---------------- Wallets ----------------
  {
    img: 13, slug: "atlas-hide-cognac-vertical", cat: "wallets", brand: "atlas-hide",
    nameAr: "أطلس هايد كونياك عمودي", nameEn: "Atlas Hide Cognac Vertical",
    descAr: "محفظة عمودية من جلد بني كونياك بخياطة ظاهرة وختم دائري محفور.",
    descEn: "Vertical wallet in cognac leather with visible stitching and an embossed seal.",
    price: 1650, stock: 15, featured: true, sold: 44,
    ...walletSpecs("جلد طبيعي كامل الحبيبات", "Full-grain leather", 8, "9 × 12 سم", "9 × 12 cm"),
  },
  {
    img: 14, slug: "atlas-hide-tan-billfold", cat: "wallets", brand: "atlas-hide",
    nameAr: "أطلس هايد تان بيلفولد", nameEn: "Atlas Hide Tan Billfold",
    descAr: "محفظة بيلفولد بجلد تان ناعم ونافذة للبطاقة الشخصية.",
    descEn: "Soft tan billfold with an ID window.",
    price: 1350, compareAt: 1600, stock: 12, sold: 39,
    ...walletSpecs("جلد طبيعي", "Genuine leather", 6, "11 × 9 سم", "11 × 9 cm"),
  },
  {
    img: 15, slug: "vantor-noir-bifold", cat: "wallets", brand: "vantor-atelier",
    nameAr: "VANTOR نوار بايفولد", nameEn: "VANTOR Noir Bifold",
    descAr: "جلد أسود محبب بقطعة معدنية صغيرة بشعار VANTOR. رفيعة في الجيب.",
    descEn: "Pebbled black leather with a small VANTOR plate. Slim in the pocket.",
    price: 1900, stock: 10, isNew: true, sold: 26,
    ...walletSpecs("جلد محبب", "Pebbled leather", 8, "11 × 9 سم", "11 × 9 cm"),
  },
  {
    img: 17, slug: "vantor-coin-pocket-bifold", cat: "wallets", brand: "vantor-atelier",
    nameAr: "VANTOR بايفولد بجيب فكة", nameEn: "VANTOR Coin Pocket Bifold",
    descAr: "بايفولد أسود عملي بجيب للفكة بسوستة.",
    descEn: "A practical black bifold with a zipped coin pocket.",
    price: 1250, stock: 22, sold: 58,
    ...walletSpecs("جلد طبيعي", "Genuine leather", 6, "12 × 9.5 سم", "12 × 9.5 cm"),
  },
  {
    img: 18, slug: "atlas-hide-chestnut-classic", cat: "wallets", brand: "atlas-hide",
    nameAr: "أطلس هايد تشستنت كلاسيك", nameEn: "Atlas Hide Chestnut Classic",
    descAr: "بني كستنائي بحواف مصبوغة يدويًا. تتحسن مع كل سنة استخدام.",
    descEn: "Chestnut brown with hand-dyed edges. Better with every year of use.",
    price: 1450, stock: 9, featured: true, sold: 30,
    ...walletSpecs("جلد مدبوغ نباتيًا", "Vegetable-tanned leather", 6, "11 × 9 سم", "11 × 9 cm"),
  },
  {
    img: 19, slug: "atlas-hide-pebbled-black", cat: "wallets", brand: "atlas-hide",
    nameAr: "أطلس هايد أسود محبب", nameEn: "Atlas Hide Pebbled Black",
    descAr: "جلد أسود محبب بخياطة نحاسية ورمز محفور. هدية مضمونة.",
    descEn: "Pebbled black leather, copper stitching, embossed mark. A safe gift.",
    price: 1750, stock: 8, isNew: true, sold: 21,
    ...walletSpecs("جلد محبب", "Pebbled leather", 8, "9 × 12 سم", "9 × 12 cm"),
  },
  {
    img: 20, slug: "vantor-slim-card-holder", cat: "wallets", brand: "vantor-atelier",
    nameAr: "VANTOR حافظة كروت رفيعة", nameEn: "VANTOR Slim Card Holder",
    descAr: "لأربع كروت وكام ورقة. للي شايل الموبايل ومش محتاج حاجة تانية.",
    descEn: "Four cards and a few notes. For when your phone does the rest.",
    price: 850, stock: 30, sold: 83,
    ...walletSpecs("جلد طبيعي", "Genuine leather", 4, "10 × 7 سم", "10 × 7 cm"),
  },
  {
    img: 21, slug: "vantor-nappa-black", cat: "wallets", brand: "vantor-atelier",
    nameAr: "VANTOR نابا أسود", nameEn: "VANTOR Nappa Black",
    descAr: "جلد نابا أسود ناعم جدًا بحواف مستديرة.",
    descEn: "Very soft black nappa with rounded edges.",
    price: 1550, compareAt: 1800, stock: 11, sold: 27,
    ...walletSpecs("جلد نابا", "Nappa leather", 6, "11 × 9 سم", "11 × 9 cm"),
  },
  {
    img: 22, slug: "atlas-hide-vintage-brown", cat: "wallets", brand: "atlas-hide",
    nameAr: "أطلس هايد فينتج براون", nameEn: "Atlas Hide Vintage Brown",
    descAr: "جلد بني بتأثير قديم وأماكن كروت كثيرة.",
    descEn: "Distressed brown leather with plenty of card slots.",
    price: 1400, stock: 2, sold: 16,
    ...walletSpecs("جلد طبيعي معتّق", "Distressed leather", 10, "11 × 9 سم", "11 × 9 cm"),
  },

  // ---------------- Bracelets ----------------
  {
    img: 23, slug: "brask-double-wrap-leather", cat: "bracelets", brand: "brask",
    nameAr: "براسك دبل راب جلد", nameEn: "Brask Double Wrap Leather",
    descAr: "لفتين جلد أسود مضفور بقفل ستيل مطفي.",
    descEn: "Two wraps of braided black leather with a matte steel clasp.",
    price: 1150, stock: 14, sold: 36,
    ...braceletSpecs("جلد مضفور وستيل", "Braided leather and steel", "مغناطيسي", "Magnetic", "19 / 21 سم", "19 / 21 cm"),
  },
  {
    img: 24, slug: "brask-cuban-link-steel", cat: "bracelets", brand: "brask",
    nameAr: "براسك كوبان لينك ستيل", nameEn: "Brask Cuban Link Steel",
    descAr: "سلسلة كوبان عريضة من الستيل المصقول. ثقيلة ولامعة.",
    descEn: "A wide Cuban link in polished steel. Heavy and bright.",
    price: 1850, stock: 10, featured: true, sold: 47,
    ...braceletSpecs("ستيل 316L", "316L steel", "قفل صندوق مزدوج", "Double box clasp", "21 سم", "21 cm"),
  },
  {
    img: 25, slug: "atlas-hide-braided-brass", cat: "bracelets", brand: "atlas-hide",
    nameAr: "أطلس هايد مضفور بقفل نحاسي", nameEn: "Atlas Hide Braided Brass",
    descAr: "جلد أسود مضفور بقفل نحاسي أسطواني.",
    descEn: "Braided black leather with a cylindrical brass clasp.",
    price: 1350, stock: 9, isNew: true, sold: 18,
    ...braceletSpecs("جلد مضفور ونحاس", "Braided leather and brass", "مغناطيسي بقفل أمان", "Magnetic with safety lock", "20 سم", "20 cm"),
  },
  {
    img: 26, slug: "brask-thin-steel-bangle", cat: "bracelets", brand: "brask",
    nameAr: "براسك أسورة ستيل رفيعة", nameEn: "Brask Thin Steel Bangle",
    descAr: "أسورة ستيل رفيعة تتلبس مع الساعة من غير ما تزاحمها.",
    descEn: "A thin steel bangle that sits next to a watch without crowding it.",
    price: 950, stock: 18, sold: 29,
    ...braceletSpecs("ستيل 316L", "316L steel", "مفتوحة", "Open cuff", "مقاس واحد", "One size"),
  },
  {
    img: 27, slug: "brask-scale-cuff-silver", cat: "bracelets", brand: "brask",
    nameAr: "براسك سكيل كاف فضي", nameEn: "Brask Scale Cuff Silver",
    descAr: "كاف عريض بنقشة حراشف محفورة وتشطيب فضي معتق.",
    descEn: "A wide cuff with engraved scales and an antiqued silver finish.",
    price: 2250, stock: 5, featured: true, sold: 13,
    ...braceletSpecs("فضة استرليني 925", "925 sterling silver", "مفتوحة", "Open cuff", "قابل للتعديل", "Adjustable"),
  },
  {
    img: 28, slug: "brask-hammered-cuff", cat: "bracelets", brand: "brask",
    nameAr: "براسك كاف مطروق", nameEn: "Brask Hammered Cuff",
    descAr: "كاف ستيل مطروق يدويًا بملمس خشن وتشطيب مؤكسد.",
    descEn: "Hand-hammered steel cuff with a rough, oxidised finish.",
    price: 1950, compareAt: 2300, stock: 7, sold: 15,
    ...braceletSpecs("ستيل مؤكسد", "Oxidised steel", "مفتوحة", "Open cuff", "قابل للتعديل", "Adjustable"),
  },
  {
    img: 29, slug: "brask-twisted-cuff", cat: "bracelets", brand: "brask",
    nameAr: "براسك كاف مجدول", nameEn: "Brask Twisted Cuff",
    descAr: "قضيب ستيل مجدول بتشطيب مطفي.",
    descEn: "A twisted steel bar with a brushed finish.",
    price: 1650, stock: 8, sold: 20,
    ...braceletSpecs("ستيل 316L", "316L steel", "مفتوحة", "Open cuff", "قابل للتعديل", "Adjustable"),
  },
  {
    img: 30, slug: "vantor-onyx-matte-beads", cat: "bracelets", brand: "vantor-atelier",
    nameAr: "VANTOR خرز أونيكس مطفي", nameEn: "VANTOR Onyx Matte Beads",
    descAr: "خرز أونيكس طبيعي مطفي على خيط مطاط قوي.",
    descEn: "Natural matte onyx beads on strong elastic.",
    price: 650, stock: 26, sold: 69,
    ...braceletSpecs("أونيكس طبيعي 6 مم", "6 mm natural onyx", "مطاط", "Elastic", "19 سم", "19 cm"),
  },
  {
    img: 31, slug: "brask-cable-cuff", cat: "bracelets", brand: "brask",
    nameAr: "براسك كيبل كاف", nameEn: "Brask Cable Cuff",
    descAr: "كاف بنقشة الكابل وأطراف ستيل مصقولة.",
    descEn: "Cable-pattern cuff with polished steel ends.",
    price: 1450, stock: 11, isNew: true, sold: 22,
    ...braceletSpecs("ستيل 316L", "316L steel", "مفتوحة", "Open cuff", "قابل للتعديل", "Adjustable"),
  },
  {
    img: 32, slug: "vantor-micro-bead-black", cat: "bracelets", brand: "vantor-atelier",
    nameAr: "VANTOR خرز صغير أسود", nameEn: "VANTOR Micro Bead Black",
    descAr: "خرز أسود صغير بقطعة ستيل محفورة. هادية وتتلبس كل يوم.",
    descEn: "Small black beads with an engraved steel tag. Quiet enough for every day.",
    price: 590, stock: 0, sold: 34,
    ...braceletSpecs("هيماتيت وستيل", "Hematite and steel", "مطاط", "Elastic", "19 سم", "19 cm"),
  },
  {
    img: 33, slug: "atlas-hide-engraved-brass", cat: "bracelets", brand: "atlas-hide",
    nameAr: "أطلس هايد نحاس محفور", nameEn: "Atlas Hide Engraved Brass",
    descAr: "جلد مضفور عريض بقطعة نحاس محفورة يدويًا في المنتصف.",
    descEn: "Wide braided leather with a hand-engraved brass centrepiece.",
    price: 1750, stock: 6, featured: true, sold: 16,
    ...braceletSpecs("جلد ونحاس محفور", "Leather and engraved brass", "مغناطيسي", "Magnetic", "20 سم", "20 cm"),
  },
  {
    img: 34, slug: "vantor-woven-black-leather", cat: "bracelets", brand: "vantor-atelier",
    nameAr: "VANTOR جلد أسود منسوج", nameEn: "VANTOR Woven Black Leather",
    descAr: "سوار جلد منسوج رفيع بلمسة معدنية سوداء.",
    descEn: "A slim woven leather band with a black metal accent.",
    price: 890, stock: 15, sold: 28,
    ...braceletSpecs("جلد منسوج", "Woven leather", "مغناطيسي", "Magnetic", "20 سم", "20 cm"),
  },
  {
    img: 36, slug: "brask-magnetic-leather-duo", cat: "bracelets", brand: "brask",
    nameAr: "براسك جلد مزدوج مغناطيسي", nameEn: "Brask Magnetic Leather Duo",
    descAr: "صفين جلد مضفور بقفل ستيل لامع مغناطيسي.",
    descEn: "Two rows of braided leather with a polished magnetic steel clasp.",
    price: 1250, compareAt: 1450, stock: 12, sold: 33,
    ...braceletSpecs("جلد وستيل", "Leather and steel", "مغناطيسي", "Magnetic", "21 سم", "21 cm"),
  },
  {
    img: 37, slug: "brask-curb-chain-polished", cat: "bracelets", brand: "brask",
    nameAr: "براسك كيرب لامع", nameEn: "Brask Curb Chain Polished",
    descAr: "سلسلة كيرب ستيل مصقولة بقفل كلاسيكي.",
    descEn: "A polished steel curb chain with a classic lobster clasp.",
    price: 2100, stock: 7, sold: 25,
    ...braceletSpecs("ستيل 316L", "316L steel", "قفل لوبستر", "Lobster clasp", "21 سم", "21 cm"),
  },
  {
    img: 38, slug: "brask-gunmetal-curb", cat: "bracelets", brand: "brask",
    nameAr: "براسك كيرب جن ميتال", nameEn: "Brask Gunmetal Curb",
    descAr: "سلسلة كيرب بلون الجن ميتال الداكن. أهدى من الستيل اللامع.",
    descEn: "A curb chain in dark gunmetal. Quieter than polished steel.",
    price: 1950, stock: 4, isNew: true, sold: 12,
    ...braceletSpecs("ستيل PVD", "PVD steel", "قفل لوبستر", "Lobster clasp", "21 سم", "21 cm"),
  },
];

// Hero + editorial images (source index → output name)
export const editorial: { img: number; name: string; width: number }[] = [
  { img: 39, name: "hero-watch", width: 1800 },
  { img: 5, name: "hero-shades", width: 1800 },
  { img: 33, name: "hero-leather", width: 1800 },
  { img: 26, name: "story-wrist", width: 1000 },
  { img: 19, name: "banner-wallet", width: 1200 },
  { img: 29, name: "banner-cuff", width: 1400 },
];

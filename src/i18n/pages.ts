import type { Locale } from "./dict";

// Long-form copy for the static pages. Server-only usage, so plain data is fine.
export interface Section { h: string; p?: string[]; list?: string[] }
export interface InfoPage { title: string; body: string; updated?: string; sections: Section[] }

const ar = {
  about: {
    title: "من نحن",
    body: "VANTOR بدأت من سؤال بسيط: ليه الراجل المصري يدفع كتير في إكسسوار بيبوظ بعد موسم؟",
    story: [
      "إحنا فريق صغير في القاهرة بنختار كل قطعة بنفسنا: بنلبسها، بنجربها في الشغل والسفر، ولو ما عاشتش معانا ما بنبيعهاش.",
      "بنشتغل مع ورش جلد في الدرب الأحمر ومصنعين ساعات بنعرفهم بالاسم، عشان نوصل لك جودة الماركات الكبيرة بسعر منطقي، ومعاها خدمة حد بيرد عليك فعلًا.",
    ],
    numbers: [["+4,800", "عميل"], ["27", "محافظة بنوصلها"], ["2", "سنين ضمان للساعات"], ["14", "يوم للاستبدال"]] as [string, string][],
    valuesTitle: "اللي بنلتزم بيه",
    values: [
      ["خامات حقيقية", "جلد طبيعي كامل الحبيبات، ستيل 316L، وزجاج سافير في الساعات الأعلى."],
      ["سعر واضح", "مفيش أسعار وهمية قبل الخصم. اللي بتشوفه هو اللي بتدفعه، والتوصيل مكتوب قبل ما تأكد."],
      ["خدمة بعد البيع", "ضمان مكتوب، صيانة للساعات، واستبدال من غير أسئلة كتير خلال 14 يوم."],
    ] as [string, string][],
    cta: "شوف التشكيلة",
  },
  shipping: {
    title: "الشحن والتوصيل",
    body: "بنوصل لكل محافظات مصر، والدفع عند الاستلام.",
    sections: [
      { h: "مواعيد التوصيل", list: ["القاهرة والجيزة والقليوبية: يوم إلى يومين عمل — 60 ج.م", "الإسكندرية والدلتا والقناة: يومين إلى 3 أيام — 75 ج.م", "الصعيد: 3 إلى 4 أيام — 90 ج.م", "البحر الأحمر ومطروح وسيناء والوادي الجديد: 4 إلى 6 أيام — 120 ج.م"] },
      { h: "توصيل مجاني", p: ["أي طلب قيمته 3,000 ج.م أو أكثر بيتوصل مجانًا لأي محافظة."] },
      { h: "تأكيد الطلب", p: ["بعد ما تطلب بنكلمك خلال 24 ساعة نأكد العنوان والمواعيد. الطلبات اللي بتتأكد قبل 2 الضهر بتخرج في نفس اليوم."] },
      { h: "المعاينة والدفع", p: ["من حقك تفتح الطلب وتعاينه قدام المندوب قبل ما تدفع. الدفع كاش أو بالكارت على ماكينة المندوب."] },
    ],
  } satisfies InfoPage,
  returns: {
    title: "الاستبدال والاسترجاع",
    body: "عايزينك تكون مبسوط بالقطعة، ولو لأ نحلها.",
    sections: [
      { h: "خلال 14 يوم", p: ["تقدر تستبدل أو ترجع أي قطعة خلال 14 يوم من الاستلام، بشرط تكون مش مستعملة وفي علبتها بكل ملحقاتها."] },
      { h: "إزاي تطلب استبدال؟", list: ["كلمنا على واتساب أو من صفحة تواصل معنا ومعاك رقم الطلب", "هنحدد ميعاد والمندوب ييجي ياخد القطعة", "الاستبدال بيوصلك خلال 3 أيام عمل من استلامنا للقطعة"] },
      { h: "الاسترداد", p: ["لو اخترت الاسترجاع، بنرد المبلغ خلال 7 أيام عمل كاش أو تحويل على محفظة إلكترونية. مصاريف الشحن الأصلية مش بترجع إلا لو العيب مننا."] },
      { h: "حالات مش بتتقبل", list: ["القطع المحفور عليها اسم أو المعدّلة حسب الطلب", "الساعات اللي اتشال منها الاستيكر الحامي أو اتظبط طول الأستيك", "القطع اللي عليها آثار استعمال"] },
    ],
  } satisfies InfoPage,
  privacy: {
    title: "سياسة الخصوصية",
    body: "بياناتك بنستخدمها عشان نوصلك طلبك، وبس.",
    updated: "آخر تحديث: نوفمبر 2026",
    sections: [
      { h: "بنجمع إيه؟", list: ["الاسم ورقم الموبايل والعنوان لتوصيل الطلب", "البريد الإلكتروني لو سجلت حساب أو كتبته في الطلب", "محتويات السلة والمفضلة محفوظة على جهازك انت، مش عندنا"] },
      { h: "بنستخدمها في إيه؟", p: ["تأكيد الطلب وتوصيله، والرد على رسايلك، وإبلاغك بحالة الطلب. مش بنبيع بياناتك ولا بنشاركها غير مع شركة الشحن وبالقدر اللازم للتوصيل بس."] },
      { h: "الأمان", p: ["كلمات السر متخزنة مشفرة (bcrypt) ومحدش في الفريق يقدر يشوفها. جلسة الدخول محفوظة في كوكي آمنة مش متاحة للجافاسكريبت."] },
      { h: "حقوقك", p: ["تقدر تطلب نسخة من بياناتك أو مسحها نهائيًا في أي وقت من صفحة تواصل معنا."] },
    ],
  } satisfies InfoPage,
};

const en: typeof ar = {
  about: {
    title: "About VANTOR",
    body: "VANTOR started with a simple question: why should a man pay a lot for an accessory that gives up after one season?",
    story: [
      "We're a small team in Cairo that picks every piece ourselves: we wear it, take it to work and on trips, and if it doesn't hold up, we don't sell it.",
      "We work with leather workshops in El Darb El Ahmar and watchmakers we know by name, to bring you big-brand quality at a sensible price, with service from people who actually answer.",
    ],
    numbers: [["4,800+", "customers"], ["27", "governorates served"], ["2", "year watch warranty"], ["14", "day exchange"]],
    valuesTitle: "What we commit to",
    values: [
      ["Real materials", "Full-grain leather, 316L steel and sapphire crystal on our higher-end watches."],
      ["Honest pricing", "No inflated 'before' prices. What you see is what you pay, and delivery is shown before you confirm."],
      ["After-sales care", "A written warranty, watch servicing, and a no-fuss 14-day exchange."],
    ],
    cta: "Explore the collection",
  },
  shipping: {
    title: "Shipping & delivery",
    body: "We deliver to every governorate in Egypt, with payment on delivery.",
    sections: [
      { h: "Delivery times", list: ["Cairo, Giza, Qalyubia: 1–2 business days — 60 EGP", "Alexandria, Delta & Canal: 2–3 days — 75 EGP", "Upper Egypt: 3–4 days — 90 EGP", "Red Sea, Matrouh, Sinai, New Valley: 4–6 days — 120 EGP"] },
      { h: "Free delivery", p: ["Any order of 3,000 EGP or more ships free to any governorate."] },
      { h: "Order confirmation", p: ["We call you within 24 hours to confirm address and timing. Orders confirmed before 2 pm leave the same day."] },
      { h: "Inspection & payment", p: ["You may open and inspect the order in front of the courier before paying. Pay cash or by card on the courier's machine."] },
    ],
  },
  returns: {
    title: "Returns & exchange",
    body: "We want you to love the piece. If you don't, we'll sort it out.",
    sections: [
      { h: "Within 14 days", p: ["Exchange or return any piece within 14 days of delivery, unused and in its box with all accessories."] },
      { h: "How to request an exchange", list: ["Message us on WhatsApp or the contact page with your order number", "We schedule a pickup with the courier", "Your replacement arrives within 3 business days of us receiving the piece"] },
      { h: "Refunds", p: ["If you choose a return, we refund within 7 business days in cash or to a mobile wallet. Original delivery fees are refunded only if the fault is ours."] },
      { h: "Not eligible", list: ["Engraved or custom-adjusted pieces", "Watches with the protective film removed or the strap resized", "Pieces showing signs of wear"] },
    ],
  },
  privacy: {
    title: "Privacy policy",
    body: "We use your data to deliver your order, and that's it.",
    updated: "Last updated: November 2026",
    sections: [
      { h: "What we collect", list: ["Name, mobile number and address to deliver your order", "Email, if you create an account or add it at checkout", "Your cart and wishlist live on your own device, not on our servers"] },
      { h: "How we use it", p: ["To confirm and deliver orders, answer your messages and update you on order status. We never sell your data and share it only with our courier, as far as delivery requires."] },
      { h: "Security", p: ["Passwords are stored hashed (bcrypt) and no one on the team can read them. Your session lives in a secure cookie that JavaScript can't access."] },
      { h: "Your rights", p: ["Ask for a copy of your data or its permanent deletion at any time through the contact page."] },
    ],
  },
};

export const pages: Record<Locale, typeof ar> = { ar, en };

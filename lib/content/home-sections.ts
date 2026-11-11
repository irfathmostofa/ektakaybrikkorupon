import { NATURE_IMAGES } from "@/lib/content/images";
import type { Locale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";

export const HOME_SECTION_KEYS = [
  "hero",
  "impact",
  "story",
  "features",
  "how",
  "listings",
  "cta",
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

export type HomeStat = {
  value: string;
  value_en: string | null;
  label: string;
  label_en: string | null;
  numeric: number | null;
  suffix: string | null;
};

export type HomeFeature = {
  title: string;
  title_en: string | null;
  body: string;
  body_en: string | null;
};

export type HomeSections = {
  hero: {
    eyebrow: string;
    eyebrow_en: string | null;
    donate_label: string;
    donate_label_en: string | null;
    work_label: string;
    work_label_en: string | null;
  };
  impact: {
    heading: string;
    heading_en: string | null;
    stats: HomeStat[];
  };
  story: {
    title: string;
    title_en: string | null;
    body: string;
    body_en: string | null;
    image_url: string | null;
  };
  features: {
    eyebrow: string;
    eyebrow_en: string | null;
    heading: string;
    heading_en: string | null;
    items: HomeFeature[];
  };
  how: {
    title: string;
    title_en: string | null;
    body: string;
    body_en: string | null;
  };
  listings: {
    causes_eyebrow: string;
    causes_eyebrow_en: string | null;
    causes_heading: string;
    causes_heading_en: string | null;
    gallery_heading: string;
    gallery_heading_en: string | null;
    transparency_heading: string;
    transparency_heading_en: string | null;
  };
  cta: {
    title: string;
    title_en: string | null;
    body: string;
    body_en: string | null;
    join_label: string;
    join_label_en: string | null;
    donate_label: string;
    donate_label_en: string | null;
  };
};

export const FALLBACK_HOME_SECTIONS: HomeSections = {
  hero: {
    eyebrow: "১টাকায় বৃক্ষরোপণ",
    eyebrow_en: "1 Taka Tree Plantation",
    donate_label: "মাসে ৩০ টাকা ডোনেট",
    donate_label_en: "Donate 30 taka a month",
    work_label: "আমাদের কার্যক্রম",
    work_label_en: "Our work",
  },
  impact: {
    heading: "আমাদের হিসাব",
    heading_en: "Our numbers",
    stats: [
      {
        value: "৪,১৮৩+",
        value_en: "4,183+",
        label: "গর্বিত ও দেশদরদী সদস্য",
        label_en: "Proud patriotic members",
        numeric: 4183,
        suffix: "+",
      },
      {
        value: "১৬ কোটি",
        value_en: "160 million",
        label: "আমাদের স্বপ্নের গন্তব্য",
        label_en: "Our dream destination",
        numeric: null,
        suffix: null,
      },
      {
        value: "২৫%",
        value_en: "25%",
        label: "দেশের মোট বনায়ন লক্ষ্যমাত্রা",
        label_en: "National afforestation target",
        numeric: 25,
        suffix: "%",
      },
      {
        value: "১১ জুন, ২০১৯",
        value_en: "11 June 2019",
        label: "আমাদের পথচলার শুরু",
        label_en: "The start of our path",
        numeric: null,
        suffix: null,
      },
    ],
  },
  story: {
    title: "যে ভাবনা থেকে আমাদের যাত্রা",
    title_en: "The idea that started our journey",
    body: "\"১টাকায় বৃক্ষরোপণ\" একটি পরিবেশবাদী ও স্বেচ্ছাসেবী সংগঠন, যা ২০১৯ সালের ১১ই জুন প্রতিষ্ঠা লাভ করে। সংগঠনটি তার জন্মলগ্ন থেকেই পরিবেশ সুরক্ষায় নিরলস কাজ করে যাচ্ছে। আমাদের মূল ধারণাটি খুবই সহজ কিন্তু অত্যন্ত প্রভাবশালী: একজন ব্যক্তি প্রতিদিন মাত্র এক টাকা সঞ্চয় করবেন, যার ফলে ত্রিশ দিনে তার সঞ্চয় হবে ত্রিশ টাকা। এই ত্রিশ টাকা দিয়ে মাসে অন্তত একটি গাছ রোপণ করা হবে।\n\nএভাবে আমরা যদি এই ক্যাম্পেইনটি বাংলাদেশের ১৬ কোটি মানুষের কাছে পৌঁছাতে পারি, তবে প্রতিদিন মাত্র এক টাকা সঞ্চয়ের মধ্য দিয়ে মাসে ১৬ কোটি গাছ রোপণ সম্ভব! আর এই বিশাল উদ্যোগের মধ্য দিয়েই আমরা দেশের মোট বনায়নের পরিমাণ ২৫%-এ উন্নীত করতে পারবো। এই সুদূরপ্রসারী ভাবনা ও স্বপ্ন থেকেই \"১টাকায় বৃক্ষরোপণ\"-এর যাত্রা শুরু।",
    body_en:
      "\"1 Taka Tree Plantation\" is an environmental volunteer organization founded on 11 June 2019. From the day it began, it has worked without pause to protect the environment. The idea is simple and powerful: each person saves just one taka a day, so in thirty days the saving is thirty taka. With those thirty taka, at least one tree is planted each month.\n\nIf this campaign can reach Bangladesh's 160 million people, one taka saved each day can plant 160 million trees a month. Through this vast effort we can raise the country's forest cover to 25%. From this far-reaching idea and dream, the journey of \"1 Taka Tree Plantation\" began.",
    image_url: NATURE_IMAGES.wetland,
  },
  features: {
    eyebrow: "আমাদের কার্যক্রম",
    eyebrow_en: "Our work",
    heading: "শুধু গাছ লাগানো নয়, আমরা গড়ছি ভবিষ্যৎ",
    heading_en: "We are not only planting trees—we are building the future",
    items: [
      {
        title: "বৃক্ষরোপণ ও পরিচর্যা",
        title_en: "Planting and care",
        body: "১টাকায় বৃক্ষরোপণ শুধুমাত্র গাছ লাগিয়েই দায়িত্ব শেষ করে না, বরং প্রতিটি রোপণকৃত বৃক্ষের সঠিক পরিচর্যা ও বেড়ে ওঠাও নিশ্চিত করে।",
        body_en:
          "1 Taka Tree Plantation does not stop at planting a tree. It also makes sure every planted tree is cared for and grows.",
      },
      {
        title: "দক্ষতা বৃদ্ধি ও সচেতনতা",
        title_en: "Skills and awareness",
        body: "পরিবেশ রক্ষায় সাধারণ মানুষকে সচেতন করতে এবং সদস্যদের ব্যক্তিগত দক্ষতা বৃদ্ধিতে সংগঠনটি ইতিমধ্যে দেশব্যাপী বেশকিছু সফল ক্যাম্পেইন পরিচালনা করেছে।",
        body_en:
          "To make people aware of environmental protection and to grow members' skills, the organization has already run several successful campaigns across the country.",
      },
      {
        title: "সুবিধাবঞ্চিতদের পাশে",
        title_en: "Standing with people left behind",
        body: "পরিবেশের পাশাপাশি আমরা কাজ করছি ভাগ্যহত ও ঠিকানা অভাবী মানুষের জন্য। আমাদের বিশ্বাস, আমাদের এই ক্ষুদ্র অবদানে হয়তো কারো জীবন আমূল বদলে যাবে। কে বলতে পারে, হয়তো এই সুবিধাবঞ্চিতদের মধ্যেই লুকিয়ে আছে আগামী দিনের জাস্টিস হোসেন কিংবা এ. পি. জে. আব্দুল কালামদের মত গুণী ব্যক্তিত্ব!",
        body_en:
          "Alongside the environment, we work for people without fortune or a home. We believe this small gift may change a life. Who can say—among them may be the next Justice Hossain or A. P. J. Abdul Kalam.",
      },
    ],
  },
  how: {
    title: "আপনার ১ টাকা কীভাবে বিশাল পরিবর্তন আনে?",
    title_en: "How your 1 taka creates a vast change",
    body: "মূল বিষয়টি খুবই সাধারণ—আপনি প্রতিদিন ১ টাকা করে প্রতি মাসে মোট ৩০ টাকা প্রদান করবেন। একা দিলে এটি ক্ষুদ্র মনে হতে পারে, কিন্তু ঐক্যের শক্তি বিশাল!\nধরা যাক, ১০০ জন মানুষ প্রতি মাসে ৩০ টাকা করে দিলে তহবিলে জমা হয় ৩,০০০ টাকা (৩০ * ১০০ = ৩,০০০)।\nএভাবে যখন ২ হাজার বা ১০ হাজার মানুষের একটি বৃহৎ পরিবার তৈরি হবে, তখন সেই সম্মিলিত তহবিল দিয়ে আমরা পরিবেশের পাশাপাশি সুবিধাবঞ্চিত এবং অসহায় মানুষের মুখে হাসি ফোটাতে পারবো।",
    body_en:
      "The idea is simple—you give 1 taka a day, 30 taka a month. Alone it may feel small, but the strength of unity is immense!\nIf 100 people give 30 taka a month, the fund holds 3,000 taka (30 * 100 = 3,000).\nWhen a family of 2,000 or 10,000 people is built, that shared fund can put a smile on the faces of people in need, alongside the environment.",
  },
  listings: {
    causes_eyebrow: "চলমান উদ্যোগ",
    causes_eyebrow_en: "Living causes",
    causes_heading: "শুধু গাছ লাগানো নয়, আমরা গড়ছি ভবিষ্যৎ।",
    causes_heading_en: "We are not only planting trees—we are building the future.",
    gallery_heading: "সাম্প্রতিক ছবি",
    gallery_heading_en: "From the field",
    transparency_heading: "স্বচ্ছতার এক ঝলক",
    transparency_heading_en: "Transparency snapshot",
  },
  cta: {
    title: "আজই যুক্ত হোন দেশদরদীদের এই বৃহৎ পরিবারে!",
    title_en: "Join this large family of patriots today!",
    body: "ইতোমধ্যে এই সংগঠনে যুক্ত হয়েছেন ৪,১৮৩ জনেরও বেশি ভাগ্যবান মানুষ, যারা প্রতিদিন এক টাকা করে দিয়ে একটি সুন্দর পৃথিবী গড়ায় ভূমিকা রাখছেন। আপনিও কি এই মহৎ উদ্যোগের অংশ হতে চান? আপনার প্রতিদিনের ১ টাকা হয়তো বদলে দেবে একটি জীবন, বাঁচাবে একটি পৃথিবী।",
    body_en:
      "More than 4,183 fortunate people have already joined, giving one taka a day to help build a better world. Do you want to be part of this work? Your 1 taka a day may change a life and save a world.",
    join_label: "১ টাকায় বৃক্ষরোপণ-এ যোগ দিন",
    join_label_en: "Join 1 Taka Tree Plantation",
    donate_label: "সরাসরি ডোনেট করুন",
    donate_label_en: "Donate directly",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function nullableText(value: unknown, fallback: string | null) {
  if (typeof value === "string") {
    return value.trim() || fallback;
  }
  return fallback;
}

function parseStat(value: unknown, fallback: HomeStat): HomeStat {
  if (!isRecord(value)) {
    return fallback;
  }
  const numericRaw = value.numeric;
  const numeric =
    typeof numericRaw === "number" && Number.isFinite(numericRaw)
      ? numericRaw
      : typeof numericRaw === "string" && numericRaw.trim() && Number.isFinite(Number(numericRaw))
        ? Number(numericRaw)
        : null;
  return {
    value: text(value.value, fallback.value),
    value_en: nullableText(value.value_en, fallback.value_en),
    label: text(value.label, fallback.label),
    label_en: nullableText(value.label_en, fallback.label_en),
    numeric,
    suffix: nullableText(value.suffix, fallback.suffix),
  };
}

function parseFeature(value: unknown, fallback: HomeFeature): HomeFeature {
  if (!isRecord(value)) {
    return fallback;
  }
  return {
    title: text(value.title, fallback.title),
    title_en: nullableText(value.title_en, fallback.title_en),
    body: text(value.body, fallback.body),
    body_en: nullableText(value.body_en, fallback.body_en),
  };
}

export function mergeHomeSections(raw: unknown): HomeSections {
  const input = isRecord(raw) ? raw : {};
  const hero = isRecord(input.hero) ? input.hero : {};
  const impact = isRecord(input.impact) ? input.impact : {};
  const story = isRecord(input.story) ? input.story : {};
  const features = isRecord(input.features) ? input.features : {};
  const how = isRecord(input.how) ? input.how : {};
  const listings = isRecord(input.listings) ? input.listings : {};
  const cta = isRecord(input.cta) ? input.cta : {};
  const defaultStats = FALLBACK_HOME_SECTIONS.impact.stats;
  const defaultFeatures = FALLBACK_HOME_SECTIONS.features.items;
  const parsedStats = Array.isArray(impact.stats)
    ? impact.stats.map((item, index) =>
        parseStat(item, defaultStats[index] ?? defaultStats[0]),
      )
    : [];
  const parsedFeatures = Array.isArray(features.items)
    ? features.items.map((item, index) =>
        parseFeature(item, defaultFeatures[index] ?? defaultFeatures[0]),
      )
    : [];
  const stats = parsedStats.length ? parsedStats : defaultStats;
  const items = parsedFeatures.length ? parsedFeatures : defaultFeatures;

  return {
    hero: {
      eyebrow: text(hero.eyebrow, FALLBACK_HOME_SECTIONS.hero.eyebrow),
      eyebrow_en: nullableText(hero.eyebrow_en, FALLBACK_HOME_SECTIONS.hero.eyebrow_en),
      donate_label: text(hero.donate_label, FALLBACK_HOME_SECTIONS.hero.donate_label),
      donate_label_en: nullableText(
        hero.donate_label_en,
        FALLBACK_HOME_SECTIONS.hero.donate_label_en,
      ),
      work_label: text(hero.work_label, FALLBACK_HOME_SECTIONS.hero.work_label),
      work_label_en: nullableText(hero.work_label_en, FALLBACK_HOME_SECTIONS.hero.work_label_en),
    },
    impact: {
      heading: text(impact.heading, FALLBACK_HOME_SECTIONS.impact.heading),
      heading_en: nullableText(impact.heading_en, FALLBACK_HOME_SECTIONS.impact.heading_en),
      stats,
    },
    story: {
      title: text(story.title, FALLBACK_HOME_SECTIONS.story.title),
      title_en: nullableText(story.title_en, FALLBACK_HOME_SECTIONS.story.title_en),
      body: text(story.body, FALLBACK_HOME_SECTIONS.story.body),
      body_en: nullableText(story.body_en, FALLBACK_HOME_SECTIONS.story.body_en),
      image_url: nullableText(story.image_url, FALLBACK_HOME_SECTIONS.story.image_url),
    },
    features: {
      eyebrow: text(features.eyebrow, FALLBACK_HOME_SECTIONS.features.eyebrow),
      eyebrow_en: nullableText(
        features.eyebrow_en,
        FALLBACK_HOME_SECTIONS.features.eyebrow_en,
      ),
      heading: text(features.heading, FALLBACK_HOME_SECTIONS.features.heading),
      heading_en: nullableText(
        features.heading_en,
        FALLBACK_HOME_SECTIONS.features.heading_en,
      ),
      items,
    },
    how: {
      title: text(how.title, FALLBACK_HOME_SECTIONS.how.title),
      title_en: nullableText(how.title_en, FALLBACK_HOME_SECTIONS.how.title_en),
      body: text(how.body, FALLBACK_HOME_SECTIONS.how.body),
      body_en: nullableText(how.body_en, FALLBACK_HOME_SECTIONS.how.body_en),
    },
    listings: {
      causes_eyebrow: text(
        listings.causes_eyebrow,
        FALLBACK_HOME_SECTIONS.listings.causes_eyebrow,
      ),
      causes_eyebrow_en: nullableText(
        listings.causes_eyebrow_en,
        FALLBACK_HOME_SECTIONS.listings.causes_eyebrow_en,
      ),
      causes_heading: text(
        listings.causes_heading,
        FALLBACK_HOME_SECTIONS.listings.causes_heading,
      ),
      causes_heading_en: nullableText(
        listings.causes_heading_en,
        FALLBACK_HOME_SECTIONS.listings.causes_heading_en,
      ),
      gallery_heading: text(
        listings.gallery_heading,
        FALLBACK_HOME_SECTIONS.listings.gallery_heading,
      ),
      gallery_heading_en: nullableText(
        listings.gallery_heading_en,
        FALLBACK_HOME_SECTIONS.listings.gallery_heading_en,
      ),
      transparency_heading: text(
        listings.transparency_heading,
        FALLBACK_HOME_SECTIONS.listings.transparency_heading,
      ),
      transparency_heading_en: nullableText(
        listings.transparency_heading_en,
        FALLBACK_HOME_SECTIONS.listings.transparency_heading_en,
      ),
    },
    cta: {
      title: text(cta.title, FALLBACK_HOME_SECTIONS.cta.title),
      title_en: nullableText(cta.title_en, FALLBACK_HOME_SECTIONS.cta.title_en),
      body: text(cta.body, FALLBACK_HOME_SECTIONS.cta.body),
      body_en: nullableText(cta.body_en, FALLBACK_HOME_SECTIONS.cta.body_en),
      join_label: text(cta.join_label, FALLBACK_HOME_SECTIONS.cta.join_label),
      join_label_en: nullableText(cta.join_label_en, FALLBACK_HOME_SECTIONS.cta.join_label_en),
      donate_label: text(cta.donate_label, FALLBACK_HOME_SECTIONS.cta.donate_label),
      donate_label_en: nullableText(
        cta.donate_label_en,
        FALLBACK_HOME_SECTIONS.cta.donate_label_en,
      ),
    },
  };
}

export function isHomeSectionKey(value: string): value is HomeSectionKey {
  return HOME_SECTION_KEYS.includes(value as HomeSectionKey);
}

export function localizeHomeSections(locale: Locale, sections: HomeSections) {
  return {
    hero: {
      eyebrow: pickLocalized(locale, sections.hero.eyebrow, sections.hero.eyebrow_en),
      donateLabel: pickLocalized(
        locale,
        sections.hero.donate_label,
        sections.hero.donate_label_en,
      ),
      workLabel: pickLocalized(locale, sections.hero.work_label, sections.hero.work_label_en),
    },
    impact: {
      heading: pickLocalized(locale, sections.impact.heading, sections.impact.heading_en),
      stats: sections.impact.stats.map((stat) => ({
        label: pickLocalized(locale, stat.label, stat.label_en),
        value: pickLocalized(locale, stat.value, stat.value_en),
        numeric: stat.numeric,
        suffix: stat.suffix ?? "",
      })),
    },
    story: {
      title: pickLocalized(locale, sections.story.title, sections.story.title_en),
      body: pickLocalized(locale, sections.story.body, sections.story.body_en),
      imageUrl: sections.story.image_url,
    },
    features: {
      eyebrow: pickLocalized(
        locale,
        sections.features.eyebrow,
        sections.features.eyebrow_en,
      ),
      heading: pickLocalized(
        locale,
        sections.features.heading,
        sections.features.heading_en,
      ),
      items: sections.features.items.map((item) => ({
        title: pickLocalized(locale, item.title, item.title_en),
        body: pickLocalized(locale, item.body, item.body_en),
      })),
    },
    how: {
      title: pickLocalized(locale, sections.how.title, sections.how.title_en),
      body: pickLocalized(locale, sections.how.body, sections.how.body_en),
    },
    listings: {
      causesEyebrow: pickLocalized(
        locale,
        sections.listings.causes_eyebrow,
        sections.listings.causes_eyebrow_en,
      ),
      causesHeading: pickLocalized(
        locale,
        sections.listings.causes_heading,
        sections.listings.causes_heading_en,
      ),
      galleryHeading: pickLocalized(
        locale,
        sections.listings.gallery_heading,
        sections.listings.gallery_heading_en,
      ),
      transparencyHeading: pickLocalized(
        locale,
        sections.listings.transparency_heading,
        sections.listings.transparency_heading_en,
      ),
    },
    cta: {
      title: pickLocalized(locale, sections.cta.title, sections.cta.title_en),
      body: pickLocalized(locale, sections.cta.body, sections.cta.body_en),
      joinLabel: pickLocalized(locale, sections.cta.join_label, sections.cta.join_label_en),
      donateLabel: pickLocalized(
        locale,
        sections.cta.donate_label,
        sections.cta.donate_label_en,
      ),
    },
  };
}

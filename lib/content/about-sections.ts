import { NATURE_IMAGES } from "@/lib/content/images";
import type { Locale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";

export const ABOUT_SECTION_KEYS = [
  "hero",
  "mission",
  "vision",
  "values",
  "story",
  "timeline",
  "extra",
  "impact",
  "team",
] as const;

export type AboutSectionKey = (typeof ABOUT_SECTION_KEYS)[number];

export type AboutTextBlock = {
  eyebrow: string;
  eyebrow_en: string | null;
  title: string;
  title_en: string | null;
  body: string;
  body_en: string | null;
};

export type AboutStoryBlock = AboutTextBlock & {
  image_url: string | null;
};

export type AboutHeadingBlock = {
  heading: string;
  heading_en: string | null;
};

export type AboutSections = {
  hero: {
    eyebrow: string;
    eyebrow_en: string | null;
  };
  mission: AboutTextBlock;
  vision: AboutTextBlock;
  values: AboutTextBlock;
  story: AboutStoryBlock;
  timeline: AboutTextBlock;
  extra: AboutTextBlock;
  impact: AboutHeadingBlock;
  team: AboutHeadingBlock;
};

export const FALLBACK_ABOUT_PAGE_SECTIONS: AboutSections = {
  hero: {
    eyebrow: "কেন আমরা আছি",
    eyebrow_en: "Why we exist",
  },
  mission: {
    eyebrow: "লক্ষ্য",
    eyebrow_en: "Mission",
    title: "বৃক্ষরোপণ ও পরিচর্যা",
    title_en: "Planting and care",
    body: "১টাকায় বৃক্ষরোপণ শুধুমাত্র গাছ লাগিয়েই দায়িত্ব শেষ করে না, বরং প্রতিটি রোপণকৃত বৃক্ষের সঠিক পরিচর্যা ও বেড়ে ওঠাও নিশ্চিত করে।",
    body_en:
      "1 Taka Tree Plantation does not stop at planting a tree. It also makes sure every planted tree is cared for and grows.",
  },
  vision: {
    eyebrow: "দৃষ্টি",
    eyebrow_en: "Vision",
    title: "শুধু গাছ লাগানো নয়, আমরা গড়ছি ভবিষ্যৎ",
    title_en: "We are not only planting trees—we are building the future",
    body: "এভাবে আমরা যদি এই ক্যাম্পেইনটি বাংলাদেশের ১৬ কোটি মানুষের কাছে পৌঁছাতে পারি, তবে প্রতিদিন মাত্র এক টাকা সঞ্চয়ের মধ্য দিয়ে মাসে ১৬ কোটি গাছ রোপণ সম্ভব! আর এই বিশাল উদ্যোগের মধ্য দিয়েই আমরা দেশের মোট বনায়নের পরিমাণ ২৫%-এ উন্নীত করতে পারবো।",
    body_en:
      "If this campaign can reach Bangladesh's 160 million people, one taka saved each day can plant 160 million trees a month. Through this vast effort we can raise the country's forest cover to 25%.",
  },
  values: {
    eyebrow: "মূল্যবোধ",
    eyebrow_en: "Values",
    title: "দক্ষতা বৃদ্ধি ও সচেতনতা",
    title_en: "Skills and awareness",
    body: "পরিবেশ রক্ষায় সাধারণ মানুষকে সচেতন করতে এবং সদস্যদের ব্যক্তিগত দক্ষতা বৃদ্ধিতে সংগঠনটি ইতিমধ্যে দেশব্যাপী বেশকিছু সফল ক্যাম্পেইন পরিচালনা করেছে।",
    body_en:
      "To make people aware of environmental protection and to grow members' skills, the organization has already run several successful campaigns across the country.",
  },
  story: {
    eyebrow: "আমাদের গল্প",
    eyebrow_en: "Our story",
    title: "যে ভাবনা থেকে আমাদের যাত্রা",
    title_en: "The idea that started our journey",
    body: "\"১টাকায় বৃক্ষরোপণ\" একটি পরিবেশবাদী ও স্বেচ্ছাসেবী সংগঠন, যা ২০১৯ সালের ১১ই জুন প্রতিষ্ঠা লাভ করে। সংগঠনটি তার জন্মলগ্ন থেকেই পরিবেশ সুরক্ষায় নিরলস কাজ করে যাচ্ছে। আমাদের মূল ধারণাটি খুবই সহজ কিন্তু অত্যন্ত প্রভাবশালী: একজন ব্যক্তি প্রতিদিন মাত্র এক টাকা সঞ্চয় করবেন, যার ফলে ত্রিশ দিনে তার সঞ্চয় হবে ত্রিশ টাকা। এই ত্রিশ টাকা দিয়ে মাসে অন্তত একটি গাছ রোপণ করা হবে।\n\nএভাবে আমরা যদি এই ক্যাম্পেইনটি বাংলাদেশের ১৬ কোটি মানুষের কাছে পৌঁছাতে পারি, তবে প্রতিদিন মাত্র এক টাকা সঞ্চয়ের মধ্য দিয়ে মাসে ১৬ কোটি গাছ রোপণ সম্ভব! আর এই বিশাল উদ্যোগের মধ্য দিয়েই আমরা দেশের মোট বনায়নের পরিমাণ ২৫%-এ উন্নীত করতে পারবো। এই সুদূরপ্রসারী ভাবনা ও স্বপ্ন থেকেই \"১টাকায় বৃক্ষরোপণ\"-এর যাত্রা শুরু।",
    body_en:
      "\"1 Taka Tree Plantation\" is an environmental volunteer organization founded on 11 June 2019. From the day it began, it has worked without pause to protect the environment. The idea is simple and powerful: each person saves just one taka a day, so in thirty days the saving is thirty taka. With those thirty taka, at least one tree is planted each month.\n\nIf this campaign can reach Bangladesh's 160 million people, one taka saved each day can plant 160 million trees a month. Through this vast effort we can raise the country's forest cover to 25%. From this far-reaching idea and dream, the journey of \"1 Taka Tree Plantation\" began.",
    image_url: NATURE_IMAGES.wetland,
  },
  timeline: {
    eyebrow: "পথচলা",
    eyebrow_en: "Timeline",
    title: "পথচলা",
    title_en: "The path",
    body: "১১ জুন ২০১৯ · যাত্রা শুরু\nপ্রতিদিন ১ টাকা · মাসে একটি গাছ\n৪,১৮৩+ সদস্য · দেশদরদী পরিবার\n১৬ কোটি মানুষ · স্বপ্নের গন্তব্য",
    body_en:
      "11 June 2019 · The journey begins\n1 taka a day · one tree a month\n4,183+ members · a patriotic family\n160 million people · the dream destination",
  },
  extra: {
    eyebrow: "আরও",
    eyebrow_en: "More",
    title: "সুবিধাবঞ্চিতদের পাশে",
    title_en: "Standing with people left behind",
    body: "পরিবেশের পাশাপাশি আমরা কাজ করছি ভাগ্যহত ও ঠিকানা অভাবী মানুষের জন্য। আমাদের বিশ্বাস, আমাদের এই ক্ষুদ্র অবদানে হয়তো কারো জীবন আমূল বদলে যাবে। কে বলতে পারে, হয়তো এই সুবিধাবঞ্চিতদের মধ্যেই লুকিয়ে আছে আগামী দিনের জাস্টিস হোসেন কিংবা এ. পি. জে. আব্দুল কালামদের মত গুণী ব্যক্তিত্ব!",
    body_en:
      "Alongside the environment, we work for people without fortune or a home. We believe this small gift may change a life. Who can say—among them may be the next Justice Hossain or A. P. J. Abdul Kalam.",
  },
  impact: {
    heading: "আমাদের হিসাব",
    heading_en: "Our numbers",
  },
  team: {
    heading: "দল",
    heading_en: "Team",
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

function mergeTextBlock(
  value: unknown,
  fallback: AboutTextBlock,
): AboutTextBlock {
  const input = isRecord(value) ? value : {};
  return {
    eyebrow: text(input.eyebrow, fallback.eyebrow),
    eyebrow_en: nullableText(input.eyebrow_en, fallback.eyebrow_en),
    title: text(input.title, fallback.title),
    title_en: nullableText(input.title_en, fallback.title_en),
    body: text(input.body, fallback.body),
    body_en: nullableText(input.body_en, fallback.body_en),
  };
}

export function mergeAboutSections(raw: unknown): AboutSections {
  const input = isRecord(raw) ? raw : {};
  const hero = isRecord(input.hero) ? input.hero : {};
  const impact = isRecord(input.impact) ? input.impact : {};
  const team = isRecord(input.team) ? input.team : {};
  const story = mergeTextBlock(input.story, FALLBACK_ABOUT_PAGE_SECTIONS.story);

  return {
    hero: {
      eyebrow: text(hero.eyebrow, FALLBACK_ABOUT_PAGE_SECTIONS.hero.eyebrow),
      eyebrow_en: nullableText(
        hero.eyebrow_en,
        FALLBACK_ABOUT_PAGE_SECTIONS.hero.eyebrow_en,
      ),
    },
    mission: mergeTextBlock(input.mission, FALLBACK_ABOUT_PAGE_SECTIONS.mission),
    vision: mergeTextBlock(input.vision, FALLBACK_ABOUT_PAGE_SECTIONS.vision),
    values: mergeTextBlock(input.values, FALLBACK_ABOUT_PAGE_SECTIONS.values),
    story: {
      ...story,
      image_url: nullableText(
        isRecord(input.story) ? input.story.image_url : null,
        FALLBACK_ABOUT_PAGE_SECTIONS.story.image_url,
      ),
    },
    timeline: mergeTextBlock(input.timeline, FALLBACK_ABOUT_PAGE_SECTIONS.timeline),
    extra: mergeTextBlock(input.extra, FALLBACK_ABOUT_PAGE_SECTIONS.extra),
    impact: {
      heading: text(impact.heading, FALLBACK_ABOUT_PAGE_SECTIONS.impact.heading),
      heading_en: nullableText(
        impact.heading_en,
        FALLBACK_ABOUT_PAGE_SECTIONS.impact.heading_en,
      ),
    },
    team: {
      heading: text(team.heading, FALLBACK_ABOUT_PAGE_SECTIONS.team.heading),
      heading_en: nullableText(
        team.heading_en,
        FALLBACK_ABOUT_PAGE_SECTIONS.team.heading_en,
      ),
    },
  };
}

export function isAboutSectionKey(value: string): value is AboutSectionKey {
  return ABOUT_SECTION_KEYS.includes(value as AboutSectionKey);
}

function localizeTextBlock(locale: Locale, block: AboutTextBlock) {
  return {
    eyebrow: pickLocalized(locale, block.eyebrow, block.eyebrow_en),
    title: pickLocalized(locale, block.title, block.title_en),
    body: pickLocalized(locale, block.body, block.body_en),
  };
}

export function localizeAboutSections(locale: Locale, sections: AboutSections) {
  return {
    hero: {
      eyebrow: pickLocalized(
        locale,
        sections.hero.eyebrow,
        sections.hero.eyebrow_en,
      ),
    },
    mission: localizeTextBlock(locale, sections.mission),
    vision: localizeTextBlock(locale, sections.vision),
    values: localizeTextBlock(locale, sections.values),
    story: {
      ...localizeTextBlock(locale, sections.story),
      imageUrl: sections.story.image_url,
    },
    timeline: localizeTextBlock(locale, sections.timeline),
    extra: localizeTextBlock(locale, sections.extra),
    impact: {
      heading: pickLocalized(
        locale,
        sections.impact.heading,
        sections.impact.heading_en,
      ),
    },
    team: {
      heading: pickLocalized(
        locale,
        sections.team.heading,
        sections.team.heading_en,
      ),
    },
  };
}

-- Demo seed: current public website content (Bangla-first, English second).
-- Safe to re-run. Run after supabase/schema.sql.

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------

update public.site_settings
set
  foundation_name = '১টাকায় বৃক্ষরোপণ',
  foundation_name_en = '1 Taka Tree Plantation',
  contact_email = 'ektakaybrikkhoropon@gmail.com',
  contact_phone = '+88018 43 048666',
  address = 'ব্লক ২, হাজী আবুল কালাম ভবনের নিচ তলা, হাটহাজারী, চট্টগ্রাম বিশ্ববিদ্যালয়, চট্টগ্রাম',
  address_en = 'Block 2, ground floor of Haji Abul Kalam Bhaban, Hathazari, University of Chittagong, Chattogram',
  social_links = '{"facebook":"https://facebook.com","instagram":"https://instagram.com","youtube":"https://youtube.com"}'::jsonb,
  default_locale = 'bn',
  meta_title = '১টাকায় বৃক্ষরোপণ',
  meta_title_en = '1 Taka Tree Plantation',
  meta_description = 'প্রতিদিন এক টাকা, মাসে একটি গাছ। ২০১৯ সাল থেকে পরিবেশ ও মানবতার সেবায় নিয়োজিত।',
  meta_description_en = 'One taka a day, one tree a month. Serving the environment and humanity since 2019.'
where id = 1;

-- ---------------------------------------------------------------------------
-- Pages
-- ---------------------------------------------------------------------------

insert into public.page_content (
  page_key, title, title_en, subtitle, subtitle_en, body, body_en,
  hero_image_url, meta_title, meta_title_en, meta_description, meta_description_en
)
values
  (
    'home',
    '১টাকায় সবুজের বিপ্লব! প্রতিদিন এক টাকা, মাসে একটি গাছ।',
    'A green revolution for 1 taka! One taka a day, one tree a month.',
    'আসুন, প্রতিদিন মাত্র ১ টাকা সঞ্চয় করে আমরা গড়ে তুলি সবুজ বাংলাদেশ। আপনার এই ক্ষুদ্র অবদান কেবল পরিবেশই বাঁচাবে না, বদলে দিতে পারে সুবিধাবঞ্চিত মানুষের জীবন। আজই যুক্ত হোন আমাদের বৃহৎ পরিবারে।',
    'Let us save just 1 taka a day and grow a greener Bangladesh. This small gift will not only protect the environment—it can change the lives of people left behind. Join our large family today.',
    'শুধু গাছ লাগানো নয়, আমরা গড়ছি ভবিষ্যৎ।',
    'We are not only planting trees—we are building the future.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80',
    '১টাকায় বৃক্ষরোপণ',
    '1 Taka Tree Plantation',
    'প্রতিদিন এক টাকা, মাসে একটি গাছ। ২০১৯ সাল থেকে পরিবেশ ও মানবতার সেবায় নিয়োজিত।',
    'One taka a day, one tree a month. Serving the environment and humanity since 2019.'
  ),
  (
    'about',
    'যে ভাবনা থেকে আমাদের যাত্রা',
    'The idea that started our journey',
    '১টাকায় বৃক্ষরোপণ — পরিবেশবাদী ও স্বেচ্ছাসেবী সংগঠন।',
    '1 Taka Tree Plantation — an environmental volunteer organization.',
    $demo$"১টাকায় বৃক্ষরোপণ" একটি পরিবেশবাদী ও স্বেচ্ছাসেবী সংগঠন, যা ২০১৯ সালের ১১ই জুন প্রতিষ্ঠা লাভ করে। সংগঠনটি তার জন্মলগ্ন থেকেই পরিবেশ সুরক্ষায় নিরলস কাজ করে যাচ্ছে। আমাদের মূল ধারণাটি খুবই সহজ কিন্তু অত্যন্ত প্রভাবশালী: একজন ব্যক্তি প্রতিদিন মাত্র এক টাকা সঞ্চয় করবেন, যার ফলে ত্রিশ দিনে তার সঞ্চয় হবে ত্রিশ টাকা। এই ত্রিশ টাকা দিয়ে মাসে অন্তত একটি গাছ রোপণ করা হবে।$demo$,
    $demo$"1 Taka Tree Plantation" is an environmental volunteer organization founded on 11 June 2019. From the day it began, it has worked without pause to protect the environment. The idea is simple and powerful: each person saves just one taka a day, so in thirty days the saving is thirty taka. With those thirty taka, at least one tree is planted each month.$demo$,
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
    'আমাদের কথা',
    'About',
    'লক্ষ্য, দৃষ্টি, মূল্যবোধ ও দল—সবই সম্পাদকীয় কন্টেন্ট থেকে।',
    'Mission, vision, values, and team assembled from the CMS.'
  ),
  (
    'contact',
    'আমাদের খুঁজুন',
    'Find us',
    'অংশীদারিত্ব, স্বেচ্ছাসেবা বা মাঠ সফর—লিখুন।',
    'Partnerships, volunteering, or a field visit—write to us.',
    'সকালের কুয়াশার মতো শান্ত উত্তর পাবেন। আমরা মাঠে থাকলেও বার্তা হারাই না।',
    'You will hear back calmly. Even when we are in the field, messages are not lost.',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1600&q=80',
    'যোগাযোগ',
    'Contact',
    '১টাকায় বৃক্ষরোপণের সাথে যোগাযোগ করুন।',
    'Get in touch with 1 Taka Tree Plantation.'
  ),
  (
    'gallery',
    'মাঠের আলো',
    'Light from the field',
    'অ্যালবাম খুলুন। প্রতিটি ছবি একটি আবাস।',
    'Open an album. Every photograph is a habitat.',
    'আমরা স্টক ছবি নয়, মাঠের নোট রাখি।',
    'These are field notes, not stock photos.',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1600&q=80',
    'ছবিঘর',
    'Gallery',
    'সংরক্ষণের অ্যালবাম ও লাইটবক্স।',
    'Conservation albums and lightbox viewing.'
  ),
  (
    'achievements',
    'যা বেড়েছে, যা ফিরেছে',
    'What has grown, what has returned',
    'মাইলফলক নয়, জীবন্ত হিসাব।',
    'Not trophies—living accounts of impact.',
    'গাছ, আবাস, মানুষ—প্রতিটি সংখ্যার পেছনে মাঠ আছে।',
    'Trees, habitat, people—every number has a field behind it.',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80',
    'অর্জন',
    'Achievements',
    'প্রভাবের মাইলফলক ও তারিখ।',
    'Impact milestones and dates.'
  ),
  (
    'transparency',
    'খোলা খাতা',
    'An open ledger',
    'সংগ্রহ সবুজ, ব্যয় মাটির রঙে।',
    'Collections in leaf green, expenses in soil.',
    'প্রকাশিত হিসাবই দেখবেন। খসড়া কখনো সামনে আসে না।',
    'Only published entries appear. Drafts never reach the public.',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    'স্বচ্ছতা',
    'Transparency',
    'সংগ্রহ ও ব্যয়ের প্রকাশিত ইতিহাস।',
    'Published collection and expense history.'
  ),
  (
    'membership',
    'শিকড় গাড়ুন',
    'Put down roots',
    'সদস্য হওয়া মানে একবার দান নয়, স্থায়ী অঙ্গীকার।',
    'Membership is not a one-time gift. It is a long allegiance.',
    'চাঁদায় চারা, প্রহরা ও শিক্ষা চলে। অনুমোদন ম্যানুয়াল—আমরা প্রতিটি আবেদন পড়ি।',
    'Fees grow saplings, patrols, and education. Approval is manual—we read every application.',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80',
    'সদস্যপদ',
    'Membership',
    'সদস্য পরিকল্পনা ও আবেদন।',
    'Membership plans and application.'
  ),
  (
    'careers',
    'মাঠে জায়গা আছে',
    'There is room in the field',
    'গবেষণা, প্রহরা, শিক্ষা—যেখানে হাত লাগে।',
    'Research, patrol, education—where hands are needed.',
    'আমরা সিটি অফিসের চেয়ে নদীর ধারে বেশি সময় কাটাই।',
    'We spend more time on riverbanks than in city offices.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80',
    'কর্মসংস্থান',
    'Careers',
    'খালি পদ ও আবেদন।',
    'Open roles and applications.'
  ),
  (
    'magazines',
    'মাঠের পত্রিকা',
    'Field journals',
    'প্রতিটি সংখ্যা অনলাইনে পড়ুন, অথবা পিডিএফ নামিয়ে রাখুন।',
    'Read every issue online, or download the PDF to keep.',
    'আমাদের ম্যাগাজিন মাঠের গল্প, অর্জন ও শিক্ষা একসাথে রাখে।',
    'Our magazines keep field stories, impact, and learning in one place.',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    'ম্যাগাজিন',
    'Magazines',
    'অনলাইনে পড়ুন ও পিডিএফ ডাউনলোড করুন।',
    'Read online and download the PDF.'
  )
on conflict (page_key) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  subtitle = excluded.subtitle,
  subtitle_en = excluded.subtitle_en,
  body = excluded.body,
  body_en = excluded.body_en,
  hero_image_url = excluded.hero_image_url,
  meta_title = excluded.meta_title,
  meta_title_en = excluded.meta_title_en,
  meta_description = excluded.meta_description,
  meta_description_en = excluded.meta_description_en;

-- ---------------------------------------------------------------------------
-- About sections
-- ---------------------------------------------------------------------------

insert into public.about_sections (
  id, title, title_en, slug, section_type, body, body_en, image_url, sort_order, is_published
)
values
  (
    '11111111-1111-4111-a111-000000000101',
    'বৃক্ষরোপণ ও পরিচর্যা',
    'Planting and care',
    'mission',
    'mission',
    '১টাকায় বৃক্ষরোপণ শুধুমাত্র গাছ লাগিয়েই দায়িত্ব শেষ করে না, বরং প্রতিটি রোপণকৃত বৃক্ষের সঠিক পরিচর্যা ও বেড়ে ওঠাও নিশ্চিত করে।',
    '1 Taka Tree Plantation does not stop at planting a tree. It also makes sure every planted tree is cared for and grows.',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80',
    1,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000102',
    'শুধু গাছ লাগানো নয়, আমরা গড়ছি ভবিষ্যৎ',
    'We are not only planting trees—we are building the future',
    'vision',
    'vision',
    'এভাবে আমরা যদি এই ক্যাম্পেইনটি বাংলাদেশের ১৬ কোটি মানুষের কাছে পৌঁছাতে পারি, তবে প্রতিদিন মাত্র এক টাকা সঞ্চয়ের মধ্য দিয়ে মাসে ১৬ কোটি গাছ রোপণ সম্ভব! আর এই বিশাল উদ্যোগের মধ্য দিয়েই আমরা দেশের মোট বনায়নের পরিমাণ ২৫%-এ উন্নীত করতে পারবো।',
    $demo$If this campaign can reach Bangladesh's 160 million people, one taka saved each day can plant 160 million trees a month. Through this vast effort we can raise the country's forest cover to 25%.$demo$,
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1600&q=80',
    2,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000103',
    'দক্ষতা বৃদ্ধি ও সচেতনতা',
    'Skills and awareness',
    'values',
    'values',
    'পরিবেশ রক্ষায় সাধারণ মানুষকে সচেতন করতে এবং সদস্যদের ব্যক্তিগত দক্ষতা বৃদ্ধিতে সংগঠনটি ইতিমধ্যে দেশব্যাপী বেশকিছু সফল ক্যাম্পেইন পরিচালনা করেছে।',
    $demo$To make people aware of environmental protection and to grow members' skills, the organization has already run several successful campaigns across the country.$demo$,
    null,
    3,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000104',
    'যে ভাবনা থেকে আমাদের যাত্রা',
    'The idea that started our journey',
    'story',
    'story',
    $demo$"১টাকায় বৃক্ষরোপণ" একটি পরিবেশবাদী ও স্বেচ্ছাসেবী সংগঠন, যা ২০১৯ সালের ১১ই জুন প্রতিষ্ঠা লাভ করে। সংগঠনটি তার জন্মলগ্ন থেকেই পরিবেশ সুরক্ষায় নিরলস কাজ করে যাচ্ছে। আমাদের মূল ধারণাটি খুবই সহজ কিন্তু অত্যন্ত প্রভাবশালী: একজন ব্যক্তি প্রতিদিন মাত্র এক টাকা সঞ্চয় করবেন, যার ফলে ত্রিশ দিনে তার সঞ্চয় হবে ত্রিশ টাকা। এই ত্রিশ টাকা দিয়ে মাসে অন্তত একটি গাছ রোপণ করা হবে।

এভাবে আমরা যদি এই ক্যাম্পেইনটি বাংলাদেশের ১৬ কোটি মানুষের কাছে পৌঁছাতে পারি, তবে প্রতিদিন মাত্র এক টাকা সঞ্চয়ের মধ্য দিয়ে মাসে ১৬ কোটি গাছ রোপণ সম্ভব! আর এই বিশাল উদ্যোগের মধ্য দিয়েই আমরা দেশের মোট বনায়নের পরিমাণ ২৫%-এ উন্নীত করতে পারবো। এই সুদূরপ্রসারী ভাবনা ও স্বপ্ন থেকেই "১টাকায় বৃক্ষরোপণ"-এর যাত্রা শুরু।$demo$,
    $demo$"1 Taka Tree Plantation" is an environmental volunteer organization founded on 11 June 2019. From the day it began, it has worked without pause to protect the environment. The idea is simple and powerful: each person saves just one taka a day, so in thirty days the saving is thirty taka. With those thirty taka, at least one tree is planted each month.

If this campaign can reach Bangladesh's 160 million people, one taka saved each day can plant 160 million trees a month. Through this vast effort we can raise the country's forest cover to 25%. From this far-reaching idea and dream, the journey of "1 Taka Tree Plantation" began.$demo$,
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80',
    4,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000105',
    'পথচলা',
    'The path',
    'timeline',
    'timeline',
    $demo$১১ জুন ২০১৯ · যাত্রা শুরু
প্রতিদিন ১ টাকা · মাসে একটি গাছ
৪,১৮৩+ সদস্য · দেশদরদী পরিবার
১৬ কোটি মানুষ · স্বপ্নের গন্তব্য$demo$,
    $demo$11 June 2019 · The journey begins
1 taka a day · one tree a month
4,183+ members · a patriotic family
160 million people · the dream destination$demo$,
    null,
    5,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000106',
    'সুবিধাবঞ্চিতদের পাশে',
    'Standing with people left behind',
    'people',
    'custom',
    'পরিবেশের পাশাপাশি আমরা কাজ করছি ভাগ্যহত ও ঠিকানা অভাবী মানুষের জন্য। আমাদের বিশ্বাস, আমাদের এই ক্ষুদ্র অবদানে হয়তো কারো জীবন আমূল বদলে যাবে। কে বলতে পারে, হয়তো এই সুবিধাবঞ্চিতদের মধ্যেই লুকিয়ে আছে আগামী দিনের জাস্টিস হোসেন কিংবা এ. পি. জে. আব্দুল কালামদের মত গুণী ব্যক্তিত্ব!',
    'Alongside the environment, we work for people without fortune or a home. We believe this small gift may change a life. Who can say—among them may be the next Justice Hossain or A. P. J. Abdul Kalam.',
    null,
    6,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  section_type = excluded.section_type,
  body = excluded.body,
  body_en = excluded.body_en,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

-- ---------------------------------------------------------------------------
-- Team
-- ---------------------------------------------------------------------------

insert into public.team_members (
  id, full_name, full_name_en, role_title, role_title_en, bio, bio_en, photo_url, sort_order, is_published
)
values
  (
    '11111111-1111-4111-a111-000000000001',
    'নুসরাত জাহান',
    'Nusrat Jahan',
    'নির্বাহী পরিচালক',
    'Executive director',
    'বনবিদ। নদীর হিসাব রাখেন খাতায়, গাছের নাম মুখে।',
    'A forester who keeps river accounts on paper and tree names in memory.',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    1,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000002',
    'রফিকুল ইসলাম',
    'Rafiqul Islam',
    'মাঠ সমন্বয়ক',
    'Field coordinator',
    'ভোরের কুয়াশায় পাহারা। গ্রামের সাথে কথা বলেন আগে, মানচিত্র পরে।',
    'Dawn patrols. He speaks with villages first, maps second.',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    2,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000003',
    'মাহমুদা আক্তার',
    'Mahmuda Akter',
    'শিক্ষা ও সম্পৃক্ততা',
    'Education and outreach',
    'শিশুদের পাতার শিরা দেখান, নাম মুখস্থ করান না।',
    'She shows children the veins of a leaf before asking them to memorise names.',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    3,
    true
  )
on conflict (id) do update set
  full_name = excluded.full_name,
  full_name_en = excluded.full_name_en,
  role_title = excluded.role_title,
  role_title_en = excluded.role_title_en,
  bio = excluded.bio,
  bio_en = excluded.bio_en,
  photo_url = excluded.photo_url,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

-- ---------------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------------

insert into public.gallery_albums (
  id, title, title_en, slug, description, description_en, cover_image_url, event_date, sort_order, is_published
)
values
  (
    '11111111-1111-4111-a111-000000000011',
    'সুন্দরবনের কুয়াশা',
    'Sundarbans mist',
    'sundarbans-mist',
    'জোয়ারের পর নীরব ম্যানগ্রোভ।',
    'Quiet mangrove after the tide.',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
    '2025-11-12',
    1,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000012',
    'নদীর ধার',
    'River margin',
    'river-margin',
    'পুনরুদ্ধারের প্রথম বছর।',
    'The first year of restoration.',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1600&q=80',
    '2025-08-03',
    2,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000013',
    'চারা রোপণ',
    'Sapling day',
    'sapling-day',
    'গ্রামের শিশুরা মাটি খুঁড়েছে।',
    'Village children opened the soil.',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80',
    '2026-01-21',
    3,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  description = excluded.description,
  description_en = excluded.description_en,
  cover_image_url = excluded.cover_image_url,
  event_date = excluded.event_date,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

insert into public.gallery_images (
  id, album_id, image_url, caption, caption_en, alt_text, alt_text_en, sort_order, is_published
)
values
  (
    '11111111-1111-4111-a111-000000000021',
    '11111111-1111-4111-a111-000000000011',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
    'সকালের কুয়াশা, শিকড়ের উপর জোয়ার।',
    'Morning mist, tide over the roots.',
    'ম্যানগ্রোভ বনে কুয়াশা',
    'Mist in a mangrove forest',
    1,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000022',
    '11111111-1111-4111-a111-000000000011',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80',
    'ছাউনির নিচে সবুজ আলো।',
    'Green light under the canopy.',
    'বনের ছাউনি',
    'Forest canopy',
    2,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000023',
    '11111111-1111-4111-a111-000000000011',
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1600&q=80',
    'একটি মাছরাঙা নদীর উপর।',
    'A kingfisher over the creek.',
    'পাখি উড়ে যাচ্ছে',
    'Bird in flight',
    3,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000024',
    '11111111-1111-4111-a111-000000000011',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80',
    'জলাভূমির শান্ত পানি।',
    'Still water of the wetland.',
    'জলাভূমি',
    'Wetland',
    4,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000025',
    '11111111-1111-4111-a111-000000000012',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1600&q=80',
    'পুনরুদ্ধারের তীরে নতুন ঘাস।',
    'New grass on the restored bank.',
    'নদী',
    'River',
    1,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000026',
    '11111111-1111-4111-a111-000000000012',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    'মাটি ভেজা, বীজ অপেক্ষা করছে।',
    'Wet soil, seed waiting.',
    'সবুজ উপত্যকা',
    'Green valley',
    2,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000027',
    '11111111-1111-4111-a111-000000000012',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80',
    'শ্যাওলার উপর সূর্য।',
    'Sun on the moss.',
    'শ্যাওলা',
    'Moss',
    3,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000028',
    '11111111-1111-4111-a111-000000000013',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80',
    'প্রথম সারি চারা।',
    'The first row of saplings.',
    'চারা',
    'Saplings',
    1,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000029',
    '11111111-1111-4111-a111-000000000013',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    'পাতার শিরা—শিক্ষার শুরু।',
    'Leaf veins—where teaching begins.',
    'পাতা',
    'Leaf',
    2,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000030',
    '11111111-1111-4111-a111-000000000013',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80',
    'যে ছায়া আমরা ফেরাতে চাই।',
    'The shade we want to return.',
    'ছাউনি',
    'Canopy',
    3,
    true
  )
on conflict (id) do update set
  album_id = excluded.album_id,
  image_url = excluded.image_url,
  caption = excluded.caption,
  caption_en = excluded.caption_en,
  alt_text = excluded.alt_text,
  alt_text_en = excluded.alt_text_en,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

-- ---------------------------------------------------------------------------
-- Achievements
-- ---------------------------------------------------------------------------

insert into public.achievements (
  id, title, title_en, slug, description, description_en,
  metric_value, metric_label, metric_label_en, achieved_on, image_url, sort_order, is_published
)
values
  (
    '11111111-1111-4111-a111-000000000081',
    'গর্বিত ও দেশদরদী সদস্য',
    'Proud patriotic members',
    'members',
    'প্রতিদিন এক টাকা করে একটি সুন্দর পৃথিবী গড়ায় ভূমিকা রাখছেন।',
    'Giving one taka a day to help build a better world.',
    4183,
    'গর্বিত ও দেশদরদী সদস্য',
    'proud patriotic members',
    '2019-06-11',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80',
    1,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000082',
    'আমাদের স্বপ্নের গন্তব্য',
    'Our dream destination',
    'destination',
    'বাংলাদেশের ১৬ কোটি মানুষের কাছে এই ক্যাম্পেইন পৌঁছানো।',
    $demo$Reaching Bangladesh's 160 million people with this campaign.$demo$,
    160000000,
    'আমাদের স্বপ্নের গন্তব্য',
    'our dream destination',
    null,
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80',
    2,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000083',
    'দেশের মোট বনায়ন লক্ষ্যমাত্রা',
    'National afforestation target',
    'forest-cover',
    'দেশের মোট বনায়নের পরিমাণ ২৫%-এ উন্নীত করা।',
    $demo$Raise the country's forest cover to 25%.$demo$,
    25,
    'দেশের মোট বনায়ন লক্ষ্যমাত্রা',
    'national afforestation target',
    null,
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    3,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000084',
    'আমাদের পথচলার শুরু',
    'The start of our path',
    'founded',
    '১১ জুন ২০১৯, যাত্রা শুরু।',
    '11 June 2019, the journey begins.',
    null,
    'আমাদের পথচলার শুরু',
    'the start of our path',
    '2019-06-11',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1600&q=80',
    4,
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  description = excluded.description,
  description_en = excluded.description_en,
  metric_value = excluded.metric_value,
  metric_label = excluded.metric_label,
  metric_label_en = excluded.metric_label_en,
  achieved_on = excluded.achieved_on,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;

-- ---------------------------------------------------------------------------
-- Finance
-- ---------------------------------------------------------------------------

insert into public.finance_categories (id, name, name_en, kind, is_active)
values
  ('11111111-1111-4111-a111-000000000041', 'দান', 'Donations', 'collection', true),
  ('11111111-1111-4111-a111-000000000042', 'অনুদান', 'Grants', 'collection', true),
  ('11111111-1111-4111-a111-000000000043', 'চারা ও নার্সারি', 'Nursery', 'expense', true),
  ('11111111-1111-4111-a111-000000000044', 'মাঠ প্রহরা', 'Field patrol', 'expense', true)
on conflict (id) do update set
  name = excluded.name,
  name_en = excluded.name_en,
  kind = excluded.kind,
  is_active = excluded.is_active;

insert into public.finance_entries (
  id, kind, category_id, title, title_en, description, description_en,
  amount, entry_date, source_or_payee, receipt_url, is_published
)
values
  (
    '11111111-1111-4111-a111-000000000051',
    'collection',
    '11111111-1111-4111-a111-000000000041',
    'শীতকালীন দান',
    'Winter giving',
    'সদস্য ও অতিথি দান।',
    'Member and guest gifts.',
    420000,
    '2026-01-12',
    'সদস্যবৃন্দ',
    null,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000052',
    'collection',
    '11111111-1111-4111-a111-000000000042',
    'জলাভূমি অনুদান',
    'Wetland grant',
    'এক বছরের পুনরুদ্ধার।',
    'One year of restoration.',
    780000,
    '2025-11-02',
    'আঞ্চলিক তহবিল',
    null,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000053',
    'expense',
    '11111111-1111-4111-a111-000000000043',
    'দেশীয় চারা ক্রয়',
    'Native sapling purchase',
    'হিজল, করচ, গরান।',
    'Hijal, koroch, goran.',
    185000,
    '2026-02-04',
    'নার্সারি সমবায়',
    null,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000054',
    'expense',
    '11111111-1111-4111-a111-000000000044',
    'নদী প্রহরা',
    'River watch',
    'নৌকা, টর্চ, রেশন।',
    'Boats, torches, rations.',
    96000,
    '2026-01-28',
    'স্থানীয় দল',
    null,
    true
  ),
  (
    '11111111-1111-4111-a111-000000000055',
    'expense',
    '11111111-1111-4111-a111-000000000043',
    'বিদ্যালয় কিট',
    'School kits',
    'পাতার গাইড ও মাপার ফিতা।',
    'Leaf guides and measuring tape.',
    54000,
    '2025-12-18',
    'শিক্ষা ইউনিট',
    null,
    true
  )
on conflict (id) do update set
  kind = excluded.kind,
  category_id = excluded.category_id,
  title = excluded.title,
  title_en = excluded.title_en,
  description = excluded.description,
  description_en = excluded.description_en,
  amount = excluded.amount,
  entry_date = excluded.entry_date,
  source_or_payee = excluded.source_or_payee,
  is_published = excluded.is_published;

-- ---------------------------------------------------------------------------
-- Membership plans
-- ---------------------------------------------------------------------------

insert into public.membership_plans (
  id, name, name_en, slug, description, description_en,
  fee_amount, duration_label, duration_label_en, benefits, benefits_en, is_active, sort_order
)
values
  (
    '11111111-1111-4111-a111-000000000091',
    'বীজ',
    'Seed',
    'seed',
    'মাসিক খবর ও বার্ষিক মাঠ দিবস।',
    'Monthly notes and an annual field day.',
    1200,
    'বার্ষিক',
    'yearly',
    'নিউজলেটার · মাঠ দিবস',
    'Newsletter · Field day',
    true,
    1
  ),
  (
    '11111111-1111-4111-a111-000000000092',
    'শিকড়',
    'Root',
    'root',
    'দুইটি মাঠ সফর ও নামফলকে উল্লেখ।',
    'Two field visits and a name on the grove plaque.',
    5000,
    'বার্ষিক',
    'yearly',
    'মাঠ সফর · নামফলক · ভোট',
    'Field visits · Plaque · Vote',
    true,
    2
  ),
  (
    '11111111-1111-4111-a111-000000000093',
    'ছাউনি',
    'Canopy',
    'canopy',
    'এক হেক্টরের অভিভাবক।',
    'Guardian of one hectare.',
    25000,
    'বার্ষিক',
    'yearly',
    'অভিভাবকত্ব · বার্ষিক প্রতিবেদন · উপদেষ্টা আসন',
    'Guardianship · Annual report · Advisory seat',
    true,
    3
  )
on conflict (slug) do update set
  name = excluded.name,
  name_en = excluded.name_en,
  description = excluded.description,
  description_en = excluded.description_en,
  fee_amount = excluded.fee_amount,
  duration_label = excluded.duration_label,
  duration_label_en = excluded.duration_label_en,
  benefits = excluded.benefits,
  benefits_en = excluded.benefits_en,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Jobs
-- ---------------------------------------------------------------------------

insert into public.job_postings (
  id, title, title_en, slug, department, department_en, location, location_en,
  employment_type, description, description_en, requirements, requirements_en, deadline, is_published
)
values
  (
    '11111111-1111-4111-a111-000000000111',
    'মাঠ জীববিদ',
    'Field biologist',
    'field-biologist',
    'বিজ্ঞান',
    'Science',
    'খুলনা ও সুন্দরবন',
    'Khulna and Sundarbans',
    'full_time',
    'পাখি ও ম্যানগ্রোভ জরিপ, গ্রামের সাথে তথ্য ভাগাভাগি, মাসিক নোট।',
    'Bird and mangrove surveys, sharing data with villages, monthly field notes.',
    'জীববিদ্যা বা সংশ্লিষ্ট বিষয়ে স্নাতক। নৌকা ও কাদা সহ্য করতে হবে।',
    'Degree in biology or related field. Comfort with boats and mud is required.',
    '2026-06-30',
    true
  ),
  (
    '11111111-1111-4111-a111-000000000112',
    'শিক্ষা সহযোগী',
    'Education fellow',
    'education-fellow',
    'শিক্ষা',
    'Education',
    'সাতক্ষীরা',
    'Satkhira',
    'contract',
    'বিদ্যালয়ে পাতার ক্লাস, নদীর মাপ, শিক্ষক প্রশিক্ষণ।',
    'Leaf classes, river measuring, teacher training.',
    'শিক্ষকতা বা পরিবেশ শিক্ষার অভিজ্ঞতা। বাংলায় সাবলীল।',
    'Teaching or environmental education experience. Fluent Bangla.',
    '2026-05-15',
    true
  ),
  (
    '11111111-1111-4111-a111-000000000113',
    'নদী প্রহরা স্বেচ্ছাসেবক',
    'River watch volunteer',
    'river-watch-volunteer',
    'প্রহরা',
    'Patrol',
    'পদ্মা তীর',
    'Padma bank',
    'volunteer',
    'সাপ্তাহিক পাহারা, ছবি তোলা, স্থানীয় দলের সাথে হাঁটা।',
    'Weekly patrols, photographs, walking with the local team.',
    'সাঁতার জানা। রাতের শিফট সম্ভব।',
    'Must swim. Night shifts possible.',
    '2026-12-31',
    true
  )
on conflict (slug) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  department = excluded.department,
  department_en = excluded.department_en,
  location = excluded.location,
  location_en = excluded.location_en,
  employment_type = excluded.employment_type,
  description = excluded.description,
  description_en = excluded.description_en,
  requirements = excluded.requirements,
  requirements_en = excluded.requirements_en,
  deadline = excluded.deadline,
  is_published = excluded.is_published;

-- ---------------------------------------------------------------------------
-- Causes
-- ---------------------------------------------------------------------------

insert into public.causes_projects (
  id, title, title_en, slug, short_description, short_description_en, description, description_en,
  goal_amount, raised_amount, image_url, status, featured
)
values
  (
    '11111111-1111-4111-a111-000000000061',
    'ম্যানগ্রোভ করিডোর',
    'Mangrove corridor',
    'mangrove-corridor',
    'জোয়ারের পথে দেশীয় গরান ফেরানো।',
    'Return native goran along the tide path.',
    'ক্ষতিগ্রস্ত তীরে চারা, স্থানীয় প্রহরা, এবং তিন বছরের পরিচর্যা।',
    'Saplings on damaged banks, local patrols, and three years of care.',
    1500000,
    820000,
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
    'active',
    true
  ),
  (
    '11111111-1111-4111-a111-000000000062',
    'নদীর তৃণভূমি',
    'River grassland',
    'river-grassland',
    'পাখির বিশ্রামের তীর ফিরিয়ে আনা।',
    'Bring back the bird-resting bank.',
    'আক্রমণাত্মক প্রজাতি সরানো, স্থানীয় ঘাস, শিক্ষা ট্রেইল।',
    'Remove invasives, native grasses, a teaching trail.',
    900000,
    410000,
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1600&q=80',
    'active',
    true
  ),
  (
    '11111111-1111-4111-a111-000000000063',
    'বিদ্যালয় বন',
    'School groves',
    'school-groves',
    'প্রতিটি উঠানে একটি ছোট আবাস।',
    'A small habitat in every courtyard.',
    '৪৭টি বিদ্যালয়ে চারা, কিট ও শিক্ষক প্রশিক্ষণ।',
    'Saplings, kits, and teacher training in 47 schools.',
    480000,
    480000,
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80',
    'completed',
    false
  )
on conflict (slug) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  short_description = excluded.short_description,
  short_description_en = excluded.short_description_en,
  description = excluded.description,
  description_en = excluded.description_en,
  goal_amount = excluded.goal_amount,
  raised_amount = excluded.raised_amount,
  image_url = excluded.image_url,
  status = excluded.status,
  featured = excluded.featured;

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------

insert into public.blog_posts (
  id, title, title_en, slug, excerpt, excerpt_en, content, content_en,
  cover_image_url, status, published_at
)
values
  (
    '11111111-1111-4111-a111-000000000071',
    'কুয়াশায় একটি মাছরাঙা',
    'A kingfisher in the mist',
    'kingfisher-mist',
    'জোয়ারের পর নীরবতা। তারপর নীল এক ঝলক।',
    'Silence after the tide. Then a flash of blue.',
    'আমরা নদী মাপতে গিয়েছিলাম। পাখিটি হিসাব নষ্ট করল, এবং সেটাই দিনের সেরা নোট।',
    $demo$We went to measure the river. The bird ruined the tally, and that became the day’s best note.$demo$,
    'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1600&q=80',
    'published',
    '2026-02-11T00:00:00Z'
  ),
  (
    '11111111-1111-4111-a111-000000000072',
    'শ্যাওলার হিসাব',
    'The moss ledger',
    'moss-ledger',
    'ছোট জিনিসই মাটি ধরে রাখে।',
    'The small things hold the soil.',
    'প্রহরা শুধু গাছ কাটা নয়। শ্যাওলা শুকিয়ে গেলেও আমরা খেয়াল রাখি।',
    'Patrol is not only about cutting. We notice when moss dries.',
    'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80',
    'published',
    '2025-12-02T00:00:00Z'
  )
on conflict (slug) do update set
  title = excluded.title,
  title_en = excluded.title_en,
  excerpt = excluded.excerpt,
  excerpt_en = excluded.excerpt_en,
  content = excluded.content,
  content_en = excluded.content_en,
  cover_image_url = excluded.cover_image_url,
  status = excluded.status,
  published_at = excluded.published_at;

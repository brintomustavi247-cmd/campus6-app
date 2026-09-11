/**
 * CAMPUS 6.0 — Daily Ayah/Dua Collection
 * প্রতিদিন একটি করে আয়াত/দোয়া rotate হবে (day-of-year ভিত্তিক)
 */

export interface DailyAyah {
  id: number;
  type: 'ayah' | 'dua';
  arabic: string;
  translit: string;
  bangla: string;
  reference: string;
  tip?: string;
}

export const DAILY_AYAHS: DailyAyah[] = [
  {
    id: 1, type: 'ayah',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    translit: 'Rabbi zidnī ‘ilmā',
    bangla: 'হে আমার রব, আমার জ্ঞান বৃদ্ধি করুন।',
    reference: 'সূরা ত্বা-হা ২০:১১',
    tip: 'পড়া শুরু করার আগে এই দোয়াটি পড়তে পারো।',
  },
  {
    id: 2, type: 'ayah',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translit: 'Fa-inna ma‘al-‘usri yusrā',
    bangla: 'নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে।',
    reference: 'সূরা আশ-শারহ ৯৪:৫',
    tip: 'আজকের struggle তোমার পুরো গল্প নয়।',
  },
  {
    id: 3, type: 'ayah',
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translit: 'Inna ma‘al-‘usri yusrā',
    bangla: 'নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে।',
    reference: 'সূরা আশ-শারহ ৯৪:৬',
    tip: 'কঠিন chapter দেখে হাল ছেড়ো না।',
  },
  {
    id: 4, type: 'ayah',
    arabic: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا',
    translit: 'Wa lā tahinū wa lā tahzanū',
    bangla: 'তোমরা দুর্বল হয়ো না এবং দুঃখ করো না।',
    reference: 'সূরা আলে ইমরান ৩:১৩৯',
    tip: 'একটা খারাপ mock test তোমার ক্ষমতা নির্ধারণ করে না।',
  },
  {
    id: 5, type: 'ayah',
    arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    translit: 'Innallāha ma‘as-sābirīn',
    bangla: 'নিশ্চয়ই আল্লাহ ধৈর্যশীলদের সাথে আছেন।',
    reference: 'সূরা আল-বাকারা ২:১৫৩',
    tip: 'Slow progress is still progress.',
  },
  {
    id: 6, type: 'ayah',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translit: 'Alā bi dhikrillāhi tatma’innul-qulūb',
    bangla: 'জেনে রাখো, আল্লাহর স্মরণেই অন্তর প্রশান্ত হয়।',
    reference: 'সূরা আর-রা‘দ ১৩:২৮',
    tip: 'Exam anxiety এলে শুধু বই নয়, রবের কাছেও ফিরে যাও।',
  },
  {
    id: 7, type: 'ayah',
    arabic: 'فَإِذَا فَرَغْتَ فَانصَبْ',
    translit: 'Fa-idhā faraghta fansab',
    bangla: 'অতঃপর যখন অবসর পাও, তখন পরিশ্রমে নিয়োজিত হও।',
    reference: 'সূরা আশ-শারহ ৯:৭',
    tip: 'একটা task শেষ মানে পুরো দিন শেষ নয়।',
  },
  {
    id: 8, type: 'ayah',
    arabic: 'وَإِلَىٰ رَبِّكَ فَارْغَب',
    translit: 'Wa ilā rabbika farghab',
    bangla: 'আর তোমার রবের প্রতিই আকাঙ্ক্ষা রাখো।',
    reference: 'সূরা আশ-শারহ ৯:৮',
    tip: 'চেষ্টা তোমার, ফল আল্লাহর হাতে।',
  },
  {
    id: 9, type: 'ayah',
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translit: 'Lā yukallifullāhu nafsan illā wus‘ahā',
    bangla: 'আল্লাহ কাউকে তার সাধ্যের বাইরে দায়িত্ব দেন না।',
    reference: 'সূরা আল-বাকারা ২:২৮৬',
    tip: 'তুমি যে লড়াইয়ের মধ্যে আছো, আল্লাহ তোমার সামর্থ্য জানেন।',
  },
  {
    id: 10, type: 'ayah',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    translit: 'Wa man yatawakkal ‘alallāhi fahuwa hasbuh',
    bangla: 'যে আল্লাহর ওপর ভরসা করে, তিনিই তার জন্য যথেষ্ট।',
    reference: 'সূরা আত-তালাক ৬৫:৩',
    tip: 'Maximum effort + tawakkul.',
  },
  {
    id: 11, type: 'ayah',
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    translit: 'Wa man yattaqillāha yaj‘al lahu makhrajā',
    bangla: 'যে আল্লাহকে ভয় করে, তিনি তার জন্য বের হওয়ার পথ করে দেন।',
    reference: 'সূরা আত-তালাক ৬৫:',
    tip: 'এখন পথ না দেখালেও পথ বন্ধ হয়ে যায়নি।',
  },
  {
    id: 12, type: 'ayah',
    arabic: 'وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ',
    translit: 'Wa al-laysa lil-insāni illā mā sa‘ā',
    bangla: 'মানুষের জন্য তাই আছে, যার জন্য সে চেষ্টা করেছে।',
    reference: 'সূরা আন-নাজম ৫৩:৩৯',
    tip: 'আজকের effort-টাই আগামীকালের result-এর অংশ।',
  },
  {
    id: 13, type: 'ayah',
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
    translit: 'Fadhkurūnī adhkurkum',
    bangla: 'তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব।',
    reference: 'সূরা আল-বাকারা ২:১৫২',
    tip: 'Study routine-এর মাঝেও ছোট ছোট dhikr রাখো।',
  },
  {
    id: 14, type: 'ayah',
    arabic: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّىٰ يُغَيِّرُوا مَا بِأَنفُسِهِمْ',
    translit: 'Innallāha lā yughayyiru mā biqawmin hattā yughayyirū mā bi’anfusihim',
    bangla: 'কোনো জাতি নিজেদের পরিবর্তন না করা পর্যন্ত আল্লাহ তাদের অবস্থা পরিবর্তন করেন না।',
    reference: 'সূরা আর-রা‘দ ১৩:১১',
    tip: 'Routine বদলাতে চাইলে আজকের habit থেকেই শুরু করো।',
  },
  {
    id: 15, type: 'ayah',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    translit: 'Hasbunallāhu wa ni‘mal-wakīl',
    bangla: 'আল্লাহই আমাদের জন্য যথেষ্ট, আর তিনিই উত্তম কর্মনির্বাহক।',
    reference: 'সূরা আলে ইমরান ৩:১৭৩',
    tip: 'ভয়কে দিয়ে decision নিও না।',
  },
  {
    id: 16, type: 'ayah',
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي',
    translit: 'Rabbishrah lī sadrī',
    bangla: 'হে আমার রব, আমার জন্য আমার বক্ষ প্রশস্ত করে দিন।',
    reference: 'সূরা ত্বা-হা ২০:২৫',
    tip: 'কঠিন বিষয় পড়ার আগে পড়তে পারো।',
  },
  {
    id: 17, type: 'ayah',
    arabic: 'لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    translit: 'Lā ilāha illā anta subhānaka, innī kuntu minaz-zālimīn',
    bangla: 'আপনি ছাড়া কোনো উপাস্য নেই; আপনি পবিত্র। নিশ্চয়ই আমি জালিমদের অন্তর্ভুক্ত ছিলাম।',
    reference: 'সূরা আল-আম্বিয়া ২:৮৭',
    tip: 'মন ভারী লাগলে এই দোয়াটি পড়ো — অন্তরে প্রশান্তি আসবে।',
  },
  {
    id: 18, type: 'dua',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا',
    translit: 'Allahumma innī as’aluka ‘ilman nāfi‘ā',
    bangla: 'হে আল্লাহ, আমি আপনার কাছে উপকারী জ্ঞান চাই।',
    reference: 'সহীহ ইবন মাজাহ',
    tip: 'পড়ার শুরুতে এই দোয়াটি পড়তে পারো।',
  },
  {
    id: 19, type: 'dua',
    arabic: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا',
    translit: 'Allahumma lā sahla illā mā ja‘altahu sahlā',
    bangla: 'হে আল্লাহ, আপনি যা সহজ করেন তা ছাড়া কোনো কিছুই সহজ নয়।',
    reference: 'সুনান ইবন মাজাহ',
    tip: 'কঠিন exam/topic-এর আগে পড়তে পারো।',
  },
  {
    id: 20, type: 'dua',
    arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
    translit: 'Rabbi innī limā anzalta ilayya min khayrin faqīr',
    bangla: 'হে আমার রব, আপনি যে কল্যাণ আমার প্রতি নাযিল করবেন, আমি তার মুখাপেক্ষী।',
    reference: 'সূরা আল-কাসাস ২৮:২৪',
  },
  {
    id: 21, type: 'dua',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا',
    translit: 'Rabbanā lā tuzigh qulūbanā',
    bangla: 'হে আমাদের রব, আমাদের অন্তর বক্র করে দেবেন না।',
    reference: 'সূরা আলে ইমরান ৩:৮',
  },
  {
    id: 22, type: 'dua',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً',
    translit: 'Rabbanā ātinā fid-dunyā hasanah',
    bangla: 'হে আমাদের রব, আমাদের দুনিয়াতে কল্যাণ দান করুন।',
    reference: 'সূরা আল-বাকারা ২:২০১',
  },
];
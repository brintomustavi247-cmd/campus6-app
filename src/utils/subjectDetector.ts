import { SubjectCategory } from '../types';

export const DEFAULT_KEYWORD_MAP: Record<SubjectCategory, string[]> = {
  Physics: [
    'ভেক্টর', 'গতিবিদ্যা', 'বলবিদ্যা', 'কাজ', 'শক্তি', 'ক্ষমতা', 'মহাকর্ষ', 
    'অভিকর্ষ', 'তরঙ্গ', 'পর্যায়বৃত্ত', 'গাঠনিক', 'আদর্শ গ্যাস', 'তড়িৎ'
  ],
  Chemistry: [
    'রসায়ন', 'পরিমাণগত', 'রাসায়নিক', 'গুণগত', 'কোষ রসায়ন', 'ল্যাবরেটরি', 
    'পর্যায়বৃত্ত ধর্ম', 'কর্মমুখী', 'গ্যাস', 'তড়িৎ রসায়ন'
  ],
  'Higher Mathematics': [
    'সরলরেখা', 'বৃত্ত', 'জটিল সংখ্যা', 'কনিকস', 'বিন্যাস', 'সমাবেশ', 
    'বিস্তার', 'পরিমাপ', 'সম্ভাবনা', 'বহুপদী', 'দ্বিপদী'
  ],
  Biology: [
    'উদ্ভিদ', 'প্রজনন', 'টিস্যু', 'শ্বসন', 'শ্বাসক্রিয়া', 'রক্ত', 
    'সঞ্চালন', 'শারীরতত্ত্ব', 'প্রাণী', 'হাইড্রা', 'রুইমাছ', 'ঘাসফড়িং', 
    'জীনতত্ত্ব', 'বিবর্তন', 'কোষ', 'প্রতিরক্ষা', 'নগ্নবীজী', 'আবৃতবীজী'
  ],
  English: [
    'Noun', 'Pronoun', 'Determiner', 'Parts of Speech', 'Number', 'Gender', 
    'Conditional', 'Voice', 'Narration', 'Sentence', 'Phrase', 'Clause', 'Verb', 'Agreement'
  ],
  Bangla: ['বাংলা', 'ব্যাকরণ', 'গদ্য', 'পদ্য'],
  ICT: ['আইসিটি', 'HTML', 'C Programming', 'Database', 'Number System'],
  Other: []
};

/**
 * Detects the subject category of a topic string using keyword matching
 */
export function detectSubject(topicName: string): SubjectCategory {
  if (!topicName || topicName.trim() === '') return 'Other';

  const cleanTopic = topicName.trim();

  // Explicit priority checks for common overlapping words
  if (/Noun|Pronoun|Determiner|Parts of Speech|Number|Gender|Conditional|Voice|Narration|Sentence|Phrase|Clause|Verb|Agreement/i.test(cleanTopic)) {
    return 'English';
  }
  if (/রসায়ন/.test(cleanTopic) && !/উদ্ভিদ|প্রাণী|কোষ রসায়ন/.test(cleanTopic)) {
    return 'Chemistry';
  }
  if (/কোষ রসায়ন/.test(cleanTopic)) {
    return 'Biology';
  }

  // Iterate over keyword map
  for (const [subject, keywords] of Object.entries(DEFAULT_KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (cleanTopic.toLowerCase().includes(kw.toLowerCase())) {
        return subject as SubjectCategory;
      }
    }
  }

  return 'Other';
}

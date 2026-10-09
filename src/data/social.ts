import type { Opt } from './options.ts';
export interface Plat { id: string; en: string; ar: string; w: number; h: number; kind: string }
export const PLATFORMS: Plat[] = [
  { id: 'ig-post', en: 'Instagram feed post', ar: 'بوست إنستجرام', w: 1080, h: 1350, kind: 'Social media post image' },
  { id: 'ig-square', en: 'Instagram square post', ar: 'بوست مربع', w: 1080, h: 1080, kind: 'Social media post image' },
  { id: 'ig-story', en: 'Instagram story', ar: 'ستوري', w: 1080, h: 1920, kind: 'Story / vertical' },
  { id: 'ig-reel', en: 'Instagram Reels cover', ar: 'غلاف ريلز', w: 1080, h: 1920, kind: 'Cover image' },
  { id: 'ig-car', en: 'Instagram carousel slide', ar: 'سلايد كاروسيل', w: 1080, h: 1350, kind: 'Social media post image' },
  { id: 'fb-post', en: 'Facebook post', ar: 'بوست فيسبوك', w: 1200, h: 630, kind: 'Social media post image' },
  { id: 'fb-cover', en: 'Facebook cover', ar: 'غلاف فيسبوك', w: 820, h: 312, kind: 'Cover image' },
  { id: 'yt-thumb', en: 'YouTube thumbnail', ar: 'صورة مصغرة يوتيوب', w: 1280, h: 720, kind: 'Thumbnail' },
  { id: 'yt-banner', en: 'YouTube channel banner', ar: 'بانر قناة يوتيوب', w: 2560, h: 1440, kind: 'Cover image' },
  { id: 'tt-cover', en: 'TikTok cover', ar: 'غلاف تيك توك', w: 1080, h: 1920, kind: 'Cover image' },
  { id: 'li-post', en: 'LinkedIn graphic', ar: 'بوست لينكدإن', w: 1200, h: 627, kind: 'Social media post image' },
  { id: 'poster', en: 'Teacher poster', ar: 'بوستر مدرس', w: 1080, h: 1440, kind: 'Advertisement' },
];
const o = (en: string, ar: string): Opt => ({ en, ar });
export const KINDS = [o('Social media post image', 'صورة بوست'), o('Cover image', 'غلاف'), o('Advertisement', 'إعلان'), o('Thumbnail', 'صورة مصغرة'), o('Story / vertical', 'ستوري')];
export const GOALS = [o('drive sales', 'زيادة المبيعات'), o('student registration', 'تسجيل طلاب'), o('brand awareness', 'التعريف بالبراند'), o('event announcement', 'إعلان فعالية'), o('course launch', 'إطلاق كورس')];
export interface Comp { en: string; ar: string; place: 'left' | 'center' | 'right'; text: boolean; desc: string }
export const COMPS: Comp[] = [
  { en: 'Subject left, text right', ar: 'الشخص شمال والنص يمين', place: 'left', text: true, desc: 'subject on the left third, large clean text-safe area on the right' },
  { en: 'Subject right, text left', ar: 'الشخص يمين والنص شمال', place: 'right', text: true, desc: 'subject on the right third, large clean text-safe area on the left' },
  { en: 'Centered hero, headline above', ar: 'الشخص في النص والعنوان فوق', place: 'center', text: true, desc: 'centered hero subject, text-safe headline area above the subject' },
  { en: 'Typography-first poster', ar: 'بوستر الخط أولاً', place: 'center', text: true, desc: 'typography-led layout, headline dominates the upper two thirds, subject smaller below' },
  { en: 'Split-layout advertisement', ar: 'تقسيم نصفين', place: 'left', text: true, desc: 'split layout, left half photo of the subject, right half solid color panel with text' },
  { en: 'Full-bleed cinematic', ar: 'ملء الشاشة سينمائي', place: 'right', text: false, desc: 'full-bleed cinematic framing, subject off-center, text overlaid in natural negative space' },
  { en: 'Clean negative space', ar: 'مساحة فاضية أنيقة', place: 'left', text: false, desc: 'minimal composition with generous negative space around the subject' },
  { en: 'Layered geometric', ar: 'أشكال هندسية متراكبة', place: 'right', text: true, desc: 'layered geometric shapes framing the subject, headline on a clean solid block' },
];
export interface TSub { en: string; ar: string; motif: string; pal: string[] }
export const TEACH: TSub[] = [
  { en: 'Mathematics', ar: 'رياضيات', motif: 'subtle geometric grid, circles and angles, faint formulas as texture', pal: ['#0F2A4A', '#2F6FED', '#F5C84C', '#F5F2EA'] },
  { en: 'Physics', ar: 'فيزياء', motif: 'orbits, waves and light-trail lines on a deep navy field', pal: ['#0B1020', '#6C4DF5', '#34D1F0', '#F5F2EA'] },
  { en: 'Chemistry', ar: 'كيمياء', motif: 'abstract molecular hexagon structures, clean lab glass reflections', pal: ['#0E3B3A', '#2BB3A3', '#F2B84B', '#F5F2EA'] },
  { en: 'Arabic language', ar: 'لغة عربية', motif: 'refined Arabic calligraphic textures and open book pages', pal: ['#3A2417', '#C9A96A', '#F5EBD6', '#15171A'] },
  { en: 'English language', ar: 'لغة إنجليزية', motif: 'editorial typography textures, open book, soft paper', pal: ['#1B2A41', '#E4572E', '#F3E9D2', '#15171A'] },
  { en: 'History', ar: 'تاريخ', motif: 'aged paper, map lines and architectural silhouettes', pal: ['#3B2A1A', '#B7873E', '#E9DCC3', '#15171A'] },
  { en: 'Biology', ar: 'أحياء', motif: 'organic cell and leaf shapes, soft natural greens', pal: ['#123524', '#3FA34D', '#F2E8CF', '#15171A'] },
];

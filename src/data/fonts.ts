export interface FontOpt { css: string; ar: string; group: string; arabic: boolean }
export const FCATS: Record<string, { en: string; ar: string }> = {
  all: { en: 'All', ar: 'الكل' }, 'ar-calli': { en: 'Arabic calligraphy', ar: 'مخطوطات ورقعة' }, 'ar-kufi': { en: 'Arabic Kufi', ar: 'كوفي' }, 'ar-naskh': { en: 'Arabic Naskh', ar: 'نسخ' },
  'ar-display': { en: 'Arabic display', ar: 'عناوين عربية' }, 'ar-modern': { en: 'Arabic modern', ar: 'عربي عصري' }, 'lat-script': { en: 'Script & handwritten', ar: 'خطوط حرة' },
  'lat-serif': { en: 'Serif', ar: 'سيريف' }, 'lat-display': { en: 'Display & condensed', ar: 'عناوين قوية' }, 'lat-sans': { en: 'Sans-serif', ar: 'سانس' },
};
const f = (css: string, ar: string, group: string): FontOpt => ({ css, ar, group, arabic: group.startsWith('ar') });
export const FONTS: FontOpt[] = [
  f('Cairo', 'القاهرة', 'ar-modern'), f('Tajawal', 'تجوال', 'ar-modern'), f('Almarai', 'المرعي', 'ar-modern'), f('Readex Pro', 'ريديكس', 'ar-modern'), f('IBM Plex Sans Arabic', 'آي بي إم بلكس', 'ar-modern'), f('Alexandria', 'الإسكندرية', 'ar-modern'),
  f('Noto Kufi Arabic', 'نوتو كوفي', 'ar-kufi'), f('Reem Kufi', 'ريم كوفي', 'ar-kufi'),
  f('Amiri', 'أميري', 'ar-naskh'), f('Noto Naskh Arabic', 'نوتو نسخ', 'ar-naskh'), f('Scheherazade New', 'شهرزاد', 'ar-naskh'), f('Lateef', 'لطيف', 'ar-naskh'), f('Markazi Text', 'مركزي', 'ar-naskh'), f('Harmattan', 'هرمتان', 'ar-naskh'),
  f('Changa', 'تشانجا', 'ar-display'), f('Lalezar', 'لاله زار', 'ar-display'), f('Rakkas', 'رقاص', 'ar-display'), f('Baloo Bhaijaan 2', 'بالو', 'ar-display'), f('Marhey', 'مرحي', 'ar-display'), f('El Messiri', 'المسيري', 'ar-display'), f('Jomhuria', 'جمهورية', 'ar-display'),
  f('Aref Ruqaa', 'عارف رقعة', 'ar-calli'), f('Katibeh', 'كاتبة', 'ar-calli'), f('Mirza', 'ميرزا', 'ar-calli'), f('Vibes', 'فايبز', 'ar-calli'),
  f('Inter', 'إنتر', 'lat-sans'), f('Poppins', 'بوبينز', 'lat-sans'), f('Montserrat', 'مونتسيرات', 'lat-sans'), f('Space Grotesk', 'سبيس جروتسك', 'lat-sans'), f('Syne', 'ساين', 'lat-sans'),
  f('Playfair Display', 'بلايفير', 'lat-serif'), f('DM Serif Display', 'دي إم سيريف', 'lat-serif'), f('Abril Fatface', 'أبريل', 'lat-serif'),
  f('Anton', 'أنتون', 'lat-display'), f('Bebas Neue', 'بيبَس', 'lat-display'), f('Oswald', 'أوزوالد', 'lat-display'), f('Righteous', 'رايتشس', 'lat-display'),
  f('Lobster', 'لوبستر', 'lat-script'), f('Pacifico', 'باسيفيكو', 'lat-script'), f('Dancing Script', 'دانسينج', 'lat-script'), f('Great Vibes', 'جريت فايبز', 'lat-script'), f('Caveat', 'كافيات', 'lat-script'), f('Permanent Marker', 'ماركر', 'lat-script'),
];
export const fontPkg = (css: string) => css.toLowerCase().replace(/ /g, '-');

/**
 * Hijri (Islamic) calendar converter — Tabular/Computational algorithm
 * Based on the Umm al-Qura approximation, accurate ±1 day.
 */

const HIJRI_MONTHS_ID = [
  "Muharram", "Shafar", "Rabi'ul Awwal", "Rabi'ul Akhir",
  "Jumadal Ula", "Jumadal Akhirah", "Rajab", "Sya'ban",
  "Ramadhan", "Syawwal", "Dzulqo'dah", "Dzulhijjah",
];

const DAYS_ID = [
  "Ahad", "Itsnain", "Tsulasa'", "Arba'a", "Khams", "Jum'at", "Sabt",
];

const DAYS_MASEHI_ID = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];

const MONTHS_MASEHI_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
  /** Day name in Indonesian (Ahad, Itsnain, …) */
  dayNameArabic: string;
}

export interface DualDate {
  /** e.g. "Kamis" */
  dayMasehi: string;
  /** e.g. "14 Mei 2026 M" */
  dateMasehi: string;
  /** e.g. "Khams" */
  dayHijri: string;
  /** e.g. "27 Dzulqo'dah 1447 H" */
  dateHijri: string;
}

/**
 * Convert a Gregorian date to Hijri.
 * Uses Intl.DateTimeFormat with a -1 day offset to match Indonesian (Kemenag) calendar.
 */
export function gregorianToHijri(date: Date): HijriDate {
  // Apply -1 day offset to match the user's calendar (Kemenag/Indonesian standard)
  // For May 16, 2026: islamic-civil gives 29, user wants 28.
  const adjustedDate = new Date(date);
  adjustedDate.setDate(date.getDate() - 1);

  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-civil-nu-latn', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  const parts = formatter.formatToParts(adjustedDate);
  const hDay = parseInt(parts.find(p => p.type === 'day')?.value || "1");
  const hMonth = parseInt(parts.find(p => p.type === 'month')?.value || "1");
  const hYear = parseInt(parts.find(p => p.type === 'year')?.value || "1447");

  return {
    day: hDay,
    month: hMonth,
    monthName: HIJRI_MONTHS_ID[hMonth - 1] ?? "",
    year: hYear,
    dayNameArabic: DAYS_ID[date.getDay()],
  };
}

export function getDualDate(date: Date = new Date()): DualDate {
  const dow = date.getDay();
  const dayMasehi = DAYS_MASEHI_ID[dow];
  const dateMasehi = `${date.getDate()} ${MONTHS_MASEHI_ID[date.getMonth()]} ${date.getFullYear()} M`;

  const h = gregorianToHijri(date);
  const dayHijri = DAYS_ID[dow];
  const dateHijri = `${h.day} ${h.monthName} ${h.year} H`;

  return { dayMasehi, dateMasehi, dayHijri, dateHijri };
}


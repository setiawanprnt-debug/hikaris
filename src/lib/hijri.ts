/**
 * Hijri (Islamic) calendar converter — Tabular/Computational algorithm
 * Based on the Umm al-Qura approximation, accurate ±1 day.
 */

const HIJRI_MONTHS_ID = [
  "Muharram", "Shafar", "Rabi'ul Awwal", "Rabi'ul Akhir",
  "Jumadal Ula", "Jumadal Akhirah", "Rajab", "Sya'ban",
  "Ramadhan", "Syawwal", "Dzulqa'dah", "Dzulhijjah",
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
  /** e.g. "27 Dzulqa'dah 1447 H" */
  dateHijri: string;
}

/**
 * Convert a Gregorian date to Hijri using the standard astronomical algorithm.
 */
export function gregorianToHijri(date: Date): HijriDate {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  // Julian Day Number
  const jd =
    Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
    Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4) +
    d - 32075;

  // Convert JD to Hijri
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hMonth = Math.floor((24 * l) / 709);
  const hDay = l - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

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

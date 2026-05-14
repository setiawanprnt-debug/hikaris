import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format angka ke Rupiah: formatRp(85000) → "Rp 85.000" */
export function formatRp(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "Rp 0";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

/** GCD (Greatest Common Divisor) */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  return b === 0 ? a : gcd(b, a % b);
}

/** LCM (Least Common Multiple) */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return Math.max(a, b);
  return Math.abs(a * b) / gcd(a, b);
}

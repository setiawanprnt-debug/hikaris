import { useLocation } from "wouter";
import { Coins, ScrollText, ArrowRight, CalendarDays, MessageSquareHeart } from "lucide-react";
import { Logo } from "@/components/Logo";
import { getDualDate } from "@/lib/hijri";

const today = getDualDate();

export default function Dashboard() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 flex flex-col">
      <header className="bg-gradient-to-r from-emerald-800 to-teal-800 shadow-lg py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo light={true} />
            <p className="text-emerald-200 text-sm font-semibold tracking-wide border-l border-emerald-600 pl-3 hidden sm:block">Hitung Zakat dan Waris</p>
          </div>
          {/* Tanggal — tampil di sm ke atas (landscape/tablet/desktop) */}
          <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <CalendarDays className="w-4 h-4 text-emerald-300 shrink-0" />
            <div className="text-right">
              <p className="text-white text-xs font-semibold leading-tight">
                {today.dayMasehi}, {today.dateMasehi}
              </p>
              <p className="text-emerald-300 text-xs leading-tight">
                {today.dayHijri}, {today.dateHijri}
              </p>
            </div>
          </div>
        </div>
        {/* Tanggal — hanya tampil di portrait mobile (xs, < sm) */}
        <div className="flex sm:hidden items-center justify-center gap-2 mt-2 pt-2 border-t border-emerald-700">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <div className="text-center">
            <p className="text-white text-xs font-semibold leading-tight">
              {today.dayMasehi}, {today.dateMasehi}
            </p>
            <p className="text-emerald-300 text-xs leading-tight">
              {today.dayHijri}, {today.dateHijri}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8 animate-fade-in">
            <div className="mb-6 space-y-2 animate-float">
              <p className="text-3xl text-emerald-800 font-arabic leading-relaxed" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>
              <p className="text-xl text-emerald-700 font-arabic leading-relaxed" dir="rtl">
                السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-800 mb-2">
              Selamat Datang di HIKARIS
            </h1>
            <p className="text-emerald-600 font-semibold text-lg mb-4">
              Hitung Zakat dan Waris — Mudah, Cepat, Sesuai Syariah
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-emerald-200/60 p-6 mb-8 text-left animate-slide-up">
            <p className="text-gray-700 leading-relaxed text-base">
              <strong className="text-emerald-700">HIKARIS</strong> adalah aplikasi bantu perhitungan zakat dan waris
              berbasis hukum Islam. Dengan antarmuka yang sederhana dan intuitif, HIKARIS memudahkan Anda
              memahami besaran zakat yang wajib dikeluarkan serta gambaran pembagian harta waris
              sesuai kaidah fikih Islam (jumhur ulama). Pilih menu di bawah untuk memulai.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <button
              onClick={() => navigate("/zakat")}
              aria-label="Buka Kalkulator Zakat"
              className="group bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 active:scale-[0.97] text-white rounded-2xl p-6 shadow-lg flex flex-col items-center gap-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                <Coins className="w-7 h-7" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Hitung Zakat</h2>
                <p className="text-emerald-100 text-sm mt-1">Emas, Tabungan, Perdagangan,<br/>Pertanian, Peternakan &amp; Rikaz</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-200 group-hover:text-white transition-colors">
                Mulai Hitung <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => navigate("/waris")}
              aria-label="Buka Kalkulator Waris"
              className="group bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 active:scale-[0.97] text-white rounded-2xl p-6 shadow-lg flex flex-col items-center gap-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                <ScrollText className="w-7 h-7" />
              </span>
              <div>
                <h2 className="text-xl font-bold">Hitung Waris</h2>
                <p className="text-teal-100 text-sm mt-1">Pembagian harta waris<br/>berdasarkan hukum faraidh</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-teal-200 group-hover:text-white transition-colors">
                Mulai Hitung <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Tombol Survei */}
          <div className="mt-6 animate-slide-up text-center" style={{ animationDelay: "0.3s" }}>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdX_FeSsYQ2mUzdorEQ8jdG3Ddf7O_7PQCkPFgJ5oQczasd4A/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm hover:bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-500 text-emerald-700 hover:text-emerald-800 font-semibold rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <MessageSquareHeart className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Beri Penilaian App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-emerald-600 text-sm">
        <p>HIKARIS — Alat bantu hitung zakat dan waris berdasar fikih Islam</p>
      </footer>
    </div>
  );
}

import { useLocation } from "wouter";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100">
      <div className="w-full max-w-md mx-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-200/60 p-8 text-center animate-fade-in">
        <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-emerald-800 mb-2">404 — Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-gray-600 mb-6">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition-all duration-200 active:scale-95"
        >
          <Home className="w-4 h-4" />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

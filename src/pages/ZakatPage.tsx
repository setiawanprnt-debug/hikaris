import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { formatRp } from "@/lib/utils";
import { Logo } from "@/components/Logo";

type ZakatType = "emas" | "tabungan" | "perdagangan" | "pertanian" | "peternakan" | "rikaz";

function ZakatBadge({ wajib }: { wajib: boolean }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${wajib ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      {wajib ? "✓ Wajib Zakat" : "✗ Belum Mencapai Nisab"}
    </span>
  );
}

function InputGroup({ label, value, onChange, placeholder, unit, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; unit?: string; hint?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-emerald-800 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      <div className="flex items-center gap-2">
        <input
          type="number" value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? "0"} min="0"
          className="flex-1 border border-emerald-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-sm"
        />
        {unit && <span className="text-sm text-gray-500 whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );
}

type ResultBox = {
  wajib: boolean; nisab?: string; harta?: string; kadar?: string;
  jumlahZakat: string; catatan?: string;
};

function HasilZakat({ result }: { result: ResultBox }) {
  return (
    <div className={`mt-5 rounded-xl border-2 p-5 print-section ${result.wajib ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-emerald-900">Hasil Perhitungan</h3>
        <ZakatBadge wajib={result.wajib} />
      </div>
      <div className="space-y-2 text-sm">
        {result.nisab && <div className="flex justify-between"><span className="text-gray-600">Nisab</span><span className="font-semibold text-gray-800">{result.nisab}</span></div>}
        {result.harta && <div className="flex justify-between"><span className="text-gray-600">Harta yang dinilai</span><span className="font-semibold text-gray-800">{result.harta}</span></div>}
        {result.kadar && <div className="flex justify-between"><span className="text-gray-600">Kadar zakat</span><span className="font-semibold text-gray-800">{result.kadar}</span></div>}
        <div className="flex justify-between pt-2 border-t border-emerald-200">
          <span className="font-bold text-emerald-800">Zakat yang wajib dibayar</span>
          <span className="font-extrabold text-emerald-700 text-base">{result.jumlahZakat}</span>
        </div>
      </div>
      {result.catatan && <p className="mt-3 text-xs text-gray-500 italic">{result.catatan}</p>}
    </div>
  );
}

const TYPES: { id: ZakatType; icon: string; label: string }[] = [
  { id: "emas", icon: "🥇", label: "Emas & Perak" },
  { id: "tabungan", icon: "🏦", label: "Tabungan / Uang" },
  { id: "perdagangan", icon: "🛒", label: "Perdagangan" },
  { id: "pertanian", icon: "🌾", label: "Pertanian" },
  { id: "peternakan", icon: "🐄", label: "Peternakan" },
  { id: "rikaz", icon: "💎", label: "Rikaz / Harta Temuan" },
];

const TYPE_LABELS: Record<ZakatType, string> = {
  emas: "Zakat Emas & Perak",
  tabungan: "Zakat Tabungan / Uang",
  perdagangan: "Zakat Perdagangan",
  pertanian: "Zakat Pertanian",
  peternakan: "Zakat Peternakan",
  rikaz: "Zakat Rikaz / Harta Temuan",
};

export default function ZakatPage() {
  const [, navigate] = useLocation();
  const [type, setType] = useState<ZakatType>("emas");
  const [result, setResult] = useState<ResultBox | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [emasJenis, setEmasJenis] = useState<"emas" | "perak">("emas");
  const [emasGram, setEmasGram] = useState("");
  const [emasHarga, setEmasHarga] = useState("");
  const [tabTotal, setTabTotal] = useState("");
  const [tabHargaEmas, setTabHargaEmas] = useState("");
  const [dagModal, setDagModal] = useState("");
  const [dagStok, setDagStok] = useState("");
  const [dagPiutang, setDagPiutang] = useState("");
  const [dagHutang, setDagHutang] = useState("");
  const [dagHargaEmas, setDagHargaEmas] = useState("");
  const [tanPanen, setTanPanen] = useState("");
  const [tanIrigasi, setTanIrigasi] = useState<"alami" | "irigasi">("alami");
  const [tanJenis, setTanJenis] = useState<"biji" | "nilai">("biji");
  const [tanNilai, setTanNilai] = useState("");
  const [tanHargaEmas, setTanHargaEmas] = useState("");
  const [ternakJenis, setTernakJenis] = useState<"kambing" | "sapi" | "unta">("kambing");
  const [ternakJumlah, setTernakJumlah] = useState("");
  const [ternakHargaSatuan, setTernakHargaSatuan] = useState("");
  const [rikazNilai, setRikazNilai] = useState("");

  function hitungZakatEmas() {
    const gram = parseFloat(emasGram) || 0;
    const harga = parseFloat(emasHarga) || 0;
    const nisabGram = emasJenis === "emas" ? 85 : 595;
    const wajib = gram >= nisabGram;
    const nilaiHarta = gram * harga;
    setResult({
      wajib,
      nisab: `${nisabGram} gram ${emasJenis === "emas" ? "emas" : "perak"} ≈ ${formatRp(nisabGram * harga)}`,
      harta: `${gram.toLocaleString("id-ID")} gram × ${formatRp(harga)}/gram = ${formatRp(nilaiHarta)}`,
      kadar: "2,5%",
      jumlahZakat: wajib ? formatRp(nilaiHarta * 0.025) : "—",
      catatan: wajib ? undefined : `Berat ${emasJenis} Anda (${gram}g) belum mencapai nisab ${nisabGram}g.`,
    });
  }

  function hitungZakatTabungan() {
    const total = parseFloat(tabTotal) || 0;
    const hargaEmas = parseFloat(tabHargaEmas) || 1;
    const nisab = 85 * hargaEmas;
    const wajib = total >= nisab;
    setResult({
      wajib,
      nisab: `85 gram emas × ${formatRp(hargaEmas)}/gram = ${formatRp(nisab)}`,
      harta: formatRp(total),
      kadar: "2,5%",
      jumlahZakat: wajib ? formatRp(total * 0.025) : "—",
      catatan: wajib ? "Pastikan tabungan/uang ini telah dimiliki selama 1 tahun (haul)." : "Tabungan Anda belum mencapai nisab.",
    });
  }

  function hitungZakatPerdagangan() {
    const modal = parseFloat(dagModal) || 0;
    const stok = parseFloat(dagStok) || 0;
    const piutang = parseFloat(dagPiutang) || 0;
    const hutang = parseFloat(dagHutang) || 0;
    const hargaEmas = parseFloat(dagHargaEmas) || 1;
    const nilaiZakat = modal + stok + piutang - hutang;
    const nisab = 85 * hargaEmas;
    const wajib = nilaiZakat >= nisab;
    setResult({
      wajib,
      nisab: `85 gram emas × ${formatRp(hargaEmas)}/gram = ${formatRp(nisab)}`,
      harta: `Modal + Stok + Piutang − Hutang = ${formatRp(nilaiZakat)}`,
      kadar: "2,5%",
      jumlahZakat: wajib ? formatRp(nilaiZakat * 0.025) : "—",
      catatan: wajib ? "Hitung setiap tahun (haul) dari awal usaha." : "Total nilai perdagangan belum mencapai nisab.",
    });
  }

  function hitungZakatPertanian() {
    const kadar = tanIrigasi === "alami" ? 0.1 : 0.05;
    const kadarStr = tanIrigasi === "alami" ? "10% (pengairan alami/hujan)" : "5% (irigasi/biaya sendiri)";
    if (tanJenis === "biji") {
      const panen = parseFloat(tanPanen) || 0;
      const nisabKg = 653;
      const wajib = panen >= nisabKg;
      setResult({
        wajib,
        nisab: `653 kg biji-bijian`,
        harta: `${panen.toLocaleString("id-ID")} kg`,
        kadar: kadarStr,
        jumlahZakat: wajib ? `${(panen * kadar).toLocaleString("id-ID")} kg hasil panen` : "—",
        catatan: wajib ? "Zakat pertanian wajib dikeluarkan setiap kali panen, tidak ada syarat haul." : "Hasil panen belum mencapai nisab 653 kg.",
      });
    } else {
      const nilai = parseFloat(tanNilai) || 0;
      const hargaEmas = parseFloat(tanHargaEmas) || 1;
      const nisab = 85 * hargaEmas;
      const wajib = nilai >= nisab;
      setResult({
        wajib,
        nisab: `Setara 85 gram emas = ${formatRp(nisab)}`,
        harta: formatRp(nilai),
        kadar: kadarStr,
        jumlahZakat: wajib ? formatRp(nilai * kadar) : "—",
        catatan: "Untuk hasil pertanian non-biji, nisab mengacu pada nilai setara 85g emas (pendapat sebagian ulama).",
      });
    }
  }

  function zakatKambing(n: number): string {
    if (n < 40) return "Belum wajib (< 40 ekor)";
    if (n <= 120) return "1 ekor kambing/domba";
    if (n <= 200) return "2 ekor kambing/domba";
    if (n <= 300) return "3 ekor kambing/domba";
    // Setiap tambahan 100 ekor di atas 300, tambah 1 ekor zakat
    const extra = Math.ceil((n - 300) / 100);
    return `${3 + extra} ekor kambing/domba`;
  }
  function zakatSapi(n: number): string {
    if (n < 30) return "Belum wajib (< 30 ekor)";
    if (n <= 39) return "1 ekor sapi/kerbau usia 1 tahun (tabi')";
    if (n <= 59) return "1 ekor sapi/kerbau usia 2 tahun (musinnah)";
    if (n <= 69) return "2 ekor sapi/kerbau usia 1 tahun";
    if (n <= 79) return "1 musinnah + 1 tabi'";
    if (n <= 89) return "2 musinnah";
    return `${Math.floor(n / 30)} tabi' (atau kombinasi tabi'/musinnah)`;
  }
  function zakatUnta(n: number): string {
    if (n < 5) return "Belum wajib (< 5 ekor)";
    if (n <= 9) return "1 ekor kambing/domba";
    if (n <= 14) return "2 ekor kambing/domba";
    if (n <= 19) return "3 ekor kambing/domba";
    if (n <= 24) return "4 ekor kambing/domba";
    if (n <= 35) return "1 ekor unta bintu makhad (umur 1 th)";
    if (n <= 45) return "1 ekor unta bintu labun (umur 2 th)";
    if (n <= 60) return "1 ekor unta hiqqah (umur 3 th)";
    if (n <= 75) return "1 ekor unta jadza'ah (umur 4 th)";
    if (n <= 90) return "2 ekor bintu labun";
    if (n <= 120) return "2 ekor hiqqah";
    return "Dihitung per 40/50 ekor berikutnya";
  }

  function hitungZakatPeternakan() {
    const jumlah = Math.floor(parseFloat(ternakJumlah) || 0);
    const harga = parseFloat(ternakHargaSatuan) || 0;
    let zakatKet = "";
    let wajib = false;
    if (ternakJenis === "kambing") { zakatKet = zakatKambing(jumlah); wajib = jumlah >= 40; }
    else if (ternakJenis === "sapi") { zakatKet = zakatSapi(jumlah); wajib = jumlah >= 30; }
    else { zakatKet = zakatUnta(jumlah); wajib = jumlah >= 5; }
    const names = { kambing: "Kambing/Domba", sapi: "Sapi/Kerbau", unta: "Unta" };
    const nisabs = { kambing: "40 ekor", sapi: "30 ekor", unta: "5 ekor" };
    setResult({
      wajib,
      nisab: nisabs[ternakJenis],
      harta: `${jumlah.toLocaleString("id-ID")} ekor ${names[ternakJenis]}`,
      kadar: zakatKet,
      jumlahZakat: wajib ? (harga > 0 ? `≈ ${formatRp(harga)} (nilai 1 ekor zakat)` : zakatKet) : "—",
      catatan: wajib ? "Zakat peternakan dikeluarkan dalam bentuk hewan. Syarat: hewan digembalakan (saimah), haul 1 tahun." : `Jumlah ${names[ternakJenis]} belum mencapai nisab.`,
    });
  }

  function hitungZakatRikaz() {
    const nilai = parseFloat(rikazNilai) || 0;
    setResult({
      wajib: nilai > 0,
      harta: formatRp(nilai),
      kadar: "20% (wajib tanpa syarat nisab dan haul)",
      jumlahZakat: nilai > 0 ? formatRp(nilai * 0.2) : "—",
      catatan: "Rikaz adalah harta peninggalan terdahulu yang ditemukan terpendam. Tidak ada syarat nisab dan haul.",
    });
  }

  function handleHitung() {
    setResult(null);
    if (type === "emas") hitungZakatEmas();
    else if (type === "tabungan") hitungZakatTabungan();
    else if (type === "perdagangan") hitungZakatPerdagangan();
    else if (type === "pertanian") hitungZakatPertanian();
    else if (type === "peternakan") hitungZakatPeternakan();
    else if (type === "rikaz") hitungZakatRikaz();
  }

  function handleCetakPDF() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 to-green-200 flex flex-col print-page" ref={printRef}>
      {/* Print letterhead — hanya tampil saat cetak */}
      <div className="print-letterhead px-8 pt-6">
        <Logo light={false} className="mb-2" />
        <div className="print-letterhead-text">
          <h1>HIKARIS</h1>
          <p>Hitung Zakat dan Waris</p>
          <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>Kalkulator {TYPE_LABELS[type]}</p>
        </div>
      </div>

      <header className="bg-emerald-800 shadow-lg py-4 px-5 flex items-center justify-between print-hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} aria-label="Kembali ke Dashboard" className="text-emerald-200 hover:text-white p-2 -ml-2 rounded-full hover:bg-emerald-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo light={true} />
          <div className="border-l border-emerald-600 pl-3 ml-1">
            <p className="text-emerald-200 text-xs font-semibold">Kalkulator Zakat</p>
          </div>
        </div>
        {result && (
          <button onClick={handleCetakPDF}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            🖨️ Cetak / PDF
          </button>
        )}
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Jenis Zakat selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6 print-hidden">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => { setType(t.id); setResult(null); }}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-xl text-xs font-semibold transition-all border-2 ${type === t.id ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400"}`}>
              <span className="text-xl">{t.icon}</span>
              <span className="leading-tight text-center">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-emerald-50 rounded-2xl shadow-md border border-emerald-200 p-5">
          {type === "emas" && (
            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-1">Zakat Emas dan Perak</h2>
              <p className="text-xs text-gray-500 mb-4">Nisab emas: 85 gram | Nisab perak: 595 gram | Kadar: 2,5%</p>
              <div className="flex gap-3 mb-4">
                {(["emas", "perak"] as const).map(j => (
                  <button key={j} onClick={() => setEmasJenis(j)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${emasJenis === j ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-200"}`}>
                    {j === "emas" ? "🥇 Emas" : "🪙 Perak"}
                  </button>
                ))}
              </div>
              <InputGroup label={`Berat ${emasJenis === "emas" ? "emas" : "perak"} yang dimiliki`} value={emasGram} onChange={setEmasGram} unit="gram" />
              <InputGroup label={`Harga ${emasJenis === "emas" ? "emas" : "perak"} saat ini`} value={emasHarga} onChange={setEmasHarga} unit="Rp/gram" hint="Cek harga terkini di logam mulia/toko emas" />
            </div>
          )}

          {type === "tabungan" && (
            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-1">Zakat Tabungan / Uang</h2>
              <p className="text-xs text-gray-500 mb-4">Nisab: setara 85 gram emas | Kadar: 2,5% | Syarat: haul 1 tahun</p>
              <InputGroup label="Total tabungan + uang tunai" value={tabTotal} onChange={setTabTotal} unit="Rp" hint="Termasuk semua rekening tabungan dan uang tunai" />
              <InputGroup label="Harga emas saat ini" value={tabHargaEmas} onChange={setTabHargaEmas} unit="Rp/gram" />
            </div>
          )}

          {type === "perdagangan" && (
            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-1">Zakat Perdagangan</h2>
              <p className="text-xs text-gray-500 mb-4">Nisab: setara 85 gram emas | Kadar: 2,5% | Syarat: haul 1 tahun</p>
              <InputGroup label="Modal usaha (uang tunai + di bank)" value={dagModal} onChange={setDagModal} unit="Rp" />
              <InputGroup label="Nilai stok barang dagangan" value={dagStok} onChange={setDagStok} unit="Rp" />
              <InputGroup label="Piutang yang bisa ditagih" value={dagPiutang} onChange={setDagPiutang} unit="Rp" />
              <InputGroup label="Hutang dagang" value={dagHutang} onChange={setDagHutang} unit="Rp" hint="Hutang yang berkaitan dengan usaha" />
              <InputGroup label="Harga emas saat ini" value={dagHargaEmas} onChange={setDagHargaEmas} unit="Rp/gram" />
            </div>
          )}

          {type === "pertanian" && (
            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-1">Zakat Pertanian</h2>
              <p className="text-xs text-gray-500 mb-4">Nisab: 653 kg | Kadar: 10% (alami) / 5% (irigasi) | Wajib setiap panen</p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-emerald-800 mb-2">Jenis perhitungan</label>
                <div className="flex gap-3">
                  {(["biji", "nilai"] as const).map(j => (
                    <button key={j} onClick={() => setTanJenis(j)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${tanJenis === j ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-200"}`}>
                      {j === "biji" ? "🌾 Biji-bijian (kg)" : "💵 Nilai (Rp)"}
                    </button>
                  ))}
                </div>
              </div>
              {tanJenis === "biji"
                ? <InputGroup label="Hasil panen" value={tanPanen} onChange={setTanPanen} unit="kg" hint="Berat biji-bijian setelah dijemur/dibersihkan" />
                : <>
                    <InputGroup label="Nilai hasil panen" value={tanNilai} onChange={setTanNilai} unit="Rp" />
                    <InputGroup label="Harga emas saat ini" value={tanHargaEmas} onChange={setTanHargaEmas} unit="Rp/gram" />
                  </>
              }
              <div className="mb-4">
                <label className="block text-sm font-semibold text-emerald-800 mb-2">Jenis pengairan</label>
                <div className="flex gap-3">
                  {(["alami", "irigasi"] as const).map(j => (
                    <button key={j} onClick={() => setTanIrigasi(j)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${tanIrigasi === j ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-200"}`}>
                      {j === "alami" ? "🌧️ Hujan / Alami (10%)" : "💧 Irigasi Berbayar (5%)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {type === "peternakan" && (
            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-1">Zakat Peternakan</h2>
              <p className="text-xs text-gray-500 mb-4">Berlaku untuk hewan yang digembalakan (saimah) dan haul 1 tahun</p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-emerald-800 mb-2">Jenis hewan</label>
                <div className="flex gap-2">
                  {(["kambing", "sapi", "unta"] as const).map(j => (
                    <button key={j} onClick={() => setTernakJenis(j)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${ternakJenis === j ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-emerald-700 border-emerald-200"}`}>
                      {j === "kambing" ? "🐑 Kambing" : j === "sapi" ? "🐄 Sapi" : "🐪 Unta"}
                    </button>
                  ))}
                </div>
              </div>
              <InputGroup label={`Jumlah ${ternakJenis === "kambing" ? "kambing/domba" : ternakJenis === "sapi" ? "sapi/kerbau" : "unta"}`} value={ternakJumlah} onChange={setTernakJumlah} unit="ekor" />
              <InputGroup label="Harga 1 ekor hewan saat ini (opsional)" value={ternakHargaSatuan} onChange={setTernakHargaSatuan} unit="Rp" />
              <div className="bg-emerald-100 rounded-lg p-3 text-xs text-emerald-700">
                <strong>Nisab kambing:</strong> 40–120=1 | 121–200=2 | 201–300=3 | +100=+1<br/>
                <strong>Nisab sapi:</strong> 30–39=1 | 40–59=1(2thn) | 60–69=2<br/>
                <strong>Nisab unta:</strong> 5–9=1 kambing | 10–14=2 | 15–19=3 | 20–24=4 | 25–35=1 unta
              </div>
            </div>
          )}

          {type === "rikaz" && (
            <div>
              <h2 className="text-lg font-bold text-emerald-800 mb-1">Zakat Rikaz / Harta Temuan</h2>
              <p className="text-xs text-gray-500 mb-4">Kadar: 20% | Tidak ada syarat nisab dan haul</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700">
                <strong>⚠️ Catatan:</strong> Rikaz adalah harta peninggalan orang-orang terdahulu yang ditemukan terpendam. Berbeda dengan barang tambang (ma'dan) yang zakatnya 2,5%.
              </div>
              <InputGroup label="Nilai harta yang ditemukan" value={rikazNilai} onChange={setRikazNilai} unit="Rp" />
            </div>
          )}

          <button onClick={handleHitung}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3 rounded-xl shadow transition-all duration-150 print-hidden">
            Hitung Zakat
          </button>

          {result && <HasilZakat result={result} />}
        </div>

        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 print-section">
          <strong>⚠️ Disclaimer:</strong> Aplikasi ini bersifat sebagai alat bantu hitung berdasarkan pendapat jumhur ulama. Hasilnya bersifat indikatif dan tidak menggantikan fatwa resmi lembaga zakat atau konsultasi dengan ulama. Untuk kepastian hukum, konsultasikan dengan amil zakat atau lembaga zakat resmi di daerah Anda.
        </div>
      </main>
    </div>
  );
}

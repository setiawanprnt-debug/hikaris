import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatRp, gcd, lcm } from "@/lib/utils";
import { Logo } from "@/components/Logo";

interface HeirInput {
  suami: boolean; istri: number; anakLaki: number; anakPerempuan: number;
  ayah: boolean; ibu: boolean; kakek: boolean; nenek: boolean;
  saudaraLakiKandung: number; saudaraPerempuanKandung: number;
  saudaraLakiSeayah: number; saudaraPerempuanSeayah: number;
  saudaraSeibu: number;
}

interface HeirResult {
  id: string; name: string; count: number; basis: string;
  fractionStr: string; totalAmount: number; perPerson: number; isAsabah: boolean;
}

interface WarisCalcResult {
  netEstate: number; wasiatEfektif: number; awl: boolean; radd: boolean;
  results: HeirResult[]; blockedHeirs: string[]; notes: string[];
}

function hitungWaris(totalHarta: number, hutang: number, wasiat: number, biayaJenazah: number, heirs: HeirInput): WarisCalcResult {
  const setelahHutang = Math.max(0, totalHarta - hutang - biayaJenazah);
  const wasiatMax = setelahHutang / 3;
  const wasiatEfektif = Math.min(Math.max(0, wasiat), wasiatMax);
  const netEstate = Math.max(0, setelahHutang - wasiatEfektif);
  const notes: string[] = [];
  const blockedHeirs: string[] = [];

  const { suami, istri, anakLaki, anakPerempuan, ayah, ibu, kakek, nenek,
    saudaraLakiKandung, saudaraPerempuanKandung, saudaraLakiSeayah, saudaraPerempuanSeayah, saudaraSeibu } = heirs;

  if (wasiat > wasiatMax && wasiat > 0) notes.push(`Wasiat melebihi 1/3 harta bersih. Dibatasi menjadi ${formatRp(wasiatEfektif)}.`);

  const hasAnak = anakLaki > 0 || anakPerempuan > 0;
  const totalSaudara = saudaraLakiKandung + saudaraPerempuanKandung + saudaraLakiSeayah + saudaraPerempuanSeayah + saudaraSeibu;

  let effKakek = kakek, effNenek = nenek;
  let effSLK = saudaraLakiKandung, effSPK = saudaraPerempuanKandung;
  let effSLS = saudaraLakiSeayah, effSPS = saudaraPerempuanSeayah;
  let effSeibu = saudaraSeibu;

  // === Hajb (penghalang) ===
  if (ayah) {
    if (kakek) { effKakek = false; blockedHeirs.push("Kakek (Paternal) — terhalang Ayah"); }
    if (nenek) { effNenek = false; blockedHeirs.push("Nenek (Paternal) — terhalang Ayah"); }
    if (saudaraLakiKandung > 0) { effSLK = 0; blockedHeirs.push("Saudara Laki-laki Kandung — terhalang Ayah"); }
    if (saudaraPerempuanKandung > 0) { effSPK = 0; blockedHeirs.push("Saudari Kandung — terhalang Ayah"); }
    if (saudaraLakiSeayah > 0) { effSLS = 0; blockedHeirs.push("Saudara Laki-laki Seayah — terhalang Ayah"); }
    if (saudaraPerempuanSeayah > 0) { effSPS = 0; blockedHeirs.push("Saudari Seayah — terhalang Ayah"); }
    if (saudaraSeibu > 0) { effSeibu = 0; blockedHeirs.push("Saudara/i Seibu — terhalang Ayah"); }
  }
  // Kakek juga meng-hajb saudara seibu (jumhur)
  if (effKakek && effSeibu > 0) {
    effSeibu = 0;
    if (!blockedHeirs.some(b => b.includes("Seibu"))) blockedHeirs.push("Saudara/i Seibu — terhalang Kakek");
  }
  // Anak (laki/perempuan) meng-hajb saudara seibu
  if (hasAnak && effSeibu > 0) {
    effSeibu = 0;
    if (!blockedHeirs.some(b => b.includes("Seibu"))) blockedHeirs.push("Saudara/i Seibu — terhalang Anak");
  }
  if (anakLaki > 0) {
    if (effSLK > 0) { effSLK = 0; if (!blockedHeirs.some(b => b.includes("Saudara Laki-laki Kandung"))) blockedHeirs.push("Saudara Laki-laki Kandung — terhalang Anak Laki-laki"); }
    if (effSPK > 0) { effSPK = 0; if (!blockedHeirs.some(b => b.includes("Saudari Kandung"))) blockedHeirs.push("Saudari Kandung — terhalang Anak Laki-laki"); }
    if (effSLS > 0) { effSLS = 0; if (!blockedHeirs.some(b => b.includes("Saudara Laki-laki Seayah"))) blockedHeirs.push("Saudara Laki-laki Seayah — terhalang Anak Laki-laki"); }
    if (effSPS > 0) { effSPS = 0; if (!blockedHeirs.some(b => b.includes("Saudari Seayah"))) blockedHeirs.push("Saudari Seayah — terhalang Anak Laki-laki"); }
  }
  if (ibu && effNenek) { effNenek = false; if (!blockedHeirs.some(b => b.includes("Nenek"))) blockedHeirs.push("Nenek (Paternal) — terhalang Ibu"); }
  if (effKakek && (effSLK > 0 || effSLS > 0)) { effSLK = 0; effSLS = 0; blockedHeirs.push("Saudara Laki-laki — terhalang Kakek"); }
  if (effSLK > 0 && (effSLS > 0 || effSPS > 0)) {
    effSLS = 0; effSPS = 0;
    if (!blockedHeirs.some(b => b.includes("Seayah"))) blockedHeirs.push("Saudara/Saudari Seayah — terhalang Saudara Laki-laki Kandung");
  }

  type FardhItem = { id: string; name: string; count: number; num: number; den: number; basis: string };
  const fardhList: FardhItem[] = [];

  if (suami) fardhList.push({ id: "suami", name: "Suami", count: 1, num: 1, den: hasAnak ? 4 : 2, basis: hasAnak ? "1/4 — ada anak" : "1/2 — tidak ada anak" });
  if (istri > 0) fardhList.push({ id: "istri", name: `Istri${istri > 1 ? ` (${istri} orang, dibagi rata)` : ""}`, count: istri, num: 1, den: hasAnak ? 8 : 4, basis: hasAnak ? "1/8 (total) — ada anak" : "1/4 (total) — tidak ada anak" });

  const hasDuaSaudara = totalSaudara >= 2;

  // === Gharrawain (Umariyyatain) ===
  // Kasus: pasangan + ibu + ayah, tanpa anak, tanpa 2+ saudara
  // Ibu mendapat 1/3 SISA setelah bagian pasangan, bukan 1/3 total
  const isGharrawain = ibu && ayah && !hasAnak && !hasDuaSaudara && (suami || istri > 0);

  if (ibu) {
    let ibuDen: number;
    let ibuBasis: string;
    if (hasAnak || hasDuaSaudara) {
      ibuDen = 6;
      ibuBasis = hasAnak ? "1/6 — ada anak" : "1/6 — ada 2+ saudara";
    } else if (isGharrawain) {
      // Gharrawain: ibu = 1/3 sisa setelah pasangan
      if (suami) {
        ibuDen = 6; // 1/3 × 1/2 sisa = 1/6 total
        ibuBasis = "1/6 — Gharrawain (1/3 sisa setelah suami)";
      } else {
        ibuDen = 4; // 1/3 × 3/4 sisa = 1/4 total
        ibuBasis = "1/4 — Gharrawain (1/3 sisa setelah istri)";
      }
      notes.push("Diterapkan kaidah Gharrawain (Umariyyatain): Ibu mendapat 1/3 dari sisa setelah bagian suami/istri.");
    } else {
      ibuDen = 3;
      ibuBasis = "1/3 — tidak ada anak dan < 2 saudara";
    }
    fardhList.push({ id: "ibu", name: "Ibu", count: 1, num: 1, den: ibuDen, basis: ibuBasis });
  }
  if (effNenek) fardhList.push({ id: "nenek", name: "Nenek (Paternal)", count: 1, num: 1, den: 6, basis: "1/6 — menggantikan Ibu" });

  let ayahAsabah = false, ayahHasFardh = false;
  if (ayah) {
    if (hasAnak) {
      fardhList.push({ id: "ayah", name: "Ayah", count: 1, num: 1, den: 6, basis: anakPerempuan > 0 && anakLaki === 0 ? "1/6 (fardh) + sisa ('asabah)" : "1/6 — ada anak" });
      ayahHasFardh = true;
      if (anakPerempuan > 0 && anakLaki === 0) ayahAsabah = true;
    } else { ayahAsabah = true; }
  }

  let kakekAsabah = false;
  if (effKakek) {
    if (hasAnak) {
      fardhList.push({ id: "kakek", name: "Kakek (Paternal)", count: 1, num: 1, den: 6, basis: anakPerempuan > 0 && anakLaki === 0 ? "1/6 (fardh) + sisa ('asabah)" : "1/6 — ada anak" });
      if (anakPerempuan > 0 && anakLaki === 0) kakekAsabah = true;
    } else { kakekAsabah = true; }
  }

  let daughtersFardh = false;
  if (anakPerempuan > 0 && anakLaki === 0) {
    fardhList.push({ id: "anakPerempuan", name: `Anak Perempuan (${anakPerempuan} orang)`, count: anakPerempuan, num: anakPerempuan === 1 ? 1 : 2, den: anakPerempuan === 1 ? 2 : 3, basis: anakPerempuan === 1 ? "1/2 — satu anak perempuan" : "2/3 — dua+ anak perempuan" });
    daughtersFardh = true;
  }

  const hasMaleBlocker = anakLaki > 0 || ayah || effKakek;
  let saudariKandungFardh = false;
  if (effSPK > 0 && effSLK === 0 && !hasMaleBlocker && !hasAnak) {
    fardhList.push({ id: "saudariKandung", name: `Saudari Kandung (${effSPK} orang)`, count: effSPK, num: effSPK === 1 ? 1 : 2, den: effSPK === 1 ? 2 : 3, basis: effSPK === 1 ? "1/2 — satu saudari kandung" : "2/3 — dua+ saudari kandung" });
    saudariKandungFardh = true;
  }

  let saudariSeayahFardh = false;
  if (effSPS > 0 && effSLS === 0 && effSLK === 0 && effSPK === 0 && !hasMaleBlocker && !hasAnak) {
    fardhList.push({ id: "saudariSeayah", name: `Saudari Seayah (${effSPS} orang)`, count: effSPS, num: effSPS === 1 ? 1 : 2, den: effSPS === 1 ? 2 : 3, basis: effSPS === 1 ? "1/2 — satu saudari seayah" : "2/3 — dua+ saudari seayah" });
    saudariSeayahFardh = true;
  }

  // Saudara/i Seibu: 1/6 (satu orang) atau 1/3 (dua+ orang, dibagi rata)
  if (effSeibu > 0) {
    if (effSeibu === 1) {
      fardhList.push({ id: "saudaraSeibu", name: "Saudara/i Seibu (1 orang)", count: 1, num: 1, den: 6, basis: "1/6 — satu saudara/i seibu" });
    } else {
      fardhList.push({ id: "saudaraSeibu", name: `Saudara/i Seibu (${effSeibu} orang)`, count: effSeibu, num: 1, den: 3, basis: "1/3 — dua+ saudara/i seibu (dibagi rata)" });
    }
  }

  let aslMasalah = 1;
  for (const item of fardhList) aslMasalah = lcm(aslMasalah, item.den);
  const fardhUnits = fardhList.map(f => ({ ...f, units: f.num * (aslMasalah / f.den) }));
  let totalFardhUnits = fardhUnits.reduce((sum, f) => sum + f.units, 0);

  const hasAsabahCandidate = anakLaki > 0 || ayahAsabah || kakekAsabah || effSLK > 0 || effSLS > 0;
  let awl = false, radd = false;

  if (totalFardhUnits > aslMasalah) {
    awl = true; aslMasalah = totalFardhUnits;
    notes.push("Terjadi 'Awl: total bagian melebihi harta. Semua bagian dikurangi proporsional.");
  } else if (totalFardhUnits < aslMasalah && !hasAsabahCandidate) {
    radd = true;
    notes.push("Terjadi Radd: ada sisa harta dan tidak ada 'asabah. Sisa dikembalikan ke ahli waris (kecuali suami/istri).");
  }

  const results: HeirResult[] = [];
  for (const f of fardhUnits) {
    const amount = (f.units / aslMasalah) * netEstate;
    results.push({ id: f.id, name: f.name, count: f.count, basis: f.basis, fractionStr: `${f.num}/${f.den}`, totalAmount: amount, perPerson: amount / f.count, isAsabah: false });
  }

  if (radd) {
    const leftover = ((aslMasalah - totalFardhUnits) / aslMasalah) * netEstate;
    const raddhCandidates = fardhUnits.filter(f => f.id !== "suami" && f.id !== "istri");
    const raddhTotal = raddhCandidates.reduce((sum, f) => sum + f.units, 0);
    if (raddhTotal > 0) {
      for (const r of results) {
        const f = raddhCandidates.find(rc => rc.id === r.id);
        if (f) { const extra = leftover * (f.units / raddhTotal); r.totalAmount += extra; r.perPerson = r.totalAmount / r.count; }
      }
    }
  }

  if (!awl) {
    const asabahAmount = ((aslMasalah - totalFardhUnits) / aslMasalah) * netEstate;
    if (anakLaki > 0) {
      const totalParts = anakLaki * 2 + anakPerempuan;
      results.push({ id: "anakLaki", name: `Anak Laki-laki (${anakLaki} orang)`, count: anakLaki, basis: anakPerempuan > 0 ? "'Asabah bersama anak perempuan (2:1)" : "'Asabah — sisa seluruh harta", fractionStr: anakPerempuan > 0 ? `${anakLaki * 2}/${totalParts} dari sisa` : "Sisa harta", totalAmount: asabahAmount * (anakLaki * 2) / totalParts, perPerson: asabahAmount * 2 / totalParts, isAsabah: true });
      if (anakPerempuan > 0) {
        const dpIdx = results.findIndex(r => r.id === "anakPerempuan");
        if (dpIdx !== -1) results.splice(dpIdx, 1);
        results.push({ id: "anakPerempuan", name: `Anak Perempuan (${anakPerempuan} orang)`, count: anakPerempuan, basis: "'Asabah bersama anak laki-laki (1:2)", fractionStr: `${anakPerempuan}/${totalParts} dari sisa`, totalAmount: asabahAmount * anakPerempuan / totalParts, perPerson: asabahAmount / totalParts, isAsabah: true });
      }
    } else if (ayahAsabah) {
      const ayahResult = results.find(r => r.id === "ayah");
      if (ayahResult && daughtersFardh) { ayahResult.totalAmount += asabahAmount; ayahResult.perPerson = ayahResult.totalAmount; ayahResult.isAsabah = true; }
      else if (!ayahResult) results.push({ id: "ayah", name: "Ayah", count: 1, basis: "'Asabah — tidak ada anak", fractionStr: "Sisa harta", totalAmount: asabahAmount, perPerson: asabahAmount, isAsabah: true });
    } else if (kakekAsabah) {
      const kkResult = results.find(r => r.id === "kakek");
      if (kkResult && daughtersFardh) { kkResult.totalAmount += asabahAmount; kkResult.perPerson = kkResult.totalAmount; kkResult.isAsabah = true; }
      else if (!kkResult) results.push({ id: "kakek", name: "Kakek (Paternal)", count: 1, basis: "'Asabah — tidak ada Ayah dan anak laki-laki", fractionStr: "Sisa harta", totalAmount: asabahAmount, perPerson: asabahAmount, isAsabah: true });
    } else if (effSLK > 0) {
      const totalParts = effSLK * 2 + (saudariKandungFardh ? 0 : effSPK);
      results.push({ id: "saudaraLakiKandung", name: `Saudara Laki-laki Kandung (${effSLK} orang)`, count: effSLK, basis: effSPK > 0 && !saudariKandungFardh ? "'Asabah bersama saudari kandung (2:1)" : "'Asabah", fractionStr: `${effSLK * 2}/${Math.max(totalParts, 1)} dari sisa`, totalAmount: asabahAmount * (effSLK * 2) / Math.max(totalParts, 1), perPerson: asabahAmount * 2 / Math.max(totalParts, 1), isAsabah: true });
      if (effSPK > 0 && !saudariKandungFardh) {
        const spkIdx = results.findIndex(r => r.id === "saudariKandung");
        if (spkIdx !== -1) results.splice(spkIdx, 1);
        results.push({ id: "saudariKandung", name: `Saudari Kandung (${effSPK} orang)`, count: effSPK, basis: "'Asabah bersama saudara kandung (1:2)", fractionStr: `${effSPK}/${totalParts} dari sisa`, totalAmount: asabahAmount * effSPK / totalParts, perPerson: asabahAmount / totalParts, isAsabah: true });
      }
    } else if (effSLS > 0) {
      const totalParts = effSLS * 2 + (saudariSeayahFardh ? 0 : effSPS);
      results.push({ id: "saudaraLakiSeayah", name: `Saudara Laki-laki Seayah (${effSLS} orang)`, count: effSLS, basis: "'Asabah", fractionStr: "Sisa harta", totalAmount: asabahAmount * (effSLS * 2) / Math.max(totalParts, 1), perPerson: asabahAmount * 2 / Math.max(totalParts, 1), isAsabah: true });
      if (effSPS > 0 && !saudariSeayahFardh) {
        const spsIdx = results.findIndex(r => r.id === "saudariSeayah");
        if (spsIdx !== -1) results.splice(spsIdx, 1);
        results.push({ id: "saudariSeayah", name: `Saudari Seayah (${effSPS} orang)`, count: effSPS, basis: "'Asabah bersama saudara seayah (1:2)", fractionStr: `${effSPS}/${totalParts} dari sisa`, totalAmount: asabahAmount * effSPS / totalParts, perPerson: asabahAmount / totalParts, isAsabah: true });
      }
    } else if (saudariKandungFardh && daughtersFardh && effSLK === 0) {
      const spkResult = results.find(r => r.id === "saudariKandung");
      if (spkResult && asabahAmount > 0) { spkResult.totalAmount += asabahAmount; spkResult.perPerson = spkResult.totalAmount / spkResult.count; spkResult.isAsabah = true; spkResult.basis += " + sisa ('asabah bil ghair)"; }
    }
  }

  notes.push("Perhitungan menggunakan pendapat jumhur ulama (mazhab Syafi'i, Maliki, Hanbali).");
  notes.push("Ahli waris yang tidak dipilih dianggap tidak ada atau sudah meninggal lebih dulu.");
  return { netEstate, wasiatEfektif, awl, radd, results, blockedHeirs, notes };
}

const PIE_COLORS = ["#16a34a","#0d9488","#2563eb","#7c3aed","#db2777","#ea580c","#ca8a04","#64748b","#059669","#0891b2"];

function NumInput({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-emerald-800 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 shrink-0">Rp</span>
        <input type="number" min="0" value={value} onChange={e => onChange(e.target.value)}
          className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" />
      </div>
    </div>
  );
}

function CounterInput({ label, value, onChange, max = 99 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-emerald-100">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Kurangi ${label}`} className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200 text-sm flex items-center justify-center print-hidden">−</button>
        <span className="w-8 text-center font-semibold text-emerald-800 text-sm">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Tambah ${label}`} className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200 text-sm flex items-center justify-center print-hidden">+</button>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-emerald-100">
      <span className="text-sm text-gray-700">{label}</span>
      <button onClick={() => onChange(!value)} role="switch" aria-checked={value} aria-label={label} className={`w-11 h-6 rounded-full transition-colors duration-200 relative print-hidden ${value ? "bg-emerald-500" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function WarisPage() {
  const [, navigate] = useLocation();
  const [totalHarta, setTotalHarta] = useState("");
  const [hutang, setHutang] = useState("");
  const [wasiat, setWasiat] = useState("");
  const [biayaJenazah, setBiayaJenazah] = useState("");
  const [heirs, setHeirs] = useState<HeirInput>({ suami: false, istri: 0, anakLaki: 0, anakPerempuan: 0, ayah: false, ibu: false, kakek: false, nenek: false, saudaraLakiKandung: 0, saudaraPerempuanKandung: 0, saudaraLakiSeayah: 0, saudaraPerempuanSeayah: 0, saudaraSeibu: 0 });

  function setH<K extends keyof HeirInput>(k: K, v: HeirInput[K]) {
    setHeirs(prev => {
      const next = { ...prev, [k]: v };
      if (k === "suami" && v) next.istri = 0;
      if (k === "istri" && (v as number) > 0) next.suami = false;
      return next;
    });
  }

  const [result, setResult] = useState<WarisCalcResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  function handleHitung() {
    const total = parseFloat(totalHarta) || 0;
    if (total <= 0) { alert("Isi total harta terlebih dahulu"); return; }
    setResult(hitungWaris(total, parseFloat(hutang) || 0, parseFloat(wasiat) || 0, parseFloat(biayaJenazah) || 0, heirs));
  }

  const pieData = result
    ? result.results.map((r, i) => ({ name: r.name.split(" (")[0], value: r.totalAmount, color: PIE_COLORS[i % PIE_COLORS.length] }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 to-green-200 flex flex-col print-page">
      {/* Print letterhead */}
      <div className="print-letterhead px-8 pt-6">
        <Logo light={false} className="mb-2" />
        <div className="print-letterhead-text">
          <h1>HIKARIS</h1>
          <p>Hitung Zakat dan Waris</p>
          <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>Laporan Perhitungan Waris (Faraidh)</p>
        </div>
      </div>

      <header className="bg-teal-800 shadow-lg py-4 px-5 flex items-center justify-between print-hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} aria-label="Kembali ke Dashboard" className="text-teal-200 hover:text-white p-2 -ml-2 rounded-full hover:bg-teal-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo light={true} />
          <p className="text-teal-200 text-xs font-semibold border-l border-teal-600 pl-3 ml-1">Kalkulator Waris</p>
        </div>
        {result && (
          <button onClick={() => window.print()}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            🖨️ Cetak / PDF
          </button>
        )}
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">

        {/* Info accordion */}
        <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 print-hidden">
          <button onClick={() => setShowInfo(!showInfo)} className="w-full flex items-center justify-between px-5 py-4 text-emerald-800 font-semibold text-sm">
            <span>ℹ️ Tentang Perhitungan Waris Islam</span>
            <span>{showInfo ? "▲" : "▼"}</span>
          </button>
          {showInfo && (
            <div className="px-5 pb-4 text-xs text-gray-600 space-y-2">
              <p><strong>Urutan pembayaran:</strong> ① Biaya jenazah → ② Pelunasan hutang → ③ Wasiat (maks. 1/3) → ④ Pembagian waris</p>
              <p><strong>Dzawi al-furudh (fardh):</strong> Mendapat bagian tetap: 1/2, 1/4, 1/8, 2/3, 1/3, atau 1/6.</p>
              <p><strong>'Asabah:</strong> Mendapat sisa harta setelah fardh dibagi.</p>
              <p><strong>'Awl:</strong> Jika total bagian &gt; harta, semua dikurangi proporsional.</p>
              <p><strong>Radd:</strong> Jika total bagian &lt; harta dan tidak ada 'asabah, sisa dikembalikan.</p>
              <p><strong>Hajb:</strong> Ahli waris tertentu menghalangi ahli waris lain.</p>
            </div>
          )}
        </div>

        {/* Input harta */}
        <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 p-5 print-section">
          <h2 className="text-base font-bold text-emerald-800 mb-4">💼 Data Harta Pewaris</h2>
          <div className="space-y-4">
            <NumInput label="Total harta (aset)" value={totalHarta} onChange={setTotalHarta} hint="Jumlah keseluruhan aset" />
            <NumInput label="Hutang yang harus dilunasi" value={hutang} onChange={setHutang} />
            <NumInput label="Wasiat (jika ada)" value={wasiat} onChange={setWasiat} hint="Dibatasi maks. 1/3 harta bersih" />
            <NumInput label="Biaya pengurusan jenazah" value={biayaJenazah} onChange={setBiayaJenazah} />
          </div>
          {(parseFloat(totalHarta) || 0) > 0 && (
            <div className="mt-3 bg-emerald-100 rounded-lg p-3 text-xs text-emerald-700">
              Harta bersih yang dibagi:{" "}
              <strong>{formatRp(Math.max(0, (parseFloat(totalHarta)||0) - (parseFloat(hutang)||0) - Math.min(parseFloat(wasiat)||0, Math.max(0,(parseFloat(totalHarta)||0)-(parseFloat(hutang)||0)-(parseFloat(biayaJenazah)||0))/3) - (parseFloat(biayaJenazah)||0)))}</strong>
            </div>
          )}
        </div>

        {/* Ahli waris */}
        <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 p-5 print-hidden">
          <h2 className="text-base font-bold text-emerald-800 mb-1">👨‍👩‍👧‍👦 Ahli Waris</h2>
          <p className="text-xs text-gray-500 mb-3">Aktifkan/isi ahli waris yang ada</p>
          <div className="mb-3">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Pasangan</p>
            <ToggleRow label="Suami" value={heirs.suami} onChange={v => setH("suami", v)} />
            <CounterInput label="Istri" value={heirs.istri} onChange={v => setH("istri", v)} max={4} />
          </div>
          <div className="mb-3">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Anak</p>
            <CounterInput label="Anak Laki-laki" value={heirs.anakLaki} onChange={v => setH("anakLaki", v)} />
            <CounterInput label="Anak Perempuan" value={heirs.anakPerempuan} onChange={v => setH("anakPerempuan", v)} />
          </div>
          <div className="mb-3">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Orang Tua</p>
            <ToggleRow label="Ayah" value={heirs.ayah} onChange={v => setH("ayah", v)} />
            <ToggleRow label="Ibu" value={heirs.ibu} onChange={v => setH("ibu", v)} />
            <ToggleRow label="Kakek (Paternal)" value={heirs.kakek} onChange={v => setH("kakek", v)} />
            <ToggleRow label="Nenek (Paternal)" value={heirs.nenek} onChange={v => setH("nenek", v)} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Saudara</p>
            <CounterInput label="Saudara Laki-laki Kandung" value={heirs.saudaraLakiKandung} onChange={v => setH("saudaraLakiKandung", v)} />
            <CounterInput label="Saudari Kandung" value={heirs.saudaraPerempuanKandung} onChange={v => setH("saudaraPerempuanKandung", v)} />
            <CounterInput label="Saudara Laki-laki Seayah" value={heirs.saudaraLakiSeayah} onChange={v => setH("saudaraLakiSeayah", v)} />
            <CounterInput label="Saudari Seayah" value={heirs.saudaraPerempuanSeayah} onChange={v => setH("saudaraPerempuanSeayah", v)} />
            <CounterInput label="Saudara/i Seibu" value={heirs.saudaraSeibu} onChange={v => setH("saudaraSeibu", v)} />
          </div>
        </div>

        <button onClick={handleHitung}
          className="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold py-3 rounded-xl shadow transition-all duration-150 text-base print-hidden">
          Hitung Pembagian Waris
        </button>

        {result && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-emerald-50 rounded-2xl shadow-sm border border-teal-200 p-5 print-section">
              <h2 className="text-base font-bold text-teal-800 mb-3">📊 Ringkasan</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-teal-100 rounded-xl p-3">
                  <p className="text-xs text-teal-600">Harta Bersih Dibagi</p>
                  <p className="font-extrabold text-teal-800 text-base">{formatRp(result.netEstate)}</p>
                </div>
                <div className={`rounded-xl p-3 ${result.awl ? "bg-amber-100" : result.radd ? "bg-blue-100" : "bg-emerald-100"}`}>
                  <p className="text-xs text-gray-600">Status Pembagian</p>
                  <p className={`font-bold text-sm ${result.awl ? "text-amber-700" : result.radd ? "text-blue-700" : "text-emerald-700"}`}>
                    {result.awl ? "⚠️ 'Awl" : result.radd ? "↩️ Radd" : "✓ Normal"}
                  </p>
                </div>
              </div>
              {result.blockedHeirs.length > 0 && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-xs font-bold text-red-700 mb-1">🚫 Ahli Waris Terhalang (Mahjub):</p>
                  <ul className="text-xs text-red-600 space-y-0.5">{result.blockedHeirs.map((b, i) => <li key={i}>• {b}</li>)}</ul>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 overflow-hidden print-section">
              <h2 className="text-base font-bold text-emerald-800 px-5 pt-5 pb-3">📋 Tabel Pembagian</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-emerald-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-emerald-800 font-bold">Ahli Waris</th>
                      <th className="px-3 py-2 text-center text-emerald-800 font-bold">Bagian</th>
                      <th className="px-3 py-2 text-right text-emerald-800 font-bold">Total (Rp)</th>
                      <th className="px-3 py-2 text-right text-emerald-800 font-bold">Per Orang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-emerald-50"}>
                        <td className="px-3 py-2">
                          <div className="font-semibold text-gray-800">{r.name}</div>
                          <div className="text-gray-400 mt-0.5">{r.basis}</div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold ${r.isAsabah ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {r.isAsabah ? "Asabah" : r.fractionStr}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-800">{formatRp(r.totalAmount)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{r.count > 1 ? formatRp(r.perPerson) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-emerald-300">
                    <tr className="bg-emerald-100">
                      <td colSpan={2} className="px-3 py-2 font-bold text-emerald-800">Total</td>
                      <td className="px-3 py-2 text-right font-extrabold text-emerald-800">{formatRp(result.results.reduce((s, r) => s + r.totalAmount, 0))}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Donut chart — hidden in print (chart sulit dicetak proporsional) */}
            {pieData.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 p-5 print-hidden">
                <h2 className="text-base font-bold text-emerald-800 mb-3">🥧 Proporsi Pembagian</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={2}>
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatRp(value), "Bagian"]} />
                    <Legend formatter={(value) => <span className="text-xs text-gray-700">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Notes */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 print-section">
              <h2 className="text-sm font-bold text-blue-800 mb-2">📝 Catatan Fikih</h2>
              <ul className="text-xs text-blue-700 space-y-1">{result.notes.map((n, i) => <li key={i}>• {n}</li>)}</ul>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 print-section">
          <strong>⚠️ Disclaimer:</strong> Hasil ini bersifat indikatif berdasarkan kaidah fikih jumhur ulama dan tidak menggantikan keputusan hukum resmi. Pembagian waris yang sah memerlukan musyawarah keluarga dan (jika diperlukan) penetapan pengadilan agama.
        </div>
      </main>
    </div>
  );
}

const logoSrc = `${import.meta.env.BASE_URL}hikaris-logo.png`;

export function Logo({ className = "", light = true }: { className?: string, light?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={logoSrc} alt="HIKARIS" className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-sm" />
      <span className={`font-extrabold tracking-tight text-xl sm:text-2xl ${light ? 'text-white drop-shadow-sm' : 'text-emerald-800'}`}>
        HIKARIS
      </span>
    </div>
  );
}

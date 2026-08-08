'use client'

type AuthBrandProps = {
  className?: string;
};

export function AuthBrand({ className }: AuthBrandProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <img alt="pennywise-logo" className="w-[5ch]" src={"/icon.png"} />
      <span className="font-mono text-sm font-bold uppercase tracking-[0.24em]">
        Pennywise
      </span>
    </div>
  );
}

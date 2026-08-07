type AuthBrandProps = {
  className?: string;
};

export function AuthBrand({ className }: AuthBrandProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <span className="flex h-10 w-10 items-center justify-center bg-[var(--color-primary)] font-mono text-lg font-bold text-white">
        P
      </span>
      <span className="font-mono text-sm font-bold uppercase tracking-[0.24em]">
        Pennywise
      </span>
    </div>
  );
}

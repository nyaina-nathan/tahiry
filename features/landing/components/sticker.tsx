import type { ReactNode } from "react";

type StickerTone = "pink" | "cyan" | "lime" | "khaki" | "white" | "black";

const toneClasses: Record<StickerTone, string> = {
  pink: "bg-[#fa00ff] text-black",
  cyan: "bg-[#02bbff] text-black",
  lime: "bg-[#adff02] text-black",
  khaki: "bg-[#e7e3bf] text-black",
  white: "bg-white text-black",
  black: "bg-black text-white",
};

type StickerProps = {
  children: ReactNode;
  tone?: StickerTone;
  rotate?: number;
  className?: string;
};

export function Sticker({
  children,
  tone = "khaki",
  rotate = 0,
  className = "",
}: StickerProps) {
  return (
    <div
      aria-hidden="true"
      className={`inline-flex items-center justify-center border border-black text-center ${toneClasses[tone]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  );
}

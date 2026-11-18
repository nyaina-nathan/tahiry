const PHRASES = ["Log it", "See it", "Fix it", "Repeat"];

function TickerGroup() {
  return (
    <div className="flex shrink-0 items-center">
      {PHRASES.map((phrase) => (
        <span key={phrase} className="flex items-center">
          <span className="px-5 text-sm font-bold uppercase tracking-[0.16em] sm:px-7 sm:text-base">
            {phrase}
          </span>
          <span aria-hidden="true" className="text-xl leading-none">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export function TickerStrip() {
  return (
    <>
      <p className="sr-only">Log it. See it. Fix it. Repeat.</p>
      <div
        aria-hidden="true"
        className="uc-marquee overflow-hidden border-y border-black bg-black py-3 text-[#adff02]"
      >
        <div className="uc-marquee-track flex w-max items-center">
          <TickerGroup />
          <TickerGroup />
          <TickerGroup />
          <TickerGroup />
        </div>
      </div>
    </>
  );
}

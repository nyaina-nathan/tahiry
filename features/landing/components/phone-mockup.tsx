function PhoneStatusIcons() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 44 10"
      className="h-2 w-11 fill-black"
    >
      <rect x="0" y="6" width="3" height="4" rx="1" />
      <rect x="5" y="5" width="3" height="5" rx="1" />
      <rect x="10" y="3" width="3" height="7" rx="1" />
      <rect x="15" y="1" width="3" height="9" rx="1" />
      <rect
        x="25"
        y="1"
        width="15"
        height="8"
        rx="2"
        fill="none"
        stroke="black"
        strokeWidth="1"
      />
      <rect x="27" y="3" width="9" height="4" rx="1" />
      <rect x="41" y="3" width="2" height="4" rx="1" />
    </svg>
  );
}

function Chart() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 76"
      className="mt-1 h-16 w-full"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="19" x2="240" y2="19" stroke="#e4e4e4" strokeWidth="1" />
      <line x1="0" y1="38" x2="240" y2="38" stroke="#e4e4e4" strokeWidth="1" />
      <line x1="0" y1="57" x2="240" y2="57" stroke="#e4e4e4" strokeWidth="1" />
      <path
        d="M2 62 C 20 56, 31 60, 44 47 S 70 54, 86 39 S 116 49, 132 30 S 162 37, 180 22 S 210 28, 238 12 L 238 76 L 2 76 Z"
        fill="#adff02"
        opacity="0.32"
      />
      <path
        d="M2 62 C 20 56, 31 60, 44 47 S 70 54, 86 39 S 116 49, 132 30 S 162 37, 180 22 S 210 28, 238 12"
        fill="none"
        stroke="black"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M2 51 C 20 49, 31 52, 44 45 S 70 48, 86 41 S 116 45, 132 37 S 162 41, 180 31 S 210 35, 238 25"
        fill="none"
        stroke="#fa00ff"
        strokeWidth="2"
        strokeDasharray="3 4"
        strokeLinecap="round"
      />
      <circle cx="86" cy="39" r="3.5" fill="#adff02" stroke="black" strokeWidth="1.5" />
      <circle cx="180" cy="22" r="3.5" fill="#02bbff" stroke="black" strokeWidth="1.5" />
    </svg>
  );
}

function MovementRow({
  icon,
  title,
  meta,
  amount,
}: {
  icon: string;
  title: string;
  meta: string;
  amount: string;
}) {
  return (
    <li className="flex items-center gap-2 border-b border-black/10 py-1.5 last:border-b-0">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-black bg-black text-[10px] font-bold text-[#adff02]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[9px] font-bold leading-tight">
          {title}
        </span>
        <span className="block text-[7px] leading-tight text-[#6e6e6e]">
          {meta}
        </span>
      </span>
      <span className="shrink-0 text-[9px] font-bold tabular-nums">
        {amount}
      </span>
    </li>
  );
}

export function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="Preview of the Tahiry app showing a 2,450,000 MGA balance, a cashflow chart, and recent money movements."
      className="relative mx-auto w-[272px] sm:w-[306px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-2.5 translate-y-2.5 rotate-2 rounded-[43px] border border-black bg-[#adff02]"
      />
      <div className="relative rounded-[43px] border border-black bg-[#0a0a0a] p-2.5">
        <div className="relative overflow-hidden rounded-[34px] border border-black bg-[#f2f2f2]">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black"
          />

          <div className="flex items-center justify-between px-4 pb-1 pt-3 text-[9px] font-bold">
            <span>9:41</span>
            <PhoneStatusIcons />
          </div>

          <div className="px-3.5 pb-3.5 pt-1.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="uc-display text-lg leading-none">TAHIRY</p>
                <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.16em] text-[#6e6e6e]">
                  Tuesday, 18 Nov
                </p>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-black bg-[#e7e3bf] text-[9px] font-bold">
                T
              </span>
            </div>

            <div className="relative mt-2 overflow-hidden rounded-2xl border border-black bg-[#0a0a0a] p-3 text-white">
              <div
                aria-hidden="true"
                className="absolute -right-5 -top-5 h-16 w-16 rounded-full border border-black bg-[#fa00ff]"
              />
              <p className="uc-kicker relative text-[8px] text-[#adff02]">
                Total balance
              </p>
              <p className="relative mt-1 text-[23px] font-bold leading-none tracking-[-0.04em]">
                2,450,000{" "}
                <span className="text-[10px] tracking-normal">MGA</span>
              </p>
              <div className="relative mt-2.5 flex items-center justify-between gap-2">
                <span className="rounded-full border border-black bg-[#adff02] px-2 py-0.5 text-[8px] font-bold text-black">
                  +18% this month
                </span>
                <span className="text-[7px] text-[#9ca3af]">
                  vs last month
                </span>
              </div>
            </div>

            <div className="mt-2 rounded-2xl border border-black bg-white p-2.5">
              <div className="flex items-center justify-between">
                <p className="uc-kicker text-[7px]">Cashflow</p>
                <div className="flex items-center gap-2 text-[6px] font-bold text-[#6e6e6e]">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#adff02]" />
                    In
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#fa00ff]" />
                    Out
                  </span>
                </div>
              </div>
              <Chart />
              <div className="flex justify-between text-[6px] font-bold uppercase tracking-[0.08em] text-[#6e6e6e]">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <div className="flex items-center justify-between gap-1 rounded-xl border border-black bg-[#adff02] px-2.5 py-1.5 text-[8px] font-bold">
                <span>Add expense</span>
                <span aria-hidden="true">+</span>
              </div>
              <div className="flex items-center justify-between gap-1 rounded-xl border border-black bg-white px-2.5 py-1.5 text-[8px] font-bold">
                <span>Add income</span>
                <span aria-hidden="true">↓</span>
              </div>
            </div>

            <div className="mt-2 rounded-2xl border border-black bg-white p-2.5">
              <div className="flex items-center justify-between">
                <p className="uc-kicker text-[7px]">Latest</p>
                <span className="text-[7px] font-bold text-[#6e6e6e]">
                  See all
                </span>
              </div>
              <ul className="mt-1">
                <MovementRow
                  icon="−"
                  title="Coffee run"
                  meta="Today · Food"
                  amount="−12,000"
                />
                <MovementRow
                  icon="+"
                  title="Salary"
                  meta="Yesterday · Income"
                  amount="+850,000"
                />
                <MovementRow
                  icon="↔"
                  title="Savings move"
                  meta="Mon · Transfer"
                  amount="−200,000"
                />
              </ul>
            </div>

            <div className="mt-2 flex items-center justify-around rounded-xl border border-black bg-white py-1.5">
              {[0, 1, 2, 3].map((item) => (
                <span
                  key={item}
                  aria-hidden="true"
                  className={`h-3 w-3 rounded-[3px] border border-black ${
                    item === 0 ? "bg-[#adff02]" : "bg-[#f2f2f2]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { selectClassName } from "@/features/dashboard/components/movement-form-fields";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

type MovementPageSizeControlProps = {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
};

export function MovementPageSizeControl({
  pageSize,
  onPageSizeChange,
}: MovementPageSizeControlProps) {
  return (
    <div className="dash-panel mb-5 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor="movement-page-size"
          className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-muted)]"
        >
          Movements per page
        </label>
        <select
          id="movement-page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className={`${selectClassName} sm:w-32`}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

"use client";

import WheelPicker from "@/components/ui/WheelPicker";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "30"];

interface DateTimeButtonProps {
  label: string;
  /** "HH:MM" 또는 null */
  value: string | null;
  onChange: (time: string) => void;
}

/** 커스텀 시간 선택 — input type="time" 사용 금지 스펙 대응 */
export default function DateTimeButton({
  label,
  value,
  onChange,
}: DateTimeButtonProps) {
  const hourIdx = value ? parseInt(value.slice(0, 2), 10) : 9;
  const minIdx = value ? (parseInt(value.slice(3, 5), 10) === 30 ? 1 : 0) : 0;

  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-bold text-[#8A6040]">{label}</p>
      <div className="flex items-end gap-1">
        <div className="flex-1">
          <WheelPicker
            items={HOURS}
            selectedIndex={hourIdx}
            visibleCount={3}
            onChange={(idx) => onChange(`${HOURS[idx]}:${MINUTES[minIdx]}`)}
          />
        </div>
        <span className="mb-2.5 text-[15px] font-extrabold text-[#B07040]">:</span>
        <div style={{ width: 56 }}>
          <WheelPicker
            items={MINUTES}
            selectedIndex={minIdx}
            visibleCount={3}
            onChange={(idx) => onChange(`${HOURS[hourIdx]}:${MINUTES[idx]}`)}
          />
        </div>
      </div>
    </div>
  );
}

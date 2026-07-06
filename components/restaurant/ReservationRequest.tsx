"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { IconCalendarPlus, IconLogin2 } from "@tabler/icons-react";
import DateTimeButton from "@/components/ui/DateTimeButton";
import { createReservation } from "@/app/actions/reservations";

interface Props {
  restaurantId: string;
  /** 예약 요청은 로그인 필수 — 결과 통지를 계정 이메일로 보냄 */
  isLoggedIn: boolean;
}

const DAYS_SHOWN = 14;
const PARTY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

/** KST 기준 오늘부터 14일 (서버 검증과 동일 기준) */
function nextDays(): string[] {
  const base = Date.now() + 9 * 60 * 60 * 1000;
  return Array.from({ length: DAYS_SHOWN }, (_, i) =>
    new Date(base + i * 86400000).toISOString().slice(0, 10),
  );
}

export default function ReservationRequest({ restaurantId, isLoggedIn }: Props) {
  const t = useTranslations("detail");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>("18:00");
  const [party, setParty] = useState(2);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const days = useMemo(nextDays, []);
  const dayLabel = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, {
      month: "numeric",
      day: "numeric",
      weekday: "short",
      timeZone: "UTC",
    });
    return (d: string) => fmt.format(new Date(`${d}T00:00:00Z`));
  }, [locale]);

  if (!isLoggedIn) {
    return (
      <section id="reserve-request" className="px-4 pb-3">
        <Link
          href={`/login?next=/restaurant/${restaurantId}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[#FFD4B8] bg-white py-3 text-[13px] font-bold text-[#FF6B35]"
        >
          <IconLogin2 size={15} />
          {t("loginToReserve")}
        </Link>
      </section>
    );
  }

  if (done) {
    return (
      <section id="reserve-request" className="px-4 pb-3">
        <div className="rounded-2xl bg-[#DCFCE7] px-4 py-3 text-center">
          <p className="text-[13px] font-bold text-[#15803D]">
            {t("reserveSent")}
          </p>
          <p className="mt-0.5 text-[11px] text-[#15803D]">
            {t("reserveSentDesc")}
          </p>
        </div>
      </section>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending || !date || !time) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("restaurantId", restaurantId);
    formData.set("date", date);
    formData.set("time", time);
    formData.set("partySize", String(party));

    startTransition(async () => {
      const result = await createReservation(formData);
      if (result.ok) setDone(true);
      else setError(result.error ?? "reserveError");
    });
  };

  return (
    <section id="reserve-request" className="px-4 pb-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[13px] font-extrabold text-white"
          style={{ backgroundColor: "#FF6B35" }}
        >
          <IconCalendarPlus size={15} />
          {t("reserveRequestTitle")}
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#FFE8D6] bg-white p-4"
        >
          <h3 className="mb-3 text-[14px] font-extrabold text-[#1A0800]">
            {t("reserveRequestTitle")}
          </h3>

          {/* 날짜 — 14일 가로 스크롤 칩 (input type=date 금지 스펙) */}
          <p className="mb-1.5 text-[11px] font-bold text-[#8A6040]">
            {t("reserveDate")}
          </p>
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {days.map((d) => {
              const selected = d === date;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className="shrink-0 rounded-xl px-3 py-2 text-[12px] font-bold"
                  style={
                    selected
                      ? { backgroundColor: "#CC4400", color: "#FFFFFF" }
                      : {
                          backgroundColor: "#FFF5EE",
                          color: "#8A6040",
                        }
                  }
                >
                  {dayLabel(d)}
                </button>
              );
            })}
          </div>

          {/* 시간 */}
          <div className="mb-3">
            <DateTimeButton
              label={t("reserveTime")}
              value={time}
              onChange={setTime}
            />
          </div>

          {/* 인원 */}
          <p className="mb-1.5 text-[11px] font-bold text-[#8A6040]">
            {t("reserveParty")}
          </p>
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
            {PARTY_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setParty(n)}
                className="h-9 w-9 shrink-0 rounded-xl text-[13px] font-bold"
                style={
                  party === n
                    ? { backgroundColor: "#CC4400", color: "#FFFFFF" }
                    : { backgroundColor: "#FFF5EE", color: "#8A6040" }
                }
              >
                {n}
              </button>
            ))}
          </div>

          {/* 요청사항 */}
          <p className="mb-1.5 text-[11px] font-bold text-[#8A6040]">
            {t("reserveNote")}
          </p>
          <textarea
            name="note"
            maxLength={500}
            rows={2}
            placeholder={t("reserveNotePlaceholder")}
            className="mb-3 w-full resize-none rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-[13px] text-[#1A0800] placeholder:text-[#C0A080] focus:border-[#FF6B35] focus:outline-none"
          />

          {error && (
            <p className="mb-3 text-[12px] font-bold text-[#B91C1C]">
              {t(error)}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border border-[#FFD4B8] py-2.5 text-[13px] font-bold text-[#8A6040]"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending || !date || !time}
              className="flex-1 rounded-xl py-2.5 text-[13px] font-extrabold text-white disabled:opacity-50"
              style={{ backgroundColor: "#FF6B35" }}
            >
              {isPending ? "…" : t("reserveSubmit")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

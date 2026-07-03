"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconMapPinSearch, IconX } from "@tabler/icons-react";

const POSTCODE_SRC =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
const KAKAO_SDK_SRC = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`;

export interface AddressValue {
  address: string;
  lat: number | null;
  lng: number | null;
}

interface AddressSearchProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
}

/** 같은 src는 한 번만 삽입 — MapView(next/script)가 이미 로드한 SDK도 재사용 */
function loadScript(src: string, isReady: () => boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isReady()) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(src)));
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.addEventListener("load", () => resolve());
    s.addEventListener("error", () => reject(new Error(src)));
    document.head.appendChild(s);
  });
}

async function geocode(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    await loadScript(KAKAO_SDK_SRC, () => !!window.kakao?.maps);
    await new Promise<void>((r) => window.kakao.maps.load(r));
    return await new Promise((resolve) => {
      new window.kakao.maps.services.Geocoder().addressSearch(
        address,
        (result, status) => {
          const first = result[0];
          if (status === "OK" && first) {
            resolve({ lat: Number(first.y), lng: Number(first.x) });
          } else {
            resolve(null);
          }
        },
      );
    });
  } catch {
    return null;
  }
}

/**
 * Daum 우편번호 검색 + 카카오 지오코딩.
 * 주소 선택 시 좌표까지 확정해 onChange로 올린다 — 좌표 없는 주소는
 * 지도에 잘못 표시되므로 상위 폼이 lat/lng 존재를 검증해야 한다.
 */
export default function AddressSearch({ value, onChange }: AddressSearchProps) {
  const t = useTranslations("register");
  const [open, setOpen] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [failed, setFailed] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadScript(POSTCODE_SRC, () => !!window.daum?.Postcode)
      .then(() => {
        if (cancelled || !layerRef.current) return;
        layerRef.current.innerHTML = "";
        new window.daum.Postcode({
          oncomplete: async (data) => {
            setOpen(false);
            const address = data.roadAddress || data.jibunAddress;
            setGeocoding(true);
            const coords = await geocode(address);
            setGeocoding(false);
            setFailed(!coords);
            onChangeRef.current({
              address,
              lat: coords?.lat ?? null,
              lng: coords?.lng ?? null,
            });
          },
          width: "100%",
          height: "100%",
        }).embed(layerRef.current);
      })
      .catch(() => {
        if (!cancelled) {
          setOpen(false);
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setFailed(false);
          setOpen(true);
        }}
        disabled={geocoding}
        className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-[#FFD4B8] bg-white px-3 py-2.5 text-start text-[13px] font-semibold focus:border-[#FF6B35] focus:outline-none disabled:opacity-60"
      >
        <IconMapPinSearch size={16} color="#FF6B35" className="shrink-0" />
        <span
          className={`min-w-0 flex-1 truncate ${
            value.address ? "text-[#1A0800]" : "text-[#C0A080]"
          }`}
        >
          {geocoding
            ? t("addressGeocoding")
            : value.address || t("addressSearchPlaceholder")}
        </span>
      </button>

      {failed && (
        <p className="mt-1 text-[11px] font-bold text-[#B91C1C]">
          {t("geocodeFailed")}
        </p>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-[70dvh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#FFE8D6] px-4 py-3">
              <h3 className="text-[14px] font-extrabold text-[#1A0800]">
                {t("addressSearchTitle")}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <IconX size={18} color="#8A6040" />
              </button>
            </div>
            <div ref={layerRef} className="min-h-0 flex-1" />
          </div>
        </div>
      )}
    </div>
  );
}

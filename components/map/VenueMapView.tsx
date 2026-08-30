"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import type { Category } from "@/types";
import { createPinElement } from "./MapPin";

interface VenueMapViewProps {
  /** 식당 이름 — 카카오맵 장소 보기 링크에 사용 */
  name: string;
  category: Category;
  lat: number;
  lng: number;
}

/**
 * 상세 페이지용 잠긴 미니맵 — 핀 하나만 찍고 드래그·줌은 전부 끈다.
 * 세로 스크롤 중 지도가 손가락을 빼앗는 문제를 피하려는 것.
 * 지도를 덮는 투명 링크가 탭을 받아 카카오맵 장소 보기로 보낸다.
 */
export default function VenueMapView({
  name,
  category,
  lat,
  lng,
}: VenueMapViewProps) {
  const t = useTranslations("common");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;
    const position = new window.kakao.maps.LatLng(lat, lng);
    const map = new window.kakao.maps.Map(containerRef.current, {
      center: position,
      /* 목록 지도(5)보다 가깝게 — 한 곳만 보여주므로 */
      level: 3,
      draggable: false,
      scrollwheel: false,
      disableDoubleClick: true,
      disableDoubleClickZoom: true,
    });
    /* zoomable은 생성자 옵션에 없어 메서드로 끈다 (핀치 줌 차단) */
    map.setZoomable(false);
    mapRef.current = map;

    new window.kakao.maps.CustomOverlay({
      position,
      content: createPinElement(category),
      yAnchor: 1,
    }).setMap(map);
  }, [category, lat, lng]);

  /* SDK 로드 완료 → 지도 초기화 */
  useEffect(() => {
    if (!sdkReady) return;
    window.kakao.maps.load(initMap);
  }, [sdkReady, initMap]);

  /* 컨테이너 크기 변화 → relayout — 목록 지도와 같은 이유(주소창 접힘, 회전) */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const map = mapRef.current;
        if (!map) return;
        map.relayout();
        map.setCenter(new window.kakao.maps.LatLng(lat, lng));
      });
    });
    observer.observe(container);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [lat, lng]);

  if (sdkError) {
    return (
      <div className="flex h-40 items-center justify-center bg-[#FFF5EE]">
        <p className="text-[12px] font-semibold text-[#B07040]">
          {t("mapUnavailable")}
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
        onError={() => setSdkError(true)}
      />
      <div className="relative h-40">
        <div ref={containerRef} className="h-full w-full bg-[#FFF5EE]" />
        {/* 지도를 덮는 링크 — 잠긴 지도는 컨테이너가 클릭을 삼키므로 위에 얹는다.
            카카오 내부 레이어가 z-index 0~2를 쓰므로 z-10으로 확실히 올린다 */}
        <a
          href={`https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          className="absolute inset-0 z-10"
        />
      </div>
    </>
  );
}

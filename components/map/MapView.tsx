"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import type { Category, RestaurantListItem } from "@/types";
import {
  createMyLocationElement,
  createPinElement,
  setPinVisible,
} from "./MapPin";

interface MapViewProps {
  restaurants: RestaurantListItem[];
  /** 선택된 카테고리 — 빈 배열이면 전체 표시 */
  visibleCategories: Category[];
  center: { lat: number; lng: number };
  myLocation: { lat: number; lng: number } | null;
  onPinClick: (id: string) => void;
}

export default function MapView({
  restaurants,
  visibleCategories,
  center,
  myLocation,
  onPinClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const pinsRef = useRef<globalThis.Map<string, HTMLElement>>(
    new globalThis.Map(),
  );
  const myLocOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new window.kakao.maps.Map(containerRef.current, {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: 5,
    });
    mapRef.current = map;

    for (const r of restaurants) {
      const el = createPinElement(r.category, () => onPinClick(r.id));
      pinsRef.current.set(r.id, el);
      new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(r.lat, r.lng),
        content: el,
        yAnchor: 1,
        clickable: true,
      }).setMap(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* SDK 로드 완료 → 지도 초기화 */
  useEffect(() => {
    if (!sdkReady) return;
    window.kakao.maps.load(initMap);
  }, [sdkReady, initMap]);

  /* 카테고리 필터 → 핀 show/hide (opacity + scale) */
  useEffect(() => {
    for (const r of restaurants) {
      const el = pinsRef.current.get(r.id);
      if (!el) continue;
      const visible =
        visibleCategories.length === 0 ||
        visibleCategories.includes(r.category);
      setPinVisible(el, visible);
    }
  }, [visibleCategories, restaurants]);

  /* 내 위치 갱신 */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !myLocation || !window.kakao) return;
    const pos = new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng);
    if (!myLocOverlayRef.current) {
      myLocOverlayRef.current = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: createMyLocationElement(),
        zIndex: 10,
      });
      myLocOverlayRef.current.setMap(map);
    }
    map.setCenter(pos);
  }, [myLocation, sdkReady]);

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onReady={() => setSdkReady(true)}
      />
      <div ref={containerRef} className="h-full w-full bg-[#FFF5EE]" />
    </>
  );
}

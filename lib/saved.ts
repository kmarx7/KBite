"use client";

import { useSyncExternalStore } from "react";

/**
 * 찜 저장 — 로그인 도입 전까지 localStorage(기기별).
 * 계정 시스템 도입 시 profiles.saved_restaurants로 마이그레이션한다.
 */

const STORAGE_KEY = "kbite_saved";
const CHANGE_EVENT = "kbite-saved-change";

function readRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

/* useSyncExternalStore의 getSnapshot은 같은 값이면 같은 참조를 반환해야 한다 */
let cache: { raw: string; ids: string[] } = { raw: "[]", ids: [] };

function getSnapshot(): string[] {
  const raw = readRaw();
  if (raw !== cache.raw) {
    let ids: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) ids = parsed.filter((v) => typeof v === "string");
    } catch {
      /* 손상된 값은 빈 목록으로 */
    }
    cache = { raw, ids };
  }
  return cache.ids;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback); // 다른 탭 동기화
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

const EMPTY: string[] = [];

/** 찜한 식당 id 목록 — 저장 순서 유지, 탭 간 동기화 */
export function useSavedIds(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** 찜 토글 — 찜 상태가 되면 true 반환 */
export function toggleSaved(id: string): boolean {
  const current = getSnapshot();
  const nowSaved = !current.includes(id);
  const next = nowSaved
    ? [...current, id]
    : current.filter((v) => v !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* 저장 불가(시크릿 모드 등) — 토글은 무시됨 */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return nowSaved;
}

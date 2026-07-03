"use client";

import { useSyncExternalStore } from "react";
import {
  mergeSavedRestaurants,
  setSavedRestaurants,
} from "@/app/actions/account";

/**
 * 찜 저장 — localStorage가 1차 저장소(비로그인 포함 즉시 반응),
 * 로그인 상태면 profiles.saved_restaurants에 백그라운드 동기화.
 * 로그인 직후에는 syncSavedWithServer()가 양쪽을 합집합으로 병합한다.
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

function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* 저장 불가(시크릿 모드 등) */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** 찜 토글 — 찜 상태가 되면 true 반환. 로그인 상태면 서버에도 반영 */
export function toggleSaved(id: string): boolean {
  const current = getSnapshot();
  const nowSaved = !current.includes(id);
  const next = nowSaved
    ? [...current, id]
    : current.filter((v) => v !== id);
  writeLocal(next);
  /* 비로그인이면 서버 액션이 조용히 무시 — 실패해도 로컬은 유지 */
  void setSavedRestaurants(next).catch(() => {});
  return nowSaved;
}

/**
 * 로컬 찜과 서버 찜을 합집합으로 병합 (로그인 직후·페이지 첫 로드에 1회).
 * 로그인 상태였으면 true 반환.
 */
export async function syncSavedWithServer(): Promise<boolean> {
  try {
    const merged = await mergeSavedRestaurants(getSnapshot());
    if (!merged) return false;
    writeLocal(merged.ids);
    return true;
  } catch {
    return false;
  }
}

"use client";

import { useEffect } from "react";
import { syncSavedWithServer } from "@/lib/saved";

const SESSION_FLAG = "kbite_saved_synced";

/** 페이지 첫 로드 시 1회, 로그인 상태면 찜을 서버와 병합 (브라우저 세션당 1회) */
export default function SavedSync() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_FLAG)) return;
    } catch {
      return;
    }
    void syncSavedWithServer().then((loggedIn) => {
      /* 비로그인(false)이면 플래그를 남기지 않음 — 로그인 후 재시도 여지 */
      if (loggedIn) {
        try {
          sessionStorage.setItem(SESSION_FLAG, "1");
        } catch {}
      }
    });
  }, []);
  return null;
}

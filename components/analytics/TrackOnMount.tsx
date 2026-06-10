"use client";

import { useEffect } from "react";
import { track, type TrackEvent } from "@/lib/analytics";

/** 서버 컴포넌트 페이지에서 마운트 시 1회 이벤트를 보내는 헬퍼 */
export default function TrackOnMount({
  event,
  properties,
}: {
  event: TrackEvent;
  properties?: Record<string, string | number | boolean>;
}) {
  useEffect(() => {
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

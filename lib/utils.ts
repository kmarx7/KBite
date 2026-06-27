/** 두 좌표 간 거리 (km) — Haversine */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** "HH:MM" 영업시간 기준 현재 영업 여부 */
export function isOpenNow(
  opening: string | null,
  closing: string | null,
  now = new Date(),
): boolean {
  if (!opening || !closing) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = opening.split(":").map(Number);
  const [ch, cm] = closing.split(":").map(Number);
  const start = oh * 60 + om;
  const end = ch * 60 + cm;
  /* 자정 넘는 영업시간 (예: 18:00~02:00) 처리 */
  if (end < start) return minutes >= start || minutes < end;
  return minutes >= start && minutes < end;
}

/** 위치 권한 거부/실패 시 기본 위치 — 이태원 */
export const DEFAULT_LOCATION = { lat: 37.534, lng: 126.9948 };

/** 전화번호 자동 하이픈 포맷 — 숫자만 입력하면 XXX-XXXX-XXXX 형식으로 변환 */
export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

/** 사업자등록번호 자동 하이픈 포맷 — 숫자만 입력하면 000-00-00000 형식으로 변환 */
export function formatBizRegNo(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

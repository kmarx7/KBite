import "server-only";

/**
 * 국세청 사업자등록 상태조회 (공공데이터포털 api.odcloud.kr).
 * NTS_API_KEY 미설정 시 검증 생략(통과) — 키는 data.go.kr에서 무료 발급.
 * API 장애도 등록을 막지 않는다 (skip) — 진위확인은 강화 장치이지 차단 장치가 아님.
 */
export type BizStatus = "valid" | "closed" | "unregistered" | "skip";

interface NtsStatusItem {
  b_stt_cd?: string; // 01 계속사업자, 02 휴업자, 03 폐업자
  tax_type?: string;
}

export async function verifyBizRegNo(bizRegNo: string): Promise<BizStatus> {
  const key = process.env.NTS_API_KEY;
  if (!key) return "skip";

  const bNo = bizRegNo.replace(/-/g, "");
  if (!/^\d{10}$/.test(bNo)) return "unregistered";

  try {
    const res = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ b_no: [bNo] }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return "skip";

    const data = (await res.json()) as { data?: NtsStatusItem[] };
    const item = data.data?.[0];
    if (!item) return "skip";

    /* 계속(01)·휴업(02) 허용, 폐업(03) 거부 */
    if (item.b_stt_cd === "01" || item.b_stt_cd === "02") return "valid";
    if (item.b_stt_cd === "03") return "closed";
    /* 상태코드 없음 = 국세청 미등록 번호 */
    return "unregistered";
  } catch {
    return "skip";
  }
}

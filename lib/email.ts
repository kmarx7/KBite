import "server-only";
import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/* 실서비스 전 필수: Resend에 도메인 인증 후 EMAIL_FROM 설정.
   기본값(resend.dev 샌드박스)은 Resend 계정 소유자에게만 발송됨 */
const FROM = process.env.EMAIL_FROM ?? "KBite <onboarding@resend.dev>";

const PLAN_LABELS: Record<"basic" | "premium", string> = {
  basic: "베이직",
  premium: "프리미엄",
};

export async function sendRegistrationConfirmation(params: {
  to: string;
  restaurantName: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `[KBite] "${params.restaurantName}" 등록 신청이 접수되었습니다`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#FF6B35;margin-bottom:4px;">등록 신청 접수 완료</h2>
        <p style="color:#8A6040;margin-top:0;margin-bottom:24px;">${params.restaurantName}</p>
        <p style="color:#1A0800;"><strong>${params.restaurantName}</strong>의 등록 신청이 접수되었습니다.</p>
        <p style="color:#1A0800;">영업일 기준 2일 이내에 검토 후 결과를 이메일로 안내드립니다.</p>
        <p style="color:#8A6040;font-size:13px;margin-top:16px;">추가 서류가 필요한 경우 별도 연락드릴 수 있습니다.</p>
        <hr style="border:none;border-top:1px solid #F0E6D6;margin:24px 0;" />
        <p style="color:#C0A080;font-size:12px;margin:0;">KBite — Find Your Home Food in Korea</p>
      </div>
    `,
  });
}

export async function sendApprovalNotification(params: {
  to: string;
  restaurantName: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `[KBite] "${params.restaurantName}" 등록이 승인되었습니다`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#FF6B35;margin-bottom:4px;">등록 승인 완료 🎉</h2>
        <p style="color:#8A6040;margin-top:0;margin-bottom:24px;">${params.restaurantName}</p>
        <p style="color:#1A0800;"><strong>${params.restaurantName}</strong>이(가) KBite에 정상 등록되었습니다. 이제 KBite 앱에서 사용자들에게 노출됩니다.</p>
        <p style="color:#1A0800;margin-top:16px;"><strong>사장님이신가요?</strong> 이 이메일 주소로 파트너 센터에 가입하시면 식당 정보 수정, 리뷰 답글, 통계를 직접 관리할 수 있습니다.</p>
        <ol style="color:#8A6040;font-size:13px;padding-left:20px;">
          <li>아래 버튼으로 파트너 센터 접속</li>
          <li><strong>이 메일을 받은 이메일 주소로</strong> 가입</li>
          <li>로그인하면 "${params.restaurantName}" 연결 버튼이 자동으로 표시됩니다</li>
        </ol>
        <a href="https://kbite.vercel.app/partner" style="display:inline-block;background:#FF6B35;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;margin-top:8px;">파트너 센터에서 내 식당 관리하기</a>
      </div>
    `,
  });
}

export async function sendRejectionNotification(params: {
  to: string;
  restaurantName: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `[KBite] "${params.restaurantName}" 등록 검토 결과 안내`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1A0800;margin-bottom:4px;">등록 검토 결과 안내</h2>
        <p style="color:#8A6040;margin-top:0;margin-bottom:24px;">${params.restaurantName}</p>
        <p style="color:#1A0800;">신청하신 <strong>${params.restaurantName}</strong>이(가) 검토 기준에 맞지 않아 이번 등록이 보류되었습니다.</p>
        <p style="color:#8A6040;">내용을 수정하여 다시 신청하거나, 문의사항은 파트너 대시보드를 통해 연락해 주세요.</p>
        <a href="https://kbite.vercel.app/partner" style="display:inline-block;background:#FF6B35;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;margin-top:16px;">파트너 대시보드 바로가기</a>
      </div>
    `,
  });
}

export async function sendPaymentReceipt(params: {
  to: string;
  restaurantName: string;
  plan: "basic" | "premium";
  amount: number;
  nextBillingDate: Date;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { to, restaurantName, plan, amount, nextBillingDate } = params;
  const planLabel = PLAN_LABELS[plan];
  const nextDateStr = nextBillingDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await resend.emails.send({
    from: FROM,
    to,
    subject: `[KBite] ${planLabel} 플랜 결제가 완료되었습니다`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1A0800;margin-bottom:4px;">결제 완료</h2>
        <p style="color:#8A6040;margin-top:0;margin-bottom:24px;">${restaurantName}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F0E6D6;color:#8A6040;">플랜</td>
            <td style="padding:10px 0;border-bottom:1px solid #F0E6D6;text-align:right;font-weight:700;color:#1A0800;">KBite ${planLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F0E6D6;color:#8A6040;">결제 금액</td>
            <td style="padding:10px 0;border-bottom:1px solid #F0E6D6;text-align:right;font-weight:700;color:#1A0800;">₩${amount.toLocaleString()}/월</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#8A6040;">다음 결제일</td>
            <td style="padding:10px 0;text-align:right;color:#1A0800;">${nextDateStr}</td>
          </tr>
        </table>
        <a href="https://kbite.vercel.app/partner" style="display:inline-block;background:#FF6B35;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;">파트너 대시보드 바로가기</a>
        <p style="color:#8A6040;font-size:12px;margin-top:24px;">구독을 취소하려면 파트너 대시보드 → 구독 관리에서 언제든 취소할 수 있습니다.</p>
      </div>
    `,
  });
}

export async function sendRenewalReminder(params: {
  to: string;
  restaurantName: string;
  plan: "basic" | "premium";
  amount: number;
  renewalDate: Date;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { to, restaurantName, plan, amount, renewalDate } = params;
  const planLabel = PLAN_LABELS[plan];
  const renewalDateStr = renewalDate.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await resend.emails.send({
    from: FROM,
    to,
    subject: `[KBite] 7일 후 ${planLabel} 플랜이 자동 갱신됩니다`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#1A0800;margin-bottom:4px;">구독 갱신 예정 안내</h2>
        <p style="color:#8A6040;margin-top:0;margin-bottom:24px;">${restaurantName}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F0E6D6;color:#8A6040;">플랜</td>
            <td style="padding:10px 0;border-bottom:1px solid #F0E6D6;text-align:right;font-weight:700;color:#1A0800;">KBite ${planLabel}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #F0E6D6;color:#8A6040;">갱신 예정일</td>
            <td style="padding:10px 0;border-bottom:1px solid #F0E6D6;text-align:right;color:#1A0800;">${renewalDateStr}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#8A6040;">갱신 금액</td>
            <td style="padding:10px 0;text-align:right;font-weight:700;color:#1A0800;">₩${amount.toLocaleString()}</td>
          </tr>
        </table>
        <p style="color:#8A6040;font-size:13px;">등록된 카드로 자동 결제됩니다. 갱신을 원하지 않으시면 갱신일 전에 구독을 취소해 주세요.</p>
        <a href="https://kbite.vercel.app/partner" style="display:inline-block;background:#FF6B35;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;">구독 관리 바로가기</a>
      </div>
    `,
  });
}

/* ───────────── 예약 요청 (비실시간) ───────────── */

export interface ReservationEmailInfo {
  restaurantName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number;
  note?: string | null;
  guestEmail: string;
}

/** 사장님에게 — 한국어, 로그인 없이 응답 가능한 수락/거절 링크 포함 */
export async function sendReservationRequestToOwner(params: {
  to: string;
  info: ReservationEmailInfo;
  confirmUrl: string;
  declineUrl: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const { info } = params;

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `[KBite] 예약 요청 — ${info.date} ${info.time} ${info.partySize}명 (${info.restaurantName})`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#FF6B35;margin-bottom:4px;">새 예약 요청</h2>
        <p style="color:#8A6040;margin-top:0;margin-bottom:24px;">${info.restaurantName}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #F0E6D6;color:#8A6040;">날짜</td>
              <td style="padding:8px 0;border-bottom:1px solid #F0E6D6;text-align:right;font-weight:700;color:#1A0800;">${info.date}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #F0E6D6;color:#8A6040;">시간</td>
              <td style="padding:8px 0;border-bottom:1px solid #F0E6D6;text-align:right;font-weight:700;color:#1A0800;">${info.time}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #F0E6D6;color:#8A6040;">인원</td>
              <td style="padding:8px 0;border-bottom:1px solid #F0E6D6;text-align:right;font-weight:700;color:#1A0800;">${info.partySize}명</td></tr>
          ${info.note ? `<tr><td style="padding:8px 0;color:#8A6040;">요청사항</td><td style="padding:8px 0;text-align:right;color:#1A0800;">${info.note.replace(/</g, "&lt;")}</td></tr>` : ""}
        </table>
        <p style="color:#1A0800;">아래 버튼으로 바로 응답할 수 있습니다 (로그인 불필요):</p>
        <p>
          <a href="${params.confirmUrl}" style="display:inline-block;background:#15803D;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;margin-right:8px;">예약 수락</a>
          <a href="${params.declineUrl}" style="display:inline-block;background:#B91C1C;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;">거절</a>
        </p>
        <p style="color:#8A6040;font-size:12px;margin-top:16px;">손님 연락처: ${params.info.guestEmail} — 응답하면 손님에게 자동으로 이메일이 발송됩니다.</p>
      </div>
    `,
  });
}

/** 손님에게 — 결과 통지 (영어+한국어 병기) */
export async function sendReservationResultToGuest(params: {
  to: string;
  restaurantName: string;
  date: string;
  time: string;
  partySize: number;
  confirmed: boolean;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;
  const { restaurantName, date, time, partySize, confirmed } = params;

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: confirmed
      ? `[KBite] Reservation confirmed — ${restaurantName} (${date} ${time})`
      : `[KBite] Reservation declined — ${restaurantName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:${confirmed ? "#15803D" : "#B91C1C"};margin-bottom:4px;">
          ${confirmed ? "Reservation confirmed ✓" : "Reservation declined"}
        </h2>
        <p style="color:#8A6040;margin-top:0;margin-bottom:24px;">${restaurantName}</p>
        <p style="color:#1A0800;">
          ${confirmed
            ? `Your reservation for <strong>${partySize}</strong> on <strong>${date} ${time}</strong> has been confirmed by the restaurant.`
            : `Unfortunately the restaurant could not accept your reservation for ${date} ${time}. Please try a different time or restaurant.`}
        </p>
        <p style="color:#8A6040;font-size:13px;">
          ${confirmed
            ? `${date} ${time} ${partySize}명 예약이 확정되었습니다.`
            : `${date} ${time} 예약이 수락되지 않았습니다. 다른 시간이나 식당을 이용해 주세요.`}
        </p>
        <a href="https://kbite.vercel.app" style="display:inline-block;background:#FF6B35;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;margin-top:16px;">KBite 열기</a>
      </div>
    `,
  });
}

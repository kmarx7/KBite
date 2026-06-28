import "server-only";
import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = "KBite <onboarding@resend.dev>";

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
        <a href="https://kbite.vercel.app/partner" style="display:inline-block;background:#FF6B35;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;margin-top:16px;">파트너 대시보드 바로가기</a>
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

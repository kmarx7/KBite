import "server-only";
import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = "KBite <noreply@kbite.kr>";

const PLAN_LABELS: Record<"basic" | "premium", string> = {
  basic: "베이직",
  premium: "프리미엄",
};

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

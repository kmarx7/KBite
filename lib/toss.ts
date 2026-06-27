import "server-only";

const BASE = "https://api.tosspayments.com/v1";

function authHeader(): string {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) throw new Error("TOSS_SECRET_KEY not configured");
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

export async function issueBillingKey(
  authKey: string,
  customerKey: string,
): Promise<string> {
  const res = await fetch(`${BASE}/billing/authorizations/${authKey}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customerKey }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "빌링키 발급 실패");
  }
  const data = (await res.json()) as { billingKey: string };
  return data.billingKey;
}

export interface TossCharge {
  paymentKey: string;
  orderId: string;
  status: string;
}

interface ChargeParams {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
  customerEmail: string;
  customerName: string;
}

export async function chargeBillingKey(
  params: ChargeParams,
): Promise<TossCharge> {
  const res = await fetch(`${BASE}/billing/${params.billingKey}`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerKey: params.customerKey,
      amount: params.amount,
      orderId: params.orderId,
      orderName: params.orderName,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? "결제 실패");
  }
  return res.json() as Promise<TossCharge>;
}

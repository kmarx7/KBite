/**
 * 약관·정책 문서 — ko/en 제공, 나머지 언어는 en 폴백.
 * 시행일 기준으로 운영자 검토·법률 자문 후 갱신할 것.
 */

export type PolicySlug = "terms" | "privacy" | "partner" | "refund";

export interface PolicyDoc {
  title: string;
  effectiveDate: string;
  sections: { heading: string; body: string }[];
}

type PolicyContent = Record<PolicySlug, { ko: PolicyDoc; en: PolicyDoc }>;

const CONTACT_EMAIL = "marx21c@gmail.com";

export const POLICIES: PolicyContent = {
  terms: {
    ko: {
      title: "이용약관",
      effectiveDate: "2026-06-11",
      sections: [
        {
          heading: "제1조 (목적)",
          body: "이 약관은 KBite(이하 \"서비스\")가 제공하는 위치 기반 식당 탐색 서비스의 이용 조건과 운영자·이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.",
        },
        {
          heading: "제2조 (정의)",
          body: "\"이용자\"란 본 약관에 따라 서비스를 이용하는 자를 말합니다. \"파트너\"란 서비스에 식당 정보를 등록한 사업자를 말합니다. \"콘텐츠\"란 서비스 내 게시된 식당 정보, 리뷰, 사진 등을 말합니다.",
        },
        {
          heading: "제3조 (약관의 효력 및 변경)",
          body: "본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 운영자는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행일 7일 전(이용자에게 불리한 변경은 30일 전)부터 공지합니다.",
        },
        {
          heading: "제4조 (서비스의 내용)",
          body: "서비스는 이용자의 위치 또는 선택한 지역을 기준으로 식당 정보를 검색·열람할 수 있는 기능을 제공합니다. 위치 정보는 이용자 기기에서 거리 계산에만 사용되며 서버에 저장되지 않습니다. 예약·길찾기 등 외부 링크는 해당 외부 서비스의 약관을 따릅니다.",
        },
        {
          heading: "제5조 (이용자의 의무)",
          body: "이용자는 타인의 정보 도용, 허위 정보 등록, 서비스 운영 방해, 관련 법령 위반 행위를 해서는 안 됩니다. 리뷰 등 콘텐츠 작성 시 사실에 기반해야 하며 타인의 권리를 침해하지 않아야 합니다.",
        },
        {
          heading: "제6조 (콘텐츠의 권리와 책임)",
          body: "이용자가 작성한 콘텐츠의 저작권은 작성자에게 있으며, 이용자는 서비스 운영·홍보 목적의 사용 권한을 운영자에게 무상으로 부여합니다. 법령 또는 약관을 위반한 콘텐츠는 사전 통지 없이 삭제될 수 있습니다.",
        },
        {
          heading: "제7조 (면책)",
          body: "운영자는 파트너가 등록한 정보(영업시간, 가격, 인증 여부 등)의 정확성을 보증하지 않으며, 이용자와 식당 간에 발생한 거래·분쟁에 대해 관련 법령에서 정한 경우를 제외하고 책임을 지지 않습니다. 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해서도 같습니다.",
        },
        {
          heading: "제8조 (서비스의 변경 및 중단)",
          body: "운영자는 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 중대한 변경은 사전에 공지합니다.",
        },
        {
          heading: "제9조 (준거법 및 관할)",
          body: "본 약관은 대한민국 법령에 따라 해석되며, 분쟁은 민사소송법상 관할 법원에 제기합니다. 문의: " + CONTACT_EMAIL,
        },
      ],
    },
    en: {
      title: "Terms of Service",
      effectiveDate: "2026-06-11",
      sections: [
        {
          heading: "1. Purpose",
          body: "These Terms govern your use of KBite (the \"Service\"), a location-based restaurant discovery service, and set out the rights and obligations of the operator and users.",
        },
        {
          heading: "2. Definitions",
          body: "\"User\" means anyone who uses the Service under these Terms. \"Partner\" means a business that has listed a restaurant on the Service. \"Content\" means restaurant information, reviews, photos and other materials posted on the Service.",
        },
        {
          heading: "3. Effect and Amendment of Terms",
          body: "These Terms take effect upon posting in the Service. The operator may amend them within the bounds of applicable law, giving at least 7 days' notice (30 days for changes unfavorable to users).",
        },
        {
          heading: "4. The Service",
          body: "The Service lets you search and browse restaurant information based on your location or a selected area. Your device location is used only on your device to calculate distances and is not stored on our servers. External links such as reservations and directions are governed by the respective external services' terms.",
        },
        {
          heading: "5. User Obligations",
          body: "Users must not impersonate others, register false information, interfere with the operation of the Service, or violate applicable laws. Reviews and other content must be based on facts and must not infringe the rights of others.",
        },
        {
          heading: "6. Content Rights and Responsibility",
          body: "Users retain copyright in content they create and grant the operator a free license to use it for operating and promoting the Service. Content that violates the law or these Terms may be removed without prior notice.",
        },
        {
          heading: "7. Disclaimer",
          body: "The operator does not guarantee the accuracy of information registered by Partners (opening hours, prices, certifications, etc.) and is not liable for transactions or disputes between users and restaurants except as required by law, nor for interruptions caused by force majeure or system failures.",
        },
        {
          heading: "8. Changes to the Service",
          body: "The operator may change or discontinue all or part of the Service. Material changes will be announced in advance.",
        },
        {
          heading: "9. Governing Law",
          body: "These Terms are governed by the laws of the Republic of Korea. Contact: " + CONTACT_EMAIL,
        },
      ],
    },
  },

  privacy: {
    ko: {
      title: "개인정보처리방침",
      effectiveDate: "2026-06-11",
      sections: [
        {
          heading: "1. 수집하는 개인정보",
          body: "파트너(식당 등록): 식당명, 대표 이메일, 전화번호, 주소, 사업자등록번호. 이용자(계정 생성 시): 이메일, 국적(선택), 선호 언어. 자동 수집: 언어 설정 쿠키, 서비스 이용 기록(익명화된 분석 이벤트). 기기 위치 정보는 기기 내 거리 계산에만 사용되며 서버로 전송·저장되지 않습니다.",
        },
        {
          heading: "2. 수집·이용 목적",
          body: "식당 등록 검수 및 운영, 서비스 제공·개선, 다국어 설정 유지, 부정 이용 방지, 법령상 의무 이행.",
        },
        {
          heading: "3. 보유 및 이용 기간",
          body: "회원 탈퇴 또는 등록 삭제 시 지체 없이 파기합니다. 단, 전자상거래법 등 관련 법령에 따라 보존 의무가 있는 정보는 해당 기간 동안 보관합니다.",
        },
        {
          heading: "4. 제3자 제공",
          body: "이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 법령에 근거한 요청이 있는 경우는 예외로 합니다.",
        },
        {
          heading: "5. 처리 위탁 및 국외 이전",
          body: "서비스 운영을 위해 다음 업체에 처리를 위탁하며 일부 데이터는 국외 서버에 저장됩니다 — Supabase(데이터베이스·스토리지, 미국), Vercel(호스팅·트래픽 분석, 미국), Kakao(지도 표시, 한국), PostHog(이용 행태 분석, 미국·키 설정 시). 각 수탁사는 관련 법령에 따른 보호 조치를 적용합니다.",
        },
        {
          heading: "6. 정보주체의 권리",
          body: "이용자는 언제든지 본인 정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 요청은 아래 연락처로 접수하며 지체 없이 조치합니다. EU 거주자는 GDPR에 따른 권리(데이터 이동권 등)를 동일하게 행사할 수 있습니다.",
        },
        {
          heading: "7. 안전성 확보 조치",
          body: "전송 구간 암호화(HTTPS), 데이터베이스 행 단위 접근 제어(RLS), 관리자 인증, 최소 권한 원칙을 적용합니다. 결제 정보는 도입 시 PG사가 처리하며 카드 정보를 직접 저장하지 않습니다.",
        },
        {
          heading: "8. 쿠키",
          body: "언어 설정 유지를 위한 필수 쿠키를 사용합니다. 분석 도구 사용 시 브라우저의 추적 거부(DNT) 설정을 존중합니다.",
        },
        {
          heading: "9. 개인정보 보호책임자",
          body: "문의·요청: " + CONTACT_EMAIL + ". 본 방침이 변경되는 경우 시행 7일 전 서비스 내 공지합니다.",
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      effectiveDate: "2026-06-11",
      sections: [
        {
          heading: "1. Information We Collect",
          body: "Partners (restaurant listing): restaurant name, owner email, phone, address, business registration number. Users (when creating an account): email, nationality (optional), preferred language. Automatically: a language preference cookie and anonymized usage analytics. Device location is used only on your device to calculate distances and is never sent to or stored on our servers.",
        },
        {
          heading: "2. Purposes",
          body: "Reviewing and operating restaurant listings, providing and improving the Service, remembering language settings, preventing abuse, and meeting legal obligations.",
        },
        {
          heading: "3. Retention",
          body: "Data is deleted without delay upon account deletion or listing removal, except where retention is required by applicable laws (e.g., e-commerce regulations), in which case it is kept for the legally required period.",
        },
        {
          heading: "4. Third-Party Disclosure",
          body: "We do not provide personal data to third parties without consent, except where required by law.",
        },
        {
          heading: "5. Processors and International Transfer",
          body: "We use the following processors, and some data is stored on servers outside Korea — Supabase (database/storage, US), Vercel (hosting/analytics, US), Kakao (maps, Korea), PostHog (product analytics, US, when enabled). Each processor applies safeguards required by applicable law.",
        },
        {
          heading: "6. Your Rights",
          body: "You may request access, correction, deletion, or restriction of your data at any time using the contact below. EU residents may exercise GDPR rights including data portability.",
        },
        {
          heading: "7. Security",
          body: "We apply HTTPS encryption in transit, database row-level security, admin authentication, and the principle of least privilege. When payments launch, card data will be handled by a licensed payment provider and never stored by us.",
        },
        {
          heading: "8. Cookies",
          body: "We use an essential cookie to remember your language. Our analytics respect your browser's Do-Not-Track setting.",
        },
        {
          heading: "9. Contact",
          body: "Privacy inquiries: " + CONTACT_EMAIL + ". Changes to this policy will be announced in the Service 7 days before taking effect.",
        },
      ],
    },
  },

  partner: {
    ko: {
      title: "파트너(식당) 약관",
      effectiveDate: "2026-06-11",
      sections: [
        {
          heading: "1. 등록 자격",
          body: "대한민국에서 적법하게 영업 중인 식음료 사업자만 등록할 수 있으며, 등록 시 유효한 사업자등록번호를 제출해야 합니다.",
        },
        {
          heading: "2. 정보의 정확성",
          body: "파트너는 등록 정보(영업시간, 가격, 메뉴, 연락처 등)를 정확하게 유지할 책임이 있습니다. 변경 사항은 지체 없이 갱신해야 합니다.",
        },
        {
          heading: "3. 인증 표시",
          body: "할랄, 비건, 코셔, 글루텐프리 등 인증 표시는 증빙 가능한 경우에만 사용해야 합니다. 허위 인증 표시는 즉시 삭제 및 등록 해지 사유가 되며, 이로 인한 법적 책임은 파트너에게 있습니다.",
        },
        {
          heading: "4. 승인 및 게시",
          body: "등록 신청은 운영자 검수 후 게시됩니다. 운영자는 부정확하거나 부적절한 등록을 거절·삭제할 수 있습니다.",
        },
        {
          heading: "5. 콘텐츠 라이선스",
          body: "파트너가 제공한 사진·텍스트는 서비스 내 표시 및 홍보 목적으로 사용할 수 있는 권한을 운영자에게 부여합니다. 파트너는 해당 콘텐츠에 대한 적법한 권리를 보유해야 합니다.",
        },
        {
          heading: "6. 플랜",
          body: "기본 등록은 무료입니다. 유료 플랜(사진 추가, 메뉴 등록, 통계 등)이 도입되는 경우 별도 고지하며, 가입은 선택 사항입니다.",
        },
        {
          heading: "7. 해지",
          body: "파트너는 언제든지 등록 삭제를 요청할 수 있습니다. 요청: " + CONTACT_EMAIL,
        },
      ],
    },
    en: {
      title: "Partner (Restaurant) Terms",
      effectiveDate: "2026-06-11",
      sections: [
        {
          heading: "1. Eligibility",
          body: "Only food & beverage businesses lawfully operating in Korea may register, and a valid business registration number is required.",
        },
        {
          heading: "2. Accuracy",
          body: "Partners are responsible for keeping their listing (hours, prices, menu, contact, etc.) accurate and up to date.",
        },
        {
          heading: "3. Certifications",
          body: "Halal, vegan, kosher, gluten-free and similar badges may be used only when verifiable. False certification claims result in immediate removal and termination, and the Partner bears any legal liability arising from them.",
        },
        {
          heading: "4. Review and Publication",
          body: "Listings are published after review by the operator, who may reject or remove inaccurate or inappropriate listings.",
        },
        {
          heading: "5. Content License",
          body: "Partners grant the operator a license to display and promote submitted photos and text within the Service, and must hold lawful rights to that content.",
        },
        {
          heading: "6. Plans",
          body: "Basic listing is free. If paid plans (extra photos, menus, analytics, etc.) are introduced, they will be announced separately and remain optional.",
        },
        {
          heading: "7. Termination",
          body: "Partners may request removal of their listing at any time: " + CONTACT_EMAIL,
        },
      ],
    },
  },

  refund: {
    ko: {
      title: "환불 정책",
      effectiveDate: "2026-06-11",
      sections: [
        {
          heading: "1. 현재 서비스",
          body: "현재 KBite의 모든 기능(식당 탐색, 등록)은 무료이며 결제가 발생하지 않습니다. 본 정책은 향후 유료 기능 도입에 대비해 미리 안내하는 것입니다.",
        },
        {
          heading: "2. 유료 구독 (도입 시)",
          body: "월 구독 결제 후 7일 이내에 유료 기능을 사용하지 않은 경우 전액 환불됩니다. 그 외 중도 해지 시 환불 없이 현재 결제 주기 종료일까지 혜택이 유지되고 자동 갱신이 중단됩니다.",
        },
        {
          heading: "3. 오결제·중복 결제",
          body: "시스템 오류로 인한 오결제·중복 결제는 확인 즉시 전액 환불합니다.",
        },
        {
          heading: "4. 처리 기간",
          body: "환불은 요청 접수 후 영업일 기준 3~5일 내에 결제 수단으로 처리되며, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령을 따릅니다.",
        },
        {
          heading: "5. 문의",
          body: "환불 요청 및 문의: " + CONTACT_EMAIL,
        },
      ],
    },
    en: {
      title: "Refund Policy",
      effectiveDate: "2026-06-11",
      sections: [
        {
          heading: "1. Current Service",
          body: "All KBite features (discovery, listing) are currently free and no payments occur. This policy is provided in advance of future paid features.",
        },
        {
          heading: "2. Paid Subscriptions (when introduced)",
          body: "A full refund is available within 7 days of a monthly subscription payment if paid features have not been used. Otherwise, cancelling mid-cycle stops auto-renewal and benefits continue until the end of the current billing period without a refund.",
        },
        {
          heading: "3. Erroneous or Duplicate Charges",
          body: "Charges caused by system errors or duplication are fully refunded as soon as confirmed.",
        },
        {
          heading: "4. Processing Time",
          body: "Refunds are processed to the original payment method within 3–5 business days of the request, in accordance with applicable consumer protection laws of Korea.",
        },
        {
          heading: "5. Contact",
          body: "Refund requests and inquiries: " + CONTACT_EMAIL,
        },
      ],
    },
  },
};

export const POLICY_SLUGS: PolicySlug[] = [
  "terms",
  "privacy",
  "partner",
  "refund",
];

export function isPolicySlug(value: string): value is PolicySlug {
  return (POLICY_SLUGS as string[]).includes(value);
}

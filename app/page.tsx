import { getTranslations } from "next-intl/server";

/* 임시 홈 — 작업 6에서 지도 + 카드 리스트 메인 화면으로 교체 예정 */
export default async function Home() {
  const t = await getTranslations("common");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
      <h1 className="text-xl font-extrabold text-[#FF6B35]">{t("appName")}</h1>
      <p className="text-sm text-text-secondary">{t("slogan")}</p>
    </main>
  );
}

import { getTranslations } from "next-intl/server";
import { LANGUAGES, type Language } from "@/types";
import { LOCALES } from "@/lib/i18n/config";

export default async function LanguageAvailable({
  available,
}: {
  available: Language[];
}) {
  const t = await getTranslations("detail");

  return (
    <section className="px-4 py-3">
      <h2 className="mb-2 text-[15px] font-extrabold text-[#1A0800]">
        {t("languagesAvailable")}
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {LOCALES.map((code) => {
          const active = available.includes(code);
          return (
            <span
              key={code}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={
                active
                  ? {
                      backgroundColor: "#FFE8D6",
                      color: "#CC4400",
                      border: "1px solid #FFD4B8",
                    }
                  : {
                      backgroundColor: "#FFFFFF",
                      color: "#C0A080",
                      border: "1px solid #FFE8D6",
                      opacity: 0.6,
                    }
              }
            >
              <span aria-hidden>{LANGUAGES[code].flag}</span>
              {LANGUAGES[code].label}
            </span>
          );
        })}
      </div>
    </section>
  );
}

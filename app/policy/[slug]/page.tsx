import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { IconChevronLeft } from "@tabler/icons-react";
import {
  POLICIES,
  POLICY_SLUGS,
  POLICY_LOCALES,
  isPolicySlug,
  type SupportedPolicyLocale,
} from "@/lib/policies/content";

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPolicySlug(slug)) return {};
  const locale = await getLocale();
  const lang = (POLICY_LOCALES as string[]).includes(locale)
    ? (locale as SupportedPolicyLocale)
    : "en";
  const doc = POLICIES[slug][lang] ?? POLICIES[slug]["en"];
  return { title: `${doc.title} — KBite` };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPolicySlug(slug)) notFound();

  const locale = await getLocale();
  const lang = (POLICY_LOCALES as string[]).includes(locale)
    ? (locale as SupportedPolicyLocale)
    : "en";
  const doc = POLICIES[slug][lang] ?? POLICIES[slug]["en"];

  return (
    <div className="min-h-dvh bg-[#FFFAF5]">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5]/95 px-3 py-2 backdrop-blur">
        <Link href="/" aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <span className="text-[15px] font-black text-[#FF6B35]">KBite</span>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">
        <h1 className="text-[20px] font-extrabold text-[#1A0800]">
          {doc.title}
        </h1>
        <p className="mb-6 mt-1 text-[11px] font-semibold text-[#B07040]">
          {doc.effectiveDate}
        </p>
        {doc.sections.map((section) => (
          <section key={section.heading} className="mb-5">
            <h2 className="mb-1 text-[14px] font-extrabold text-[#1A0800]">
              {section.heading}
            </h2>
            <p className="text-[13px] leading-relaxed text-[#8A6040]">
              {section.body}
            </p>
          </section>
        ))}
      </main>
    </div>
  );
}

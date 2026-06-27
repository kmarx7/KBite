import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { IconChevronLeft } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import type { Certification, Language, MenuItemRow, Plan, PriceCurrency } from "@/types";
import EditForm, {
  type EditableRestaurant,
} from "@/components/partner/EditForm";
import MenuManager from "@/components/partner/MenuManager";

export const dynamic = "force-dynamic";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/partner/login");

  /* RLS owner_read — 본인 식당이 아니면 빈 결과 */
  const { data } = await supabase
    .from("restaurants")
    .select(
      "id, name, phone, address, opening_time, closing_time, price_range, price_currency, price_min, price_max, description, certifications, languages, booking_url, sns_url, photo_url, plan",
    )
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!data) notFound();

  const { data: menuRows } = await supabase
    .from("menu_items")
    .select("id, name, description, price, emoji")
    .eq("restaurant_id", id)
    .order("sort_order")
    .order("created_at");
  const menuItems: MenuItemRow[] = (menuRows ?? []).map((m) => ({
    id: m.id as string,
    name: m.name as string,
    description: (m.description as string | null) ?? "",
    price: m.price as number,
    emoji: (m.emoji as string | null) ?? "🍽️",
  }));

  const t = await getTranslations("partner");

  const restaurant: EditableRestaurant = {
    id: data.id as string,
    name: (data.name as string) ?? "",
    phone: (data.phone as string | null) ?? "",
    address: (data.address as string) ?? "",
    openingTime: (data.opening_time as string | null)?.slice(0, 5) ?? null,
    closingTime: (data.closing_time as string | null)?.slice(0, 5) ?? null,
    priceCurrency: ((data.price_currency as PriceCurrency | null) ?? "KRW"),
    priceMin: (data.price_min as number | null) ?? null,
    priceMax: (data.price_max as number | null) ?? null,
    about: (data.description as string | null) ?? "",
    certifications: (data.certifications as Certification[] | null) ?? [],
    languages: (data.languages as Language[] | null) ?? [],
    bookingUrl: (data.booking_url as string | null) ?? "",
    snsUrl: (data.sns_url as string | null) ?? "",
    photoUrl: (data.photo_url as string | null) ?? null,
    plan: ((data.plan as Plan | null) ?? "free"),
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-[#FFE8D6] bg-[#FFFAF5]/95 px-3 py-2 backdrop-blur">
        <Link href="/partner" aria-label="Back">
          <IconChevronLeft size={18} color="#8A6040" />
        </Link>
        <h1 className="text-[15px] font-extrabold text-[#1A0800]">
          {t("editTitle")}
        </h1>
      </header>
      <EditForm restaurant={restaurant} />
      <div className="mx-auto w-full max-w-2xl px-4 pb-8">
        <h2 className="mb-3 text-[15px] font-extrabold text-[#1A0800]">
          {t("menuSection")}
        </h2>
        <MenuManager
          restaurantId={id}
          plan={restaurant.plan}
          initialItems={menuItems}
        />
      </div>
    </div>
  );
}

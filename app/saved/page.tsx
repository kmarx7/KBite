import { getApprovedRestaurants } from "@/lib/api/restaurants";
import SavedScreen from "@/components/home/SavedScreen";

export default async function SavedPage() {
  const restaurants = await getApprovedRestaurants();
  return <SavedScreen restaurants={restaurants} />;
}

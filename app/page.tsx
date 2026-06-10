import { getApprovedRestaurants } from "@/lib/api/restaurants";
import ExploreScreen from "@/components/home/ExploreScreen";

export default async function Home() {
  const restaurants = await getApprovedRestaurants();
  return <ExploreScreen restaurants={restaurants} />;
}

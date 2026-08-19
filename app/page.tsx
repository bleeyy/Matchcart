import HomeClient from "@/components/dashboard/HomeClient";
import { getPrices } from "@/lib/data/getPrices";

export default async function Page() {
  const prices = await getPrices();

  return (
    <HomeClient
      prices={prices}
    />
  );
}
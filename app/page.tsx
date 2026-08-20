import HomeClient from "@/components/dashboard/HomeClient";
import { getCurrentPrices } from "@/lib/data/priceRepository";

export default async function Page() {
  const prices = await getCurrentPrices();

  return (
    <HomeClient
      prices={prices}
    />
  );
}
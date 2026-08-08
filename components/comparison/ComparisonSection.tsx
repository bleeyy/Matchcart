import PriceMatrix from "@/components/comparison/PriceMatrix";
import { CartItem } from "@/types/cart";

type ComparisonSectionProps = {
  cart: CartItem[];
  selectedStoreIds: number[];
};

export default function ComparisonSection({
  cart,
  selectedStoreIds,
}: ComparisonSectionProps) {
  return (
    <section className="mt-6">
      <PriceMatrix cart={cart}
      selectedStoreIds={selectedStoreIds}
      />
    </section>
  );
}
import PriceMatrix from "@/components/comparison/PriceMatrix";
import { CartItem } from "@/types/cart";

type ComparisonSectionProps = {
  cart: CartItem[];
};

export default function ComparisonSection({
  cart,
}: ComparisonSectionProps) {
  return (
    <section className="mt-6">
      <h2 className="text-xl font-bold text-black mb-3">
        Price Comparison
      </h2>

      <PriceMatrix cart={cart} />
    </section>
  );
}
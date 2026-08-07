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
      <PriceMatrix cart={cart} />
    </section>
  );
}
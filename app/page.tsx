"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/types/cart";
import Header from "@/components/layout/Header";
import Cart from "@/components/cart/Cart";
import ProductSearch from "@/components/ProductSearch";
import PriceComparison from "@/components/comparison/PriceComparison";
import { calculateTotals } from "@/lib/comparison/calculateTotals";

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState("");
  const [highlightedItem, setHighlightedItem] = useState<number | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const removeItem = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleProductSelect = (product: {
    id: number;
    name: string;
  }) => {
    const existingItem = cart.find(
      (item) => item.productId === product.id
    );

    if (existingItem) {
      setToast(
        `${product.name} is already in your cart. Use the quantity arrows to adjust it.`
      );

      setHighlightedItem(existingItem.id);

      setTimeout(() => {
        setToast("");
        setHighlightedItem(null);
      }, 2000);

      return;
    }

    setCart((prevCart) => [
      ...prevCart,
      {
        id: Date.now(),
        productId: product.id,
        name: product.name,
        quantity: 1,
      },
    ]);
  };

  const increaseQuantity = (id: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? {
            ...item,
            quantity:
              item.quantity > 1
                ? item.quantity - 1
                : 1,
          }
          : item
      )
    );
  };

  const totals = calculateTotals(cart);

  return (
    <>
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    <main className="min-h-screen bg-gray-100 flex justify-center items-start pt-20">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <Header />
        <ProductSearch
          onSelect={handleProductSelect}
        />
        <Cart
          cart={cart}
          removeItem={removeItem}
          increaseQuantity={increaseQuantity}
          decreaseQuantity={decreaseQuantity}
          highlightedItem={highlightedItem}
        />
        <PriceComparison totals={totals} />
        </div>
      </main>
    </>
  );
}
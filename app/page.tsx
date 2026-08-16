"use client";

import { useCallback, useEffect, useState } from "react";
import { CartItem } from "@/types/cart";

import Header from "@/components/layout/Header";
import Cart from "@/components/cart/Cart";
import ProductSearch from "@/components/search/ProductSearch";

import { calculateTotals } from "@/lib/comparison/calculateTotals";

import StoreComparison from "@/components/comparison/StoreComparison";
import PriceMatrix from "@/components/comparison/PriceMatrix";
import CartSummary from "@/components/dashboard/CartSummary";

import StoreSetup from "@/components/setup/StoreSetup";

import StoreSettings from "@/components/setup/StoreSettings";
import { Settings } from "lucide-react";

import SplashScreen from "@/components/layout/SplashScreen";

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<number[]>([]);
  const [setupComplete, setSetupComplete] = useState(false);
  const [toast, setToast] = useState("");
  const [highlightedItem, setHighlightedItem] = useState<number | null>(null);
  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const finishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleStoreSetup = (storeIds: number[]) => {
    setSelectedStoreIds(storeIds);
    setSetupComplete(true);

    localStorage.setItem(
      "selectedStores",
      JSON.stringify(storeIds)
    );
  };

  const handleStoreSettingsSave = (storeIds: number[]) => {
    setSelectedStoreIds(storeIds);

    localStorage.setItem(
      "selectedStores",
      JSON.stringify(storeIds)
    );
  };
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const savedStores = localStorage.getItem("selectedStores");

    if (savedStores) {
      const parsedStores = JSON.parse(savedStores);

      setSelectedStoreIds(parsedStores);
      setSetupComplete(true);
    }
  }, []);

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

  const totals = calculateTotals(
    cart,
    selectedStoreIds
  );
  const cheapestStore = totals.length > 0 ? totals[0] : null;
  const mostExpensiveStore =
    totals.length > 0 ? totals[totals.length - 1] : null;

  const savings =
    cheapestStore && mostExpensiveStore
      ? mostExpensiveStore.total - cheapestStore.total
      : 0;

  if (!setupComplete) {
    return (
      <StoreSetup
        onComplete={handleStoreSetup}
      />
    );
  }
  return (
    <>
      <SplashScreen onFinish={finishSplash} />
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
      <main className="min-h-screen bg-[#DFDCCD] flex justify-center">
        <div className="w-full max-w-lg px-4 py-6 sm:px-6">
          <Header />
          <ProductSearch
            onSelect={handleProductSelect}
          />
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowStoreSettings(true)}
              className="flex items-center gap-2 text-sm font-semibold text-[#3B4954] hover:text-[#191F24]"
            >
              <Settings size={17} />
              Edit Stores
            </button>
          </div>
          <Cart
            cart={cart}
            removeItem={removeItem}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
            highlightedItem={highlightedItem}
          />
          {cart.length > 0 && cheapestStore && mostExpensiveStore && (
            <CartSummary
              store={cheapestStore.storeName}
              total={cheapestStore.total}
              savings={savings}
              comparedTo={mostExpensiveStore.storeName}
              itemCount={cart.length}
            />
          )}
          {cart.length > 0 && (
            <StoreComparison storeTotals={totals} />
          )}
          {cart.length > 0 && (
            <PriceMatrix cart={cart}
              selectedStoreIds={selectedStoreIds}
            />
          )}
        </div>
        {showStoreSettings && (
          <StoreSettings
            selectedStoreIds={selectedStoreIds}
            onSave={handleStoreSettingsSave}
            onClose={() => setShowStoreSettings(false)}
          />
        )}
      </main>
    </>
  );
}
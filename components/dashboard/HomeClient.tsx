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
import { Check, Settings } from "lucide-react";

import SplashScreen from "@/components/layout/SplashScreen";

import type { MatchCartPrice } from "@/lib/data/priceRepository";

type HomeClientProps = {
  prices: MatchCartPrice[];
};

export default function HomeClient({ prices }: HomeClientProps) {
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
            setTimeout(() => setCart(JSON.parse(savedCart)), 0);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const savedStores = localStorage.getItem("selectedStores");

        if (savedStores) {
            const parsedStores = JSON.parse(savedStores);

            setTimeout(() => {
                setSelectedStoreIds(parsedStores);
                setSetupComplete(true);
            }, 0);
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

        setToast(`Nice pick. ${product.name} added.`);
        setTimeout(() => setToast(""), 1600);
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

    const hasLivePrices = prices.some(
        (price) => price.source !== "seed"
    );

    const totals = calculateTotals(
        cart,
        selectedStoreIds,
        prices
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
            {showSplash && <SplashScreen onFinish={finishSplash} />}
            {toast && (
                <div
                    role="status"
                    className="toast-pop fixed top-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#243239] px-5 py-3 text-sm font-bold text-[#fffdf8] shadow-lg"
                >
                    <Check size={16} className="text-[#b8c8a4]" />
                    <span>{toast}</span>
                </div>
            )}
            <main className="flex min-h-screen justify-center px-4 sm:px-6">
                <div className="w-full max-w-xl py-6 sm:py-10">
                    <Header />
                    <ProductSearch
                        onSelect={handleProductSelect}
                    />
                    <div className="mb-5 flex justify-end">
                        <button
                            onClick={() => setShowStoreSettings(true)}
                            className="flex items-center gap-2 text-sm font-bold text-[#68736f] transition hover:text-[#d75e55]"
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
                            dataStatus={hasLivePrices ? "live" : "sample"}
                        />
                    )}
                    {cart.length > 0 && (
                        <StoreComparison storeTotals={totals} />
                    )}
                    {cart.length > 0 && (
                        <PriceMatrix
                            cart={cart}
                            selectedStoreIds={selectedStoreIds}
                            prices={prices}
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
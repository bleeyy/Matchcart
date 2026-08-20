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

type HomeClientPrice = {
    id: number;
    price: number;
    currency: string;
    source: string;
    updated_at: string;
    regular_price: number | null;
    promo_price: number | null;
    store_products: {
        product_id: number;
        store_id: number;
    }[];
};

type HomeClientProps = {
    prices: HomeClientPrice[];
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

    const normalizedPrices = prices
        .map((item) => {
            const storeProduct = item.store_products[0];

            if (!storeProduct) {
                return null;
            }

            return {
                productId: storeProduct.product_id,
                storeId: storeProduct.store_id,
                price: item.price,
                currency: item.currency,
                source: item.source,
                updatedAt: item.updated_at,
                regularPrice: item.regular_price,
                promoPrice: item.promo_price,
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

    const hasLivePrices = normalizedPrices.some(
        (price) => price.source !== "seed"
    );

    const totals = calculateTotals(
        cart,
        selectedStoreIds,
        normalizedPrices
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
                <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-3 rounded-lg shadow-lg z-50">
                    {toast}
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
                            prices={normalizedPrices}
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
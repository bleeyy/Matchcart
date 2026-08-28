"use client";

import { Product } from "@/types/product";
import { useCallback, useEffect, useState } from "react";
import { CartItem } from "@/types/cart";

import Header from "@/components/layout/Header";
import Cart from "@/components/cart/Cart";
import ProductSearch from "@/components/search/ProductSearch";

import { StoreTotal } from "@/lib/comparison/calculateTotals";

import StoreComparison from "@/components/comparison/StoreComparison";
import CartSummary from "@/components/dashboard/CartSummary";

import StoreSettings from "@/components/setup/StoreSettings";

import {
    Check,
    Settings,
    ShoppingCart,
} from "lucide-react";

import SplashScreen from "@/components/layout/SplashScreen";

import type { MatchCartPrice } from "@/lib/data/priceRepository";

type HomeClientProps = {
    prices: MatchCartPrice[];
};

const DEFAULT_STORE_IDS = [1, 2, 3, 4];

export default function HomeClient({
    prices,
}: HomeClientProps) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const [selectedStoreIds, setSelectedStoreIds] =
        useState<number[]>(DEFAULT_STORE_IDS);

    const [toast, setToast] = useState("");

    const [highlightedItem, setHighlightedItem] =
        useState<number | null>(null);

    const [showStoreSettings, setShowStoreSettings] =
        useState(false);

    const [showSplash, setShowSplash] = useState(true);

    const [hasCompared, setHasCompared] = useState(false);

    const [storeTotals, setStoreTotals] =
        useState<StoreTotal[] | null>(null);

    const [comparisonPrices, setComparisonPrices] =
        useState<MatchCartPrice[]>([]);

    const [isComparing, setIsComparing] = useState(false);

    const finishSplash = useCallback(() => {
        setShowSplash(false);
    }, []);

    /*
     * Save selected stores.
     *
     * Changing stores invalidates the previous
     * comparison.
     */
    const handleStoreSettingsSave = (
        storeIds: number[]
    ) => {
        setSelectedStoreIds(storeIds);

        localStorage.setItem(
            "selectedStores",
            JSON.stringify(storeIds)
        );

        setHasCompared(false);
        setStoreTotals(null);
        setComparisonPrices([]);
    };

    /*
     * Load saved cart.
     */
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");

        if (savedCart) {
            setTimeout(() => {
                try {
                    setCart(JSON.parse(savedCart));
                } catch {
                    localStorage.removeItem("cart");
                }
            }, 0);
        }
    }, []);

    /*
     * Save cart.
     */
    useEffect(() => {
        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );
    }, [cart]);

    /*
     * Load saved stores.
     */
    useEffect(() => {
        const savedStores =
            localStorage.getItem("selectedStores");

        if (savedStores) {
            try {
                const parsedStores = JSON.parse(savedStores);

                if (
                    Array.isArray(parsedStores) &&
                    parsedStores.length > 0
                ) {
                    setTimeout(() => {
                        setSelectedStoreIds(parsedStores);
                    }, 0);
                }
            } catch {
                localStorage.removeItem("selectedStores");
            }
        }
    }, []);

    const removeItem = (id: number) => {
        setCart((currentCart) =>
            currentCart.filter(
                (item) => item.id !== id
            )
        );

        setHasCompared(false);
        setStoreTotals(null);
        setComparisonPrices([]);
    };

    const handleProductSelect = (
        product: Product,
        sizeId?: number,
        sizeLabel?: string,
        variantId?: number,
        variantName?: string
    ) => {
        const existingItem = cart.find(
            (item) =>
                item.productId === product.id &&
                item.sizeId === sizeId &&
                item.variantId === variantId
        );

        if (existingItem) {
            setToast(
                `${product.name}${
                    variantName
                        ? ` - ${variantName}`
                        : ""
                }${
                    sizeLabel
                        ? ` (${sizeLabel})`
                        : ""
                } is already in your cart. Use the quantity arrows to adjust it.`
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
                variantId,
                variantName,
                sizeId,
                sizeLabel,
                name: product.name,
                quantity: 1,
            },
        ]);

        setHasCompared(false);
        setStoreTotals(null);
        setComparisonPrices([]);

        setToast(
            `Nice pick. ${product.name}${
                variantName
                    ? ` - ${variantName}`
                    : ""
            }${
                sizeLabel
                    ? ` (${sizeLabel})`
                    : ""
            } added.`
        );

        setTimeout(() => setToast(""), 1600);
    };

    const increaseQuantity = (id: number) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          quantity:
                              item.quantity + 1,
                      }
                    : item
            )
        );

        setHasCompared(false);
        setStoreTotals(null);
        setComparisonPrices([]);
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

        setHasCompared(false);
        setStoreTotals(null);
        setComparisonPrices([]);
    };

    /*
     * Determine whether we have live retailer
     * prices.
     *
     * If a comparison has already been performed,
     * use the prices returned by that comparison.
     *
     * Otherwise, fall back to prices loaded from
     * Supabase when the page first rendered.
     */
    const hasLivePrices =
        comparisonPrices.length > 0
            ? comparisonPrices.some(
                  (price) =>
                      price.source !== "seed"
              )
            : prices.some(
                  (price) =>
                      price.source !== "seed"
              );

    const priceStatus = hasLivePrices
        ? "live"
        : "sample";

    /*
     * Ask the server to search the selected
     * retailers and calculate the cart totals.
     */
    const handleComparePrices = async () => {
        if (cart.length === 0) {
            return;
        }

        if (selectedStoreIds.length === 0) {
            setToast(
                "Please select at least one store before comparing prices."
            );

            setTimeout(() => setToast(""), 2500);

            return;
        }

        setIsComparing(true);
        setHasCompared(false);
        setStoreTotals(null);
        setComparisonPrices([]);

        try {
            const response = await fetch(
                "/api/compare",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        cart,
                        selectedStoreIds,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                        "Price comparison failed."
                );
            }

            setStoreTotals(data.totals ?? []);

            setComparisonPrices(
                data.prices ?? []
            );

            setHasCompared(true);
        } catch (error) {
            console.error(
                "Comparison failed:",
                error
            );

            setToast(
                error instanceof Error
                    ? error.message
                    : "Unable to compare prices right now."
            );

            setTimeout(() => setToast(""), 3000);
        } finally {
            setIsComparing(false);
        }
    };

    const completeTotals =
        storeTotals?.filter(
            (store) =>
                store.missingItems === 0
        ) ?? [];

    const cheapestStore =
        completeTotals.length > 0
            ? completeTotals[0]
            : null;

    const mostExpensiveStore =
        completeTotals.length > 0
            ? completeTotals[
                  completeTotals.length - 1
              ]
            : null;

    const savings =
        cheapestStore &&
        mostExpensiveStore
            ? mostExpensiveStore.total -
              cheapestStore.total
            : 0;

    const totalItemCount = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    return (
        <>
            {showSplash && (
                <SplashScreen
                    onFinish={finishSplash}
                />
            )}

            {toast && (
                <div
                    role="status"
                    className="toast-pop fixed top-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#243239] px-5 py-3 text-sm font-bold text-[#fffdf8] shadow-lg"
                >
                    <Check
                        size={16}
                        className="text-[#b8c8a4]"
                    />

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
                            type="button"
                            onClick={() =>
                                setShowStoreSettings(
                                    true
                                )
                            }
                            className="flex items-center gap-2 text-sm font-bold text-[#68736f] transition hover:text-[#d75e55]"
                        >
                            <Settings size={17} />

                            Edit Stores
                        </button>
                    </div>

                    <Cart
                        cart={cart}
                        removeItem={removeItem}
                        increaseQuantity={
                            increaseQuantity
                        }
                        decreaseQuantity={
                            decreaseQuantity
                        }
                        highlightedItem={
                            highlightedItem
                        }
                    />

                    {cart.length > 0 && (
                        <button
                            type="button"
                            onClick={
                                handleComparePrices
                            }
                            disabled={isComparing}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#243239] px-5 py-4 text-base font-bold text-[#fffdf8] shadow-[0_10px_24px_rgba(36,50,57,0.18)] transition hover:bg-[#34464f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <ShoppingCart size={19} />

                            {isComparing
                                ? "Comparing Prices..."
                                : hasCompared
                                ? "Recalculate Prices"
                                : "Compare Prices"}
                        </button>
                    )}

                    {hasCompared &&
                        storeTotals &&
                        cart.length > 0 &&
                        cheapestStore &&
                        mostExpensiveStore && (
                            <CartSummary
                                store={
                                    cheapestStore.storeName
                                }
                                total={
                                    cheapestStore.total
                                }
                                savings={savings}
                                comparedTo={
                                    mostExpensiveStore.storeName
                                }
                                itemCount={
                                    totalItemCount
                                }
                                dataStatus={
                                    priceStatus
                                }
                            />
                        )}

                    {hasCompared &&
                        storeTotals &&
                        cart.length > 0 && (
                            <StoreComparison
                                storeTotals={
                                    storeTotals
                                }
                                cart={cart}
                                prices={
                                    comparisonPrices
                                }
                                dataStatus={
                                    priceStatus
                                }
                            />
                        )}
                </div>

                {showStoreSettings && (
                    <StoreSettings
                        selectedStoreIds={
                            selectedStoreIds
                        }
                        onSave={
                            handleStoreSettingsSave
                        }
                        onClose={() =>
                            setShowStoreSettings(
                                false
                            )
                        }
                    />
                )}
            </main>
        </>
    );
}
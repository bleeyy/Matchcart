"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { stores } from "@/lib/data/stores";

type StoreSettingsProps = {
    selectedStoreIds: number[];
    onSave: (storeIds: number[]) => void;
    onClose: () => void;
};

export default function StoreSettings({
    selectedStoreIds,
    onSave,
    onClose,
}: StoreSettingsProps) {
    const [selected, setSelected] =
        useState<number[]>(selectedStoreIds);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const toggleStore = (storeId: number) => {
        setSelected((prev) =>
            prev.includes(storeId)
                ? prev.filter((id) => id !== storeId)
                : [...prev, storeId]
        );
    };

    const handleSave = () => {
        if (selected.length === 0) {
            return;
        }

        onSave(selected);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#243239]/45 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="store-settings-title"
        >
            <div className="w-full rounded-t-[1.5rem] border border-[#ded6c9] bg-[#fffdf8] p-6 shadow-[0_20px_55px_rgba(36,50,57,0.2)] sm:max-w-md sm:rounded-[1.5rem]">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2
                            id="store-settings-title"
                            className="font-[family-name:var(--font-display)] text-2xl text-[#243239]"
                        >
                            Your Stores
                        </h2>

                        <p className="mt-1 text-sm text-[#68736f]">
                            Choose which stores MatchCart compares.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        ref={closeButtonRef}
                        className="rounded-full p-2 text-[#68736f] transition hover:bg-[#f1eadf] hover:text-[#243239]"
                        aria-label="Close store settings"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-3">
                    {stores.map((store) => {
                        const isSelected = selected.includes(store.id);

                        return (
                            <button
                                type="button"
                                key={store.id}
                                onClick={() => toggleStore(store.id)}
                                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                                    isSelected
                                        ? "border-[#EF846C] bg-[#EF846C]/10"
                                        : "border-[#DFDCCD] hover:bg-[#DFDCCD]/20"
                                }`}
                                aria-pressed={isSelected}
                            >
                                <span className="font-semibold text-[#191F24]">
                                    {store.name}
                                </span>

                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                        isSelected
                                            ? "border-[#EF846C] bg-[#EF846C]"
                                            : "border-[#3B4954]"
                                    }`}
                                >
                                    {isSelected && (
                                        <Check
                                            size={16}
                                            className="text-[#191F24]"
                                        />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={selected.length === 0}
                    className={`mt-6 w-full rounded-xl py-3 font-semibold transition ${
                        selected.length > 0
                            ? "bg-[#191F24] text-white hover:opacity-90"
                            : "cursor-not-allowed bg-gray-200 text-gray-400"
                    }`}
                >
                    Save Stores
                </button>
            </div>
        </div>
    );
}
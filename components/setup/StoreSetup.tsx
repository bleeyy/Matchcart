"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { stores } from "@/lib/data/stores";

type StoreSetupProps = {
  onComplete: (storeIds: number[]) => void;
};

export default function StoreSetup({
  onComplete,
}: StoreSetupProps) {
  const [selectedStores, setSelectedStores] = useState<number[]>([]);

  const toggleStore = (storeId: number) => {
    setSelectedStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleContinue = () => {
    onComplete(selectedStores);
  };

  const handleSkip = () => {
    onComplete(stores.map((store) => store.id));
  };

  return (
    <div className="flex min-h-screen items-start justify-center px-4 pb-10 pt-12 sm:pt-20">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-[#ded6c9] bg-[#fffdf8] p-6 shadow-[0_20px_55px_rgba(82,66,44,0.1)] sm:p-9">

        <div className="mb-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d75e55]">
            Welcome to MatchCart
          </p>

          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-[-0.035em] text-[#243239] sm:text-5xl">
            Where do you shop?
          </h1>

          <p className="mt-4 max-w-sm leading-6 text-[#68736f]">
            Pick the stores you usually visit. We&apos;ll compare your grocery
            list across them. You can change this anytime.
          </p>
        </div>

        <div className="space-y-3">
          {stores.map((store) => {
            const selected = selectedStores.includes(store.id);

            return (
              <button
                key={store.id}
                type="button"
                onClick={() => toggleStore(store.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-[#ee806c] bg-[#ee806c]/10 shadow-[0_7px_15px_rgba(215,94,85,0.1)]"
                    : "border-[#ded6c9] hover:bg-[#f1eadf]"
                }`}
              >
                <span className="font-semibold text-[#191F24]">
                  {store.name}
                </span>

                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                    selected
                      ? "border-[#EF846C] bg-[#EF846C]"
                      : "border-[#3B4954]"
                  }`}
                >
                  {selected && (
                    <Check
                      size={16}
                      className="text-white"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={selectedStores.length === 0}
          className={`mt-8 w-full rounded-2xl py-3.5 font-bold transition ${
            selectedStores.length > 0
              ? "bg-[#243239] text-[#fffdf8] hover:-translate-y-0.5 hover:bg-[#3f594a]"
              : "bg-[#e9e3d9] text-[#a5a59c]"
          }`}
        >
          Compare These Stores
        </button>

        <button
          type="button"
          onClick={handleSkip}
          className="mt-3 w-full rounded-2xl py-3 text-sm font-semibold text-[#68736f] transition hover:bg-[#f1eadf] hover:text-[#243239]"
        >
          Skip for now
        </button>

      </div>
    </div>
  );
}
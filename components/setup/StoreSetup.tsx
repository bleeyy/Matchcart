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
    if (selectedStores.length === 0) return;

    onComplete(selectedStores);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-20 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#191F24]">
            Compare prices your way
          </h1>

          <p className="text-[#3B4954] mt-2">
            Which stores do you shop at?
          </p>
        </div>

        <div className="space-y-3">
          {stores.map((store) => {
            const selected = selectedStores.includes(store.id);

            return (
              <button
                key={store.id}
                onClick={() => toggleStore(store.id)}
                className={`w-full flex items-center justify-between border rounded-xl p-4 transition ${
                  selected
                    ? "border-[#EF846C] bg-[#EF846C]/10"
                    : "border-[#DFDCCD] hover:bg-gray-50"
                }`}
              >
                <span className="font-semibold text-[#191F24]">
                  {store.name}
                </span>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                    selected
                      ? "bg-[#EF846C] border-[#EF846C]"
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
          onClick={handleContinue}
          disabled={selectedStores.length === 0}
          className={`w-full mt-8 rounded-xl py-3 font-semibold transition ${
            selectedStores.length > 0
              ? "bg-[#191F24] text-white hover:opacity-90"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>

      </div>
    </div>
  );
}
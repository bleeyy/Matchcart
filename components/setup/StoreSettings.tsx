"use client";

import { useState } from "react";
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
  const [selected, setSelected] = useState<number[]>(selectedStoreIds);

  const toggleStore = (storeId: number) => {
    setSelected((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleSave = () => {
    if (selected.length === 0) return;
    onSave(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#191F24]">
              Your Stores
            </h2>

            <p className="text-sm text-[#3B4954] mt-1">
              Choose which stores MatchCart compares.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#DFDCCD]/40"
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
                key={store.id}
                onClick={() => toggleStore(store.id)}
                className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? "border-[#EF846C] bg-[#EF846C]/10"
                    : "border-[#DFDCCD] hover:bg-[#DFDCCD]/20"
                }`}
              >
                <span className="font-semibold text-[#191F24]">
                  {store.name}
                </span>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    isSelected
                      ? "bg-[#EF846C] border-[#EF846C]"
                      : "border-[#3B4954]"
                  }`}
                >
                  {isSelected && (
                    <Check size={16} className="text-[#191F24]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={selected.length === 0}
          className={`w-full mt-6 py-3 rounded-xl font-semibold transition ${
            selected.length > 0
              ? "bg-[#191F24] text-white hover:opacity-90"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save Stores
        </button>
      </div>
    </div>
  );
}
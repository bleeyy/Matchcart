"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { StoreTotal } from "@/lib/comparison/calculateTotals";

type StoreComparisonProps = {
  storeTotals: StoreTotal[];
};

export default function StoreComparison({
  storeTotals,
}: StoreComparisonProps) {

  if (storeTotals.length === 0) {
    return null;
  }

  const cheapestTotal = Math.min(
    ...storeTotals.map((store) => store.total)
  );

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-6 border border-[#DFDCCD] rounded-xl bg-white overflow-hidden">

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center p-4"
      >
        <div className="text-left">
          <h2 className="text-xl font-bold text-[#191F24]">
            Store Comparison
          </h2>

          <p className="text-sm text-[#3B4954]">
            What we found to be the cheapest grocery carts!
          </p>
        </div>

        <ChevronDown
          className={`transition-transform duration-500 ${expanded ? "rotate-180" : ""
            }`}
        />      </button>


      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="border-t border-[#DFDCCD] p-4 space-y-2">

          {storeTotals.map((store, index) => (
            <div
              key={store.storeName}
              className={`flex justify-between border rounded-lg p-3 ${store.total === cheapestTotal
                ? "border-green-500 bg-green-50"
                : ""
                }`}
            >
              <div>
                <p className="font-semibold text-[#191F24]">
                  {index + 1}. {store.storeName}
                </p>

                {index === 0 ? (
                  <p className="text-sm text-green-700">
                    Lowest Total
                  </p>
                ) : (
                  <p className="text-sm text-[#3B4954]">
                    +${(store.total - cheapestTotal).toFixed(2)}
                  </p>
                )}
              </div>

              <span className="font-bold text-black">
                ${store.total.toFixed(2)}
              </span>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}
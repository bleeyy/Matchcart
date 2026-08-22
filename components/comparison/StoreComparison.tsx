"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { StoreTotal } from "@/lib/comparison/calculateTotals";

type StoreComparisonProps = {
  storeTotals: StoreTotal[];
  dataStatus: "live" | "sample";
};

export default function StoreComparison({
  storeTotals,
  dataStatus,
}: StoreComparisonProps) {
  const [expanded, setExpanded] = useState(false);

  if (storeTotals.length === 0) {
    return null;
  }

  const completeStoreTotals = storeTotals.filter(
    (store) => store.missingItems === 0
  );

  const cheapestTotal =
    completeStoreTotals.length > 0
      ? Math.min(
        ...completeStoreTotals.map((store) => store.total)
      )
      : null;

  return (
    <div className="mt-6 overflow-hidden rounded-[1.35rem] border border-[#ded6c9] bg-[#fffdf8] shadow-[0_10px_28px_rgba(82,66,44,0.05)]">

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center p-4"
      >
        <div className="text-left">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#243239]">
            The store showdown
          </h2>

          <p className="text-sm text-[#68736f]">
            A quick look at what your whole list costs.
          </p>

          <p className="mt-1 text-xs text-[#68736f]/70">
            {dataStatus === "live"
              ? "Using connected retailer pricing"
              : "Using sample pricing data"}
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
              className={`flex justify-between border rounded-lg p-3 ${cheapestTotal !== null &&
                store.total === cheapestTotal &&
                store.missingItems === 0
                ? "border-green-500 bg-green-50"
                : ""
                }`}
            >
              <div>
                <p className="font-semibold text-[#191F24]">
                  {index + 1}. {store.storeName}
                </p>

                {store.missingItems > 0 ? (
                  <p className="text-xs text-amber-600">
                    {store.missingItems} item
                    {store.missingItems === 1 ? "" : "s"} missing price
                  </p>
                ) : cheapestTotal !== null && store.total === cheapestTotal ? (<p className="text-sm text-green-700">
                  Lowest Total
                </p>
                ) : (
                  <p className="text-sm text-[#3B4954]">
                    {cheapestTotal !== null
                      ? `+$${(store.total - cheapestTotal).toFixed(2)}`
                      : "—"}
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
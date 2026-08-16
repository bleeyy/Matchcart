"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({
  onFinish,
}: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 900);

    const finishTimer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 1250);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#191F24] transition-opacity duration-300 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="animate-[bounce_1s_ease-in-out_1]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EF846C]">
            <ShoppingCart
              size={34}
              strokeWidth={2.2}
              className="text-[#191F24]"
            />
          </div>
        </div>

        <div className="animate-[pulse_1.1s_ease-in-out_1]">
          <h1 className="text-3xl font-bold tracking-tight text-[#DFDCCD]">
            MatchCart
          </h1>

          <p className="mt-1 text-sm text-[#CEB9BC]">
            Compare smarter.
          </p>
        </div>
      </div>
    </div>
  );
}
import { NextResponse } from "next/server";

import { compareCart } from "@/lib/comparison/compareCart";

import type { CartItem } from "@/types/cart";

type CompareRequest = {
    cart: CartItem[];
    selectedStoreIds: number[];
};

export async function POST(
    request: Request
) {
    try {
        const body =
            (await request.json()) as CompareRequest;

        if (
            !Array.isArray(body.cart) ||
            !Array.isArray(
                body.selectedStoreIds
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid comparison request.",
                },
                { status: 400 }
            );
        }

        const result =
            await compareCart(
                body.cart,
                body.selectedStoreIds
            );

        return NextResponse.json(result);
    } catch (error) {
        console.error(
            "Price comparison failed:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Price comparison failed.",
            },
            { status: 500 }
        );
    }
}
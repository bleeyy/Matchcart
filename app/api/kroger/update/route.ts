import { NextResponse } from "next/server";

import { getProducts } from "@/lib/data/getProducts";
import { updateKrogerPrices } from "@/lib/kroger/updatePrices";
import { updateAldiPrices } from "@/lib/aldi/updatePrices";

type RetailerUpdateResult = {
    results: unknown[];
    failures: unknown[];
    apiUnavailable: boolean;
    apiError: string | null;
};

export async function GET(
    request: Request
) {
    const authHeader =
        request.headers.get("authorization");

    if (
        process.env.CRON_SECRET &&
        authHeader !==
            `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const products =
            await getProducts();

        /*
         * =====================================================
         * KROGER
         * =====================================================
         */

        let krogerResult:
            RetailerUpdateResult = {
            results: [],
            failures: [],
            apiUnavailable: false,
            apiError: null,
        };

        try {
            const result =
                await updateKrogerPrices(
                    products
                );

            krogerResult = {
                results:
                    result.results ?? [],
                failures:
                    result.failures ?? [],
                apiUnavailable: false,
                apiError: null,
            };
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown Kroger API error";

            console.error(
                "Kroger update failed:",
                message
            );

            krogerResult = {
                results: [],
                failures: [],
                apiUnavailable: true,
                apiError: message,
            };
        }

        /*
         * =====================================================
         * ALDI
         * =====================================================
         */

        let aldiResult:
            RetailerUpdateResult = {
            results: [],
            failures: [],
            apiUnavailable: false,
            apiError: null,
        };

        try {
            const result =
                await updateAldiPrices(
                    products
                );

            aldiResult = {
                results:
                    result.results ?? [],
                failures:
                    result.failures ?? [],
                apiUnavailable: false,
                apiError: null,
            };
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown ALDI API error";

            console.error(
                "ALDI update failed:",
                message
            );

            aldiResult = {
                results: [],
                failures: [],
                apiUnavailable: true,
                apiError: message,
            };
        }

        /*
         * =====================================================
         * RESPONSE
         * =====================================================
         *
         * Each retailer is independent.
         *
         * If Kroger works but ALDI fails:
         *   Kroger prices still update.
         *
         * If ALDI works but Kroger fails:
         *   ALDI prices still update.
         *
         * If both fail:
         *   Existing prices remain untouched.
         */

        return NextResponse.json({
            success: true,

            kroger: {
                updated:
                    krogerResult.results
                        .length,

                failures:
                    krogerResult.failures,

                apiUnavailable:
                    krogerResult.apiUnavailable,

                apiError:
                    krogerResult.apiError,
            },

            aldi: {
                updated:
                    aldiResult.results
                        .length,

                failures:
                    aldiResult.failures,

                apiUnavailable:
                    aldiResult.apiUnavailable,

                apiError:
                    aldiResult.apiError,
            },
        });
    } catch (error) {
        console.error(
            "Price refresh failed:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            },
            { status: 500 }
        );
    }
}
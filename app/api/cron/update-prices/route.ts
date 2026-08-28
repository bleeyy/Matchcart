import { NextResponse } from "next/server";

import { getProducts } from "@/lib/data/getProducts";
import {
    updateKrogerPrices,
} from "@/lib/kroger/updatePrices";

import {
    updateAldiPrices,
} from "@/lib/aldi/updatePrices";

import {
    updateHebPrices,
} from "@/lib/heb/updatePrices";

export async function GET(
    request: Request
) {
    const authHeader =
        request.headers.get(
            "authorization"
        );

    if (
        process.env.CRON_SECRET &&
        authHeader !==
            `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json(
            {
                error:
                    "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    try {
        const products =
            await getProducts();

        /*
         * ============================
         * KROGER
         * ============================
         */

        let krogerResult: {
            results: unknown[];
            failures: unknown[];
        } = {
            results: [],
            failures: [],
        };

        let krogerError:
            | string
            | null = null;

        try {
            krogerResult =
                await updateKrogerPrices(
                    products
                );
        } catch (error) {
            krogerError =
                error instanceof
                Error
                    ? error.message
                    : "Unknown Kroger error";

            console.error(
                "Kroger update failed:",
                krogerError
            );
        }

        /*
         * ============================
         * ALDI
         * ============================
         */

        let aldiResult:
            | Awaited<
                  ReturnType<
                      typeof updateAldiPrices
                  >
              >
            | null =
            null;

        try {
            aldiResult =
                await updateAldiPrices(
                    products
                );
        } catch (error) {
            console.error(
                "ALDI update failed:",
                error
            );

            aldiResult = {
                results: [],
                failures: [],
                apiUnavailable:
                    true,
                apiError:
                    error instanceof
                    Error
                        ? error.message
                        : "Unknown ALDI error",
            };
        }

        /*
         * ============================
         * H-E-B
         * ============================
         */

        let hebResult:
            | Awaited<
                  ReturnType<
                      typeof updateHebPrices
                  >
              >
            | null =
            null;

        try {
            hebResult =
                await updateHebPrices(
                    products
                );
        } catch (error) {
            console.error(
                "H-E-B update failed:",
                error
            );

            hebResult = {
                results: [],
                failures: [],
            };
        }

        /*
         * ============================
         * RESPONSE
         * ============================
         */

        return NextResponse.json({
            success: true,

            kroger: {
                updated:
                    krogerResult
                        .results
                        .length,

                failures:
                    krogerResult
                        .failures,

                apiUnavailable:
                    krogerError !==
                    null,

                apiError:
                    krogerError,
            },

            aldi: {
                updated:
                    aldiResult
                        .results
                        .length,

                failures:
                    aldiResult
                        .failures,

                apiUnavailable:
                    aldiResult
                        .apiUnavailable,

                apiError:
                    aldiResult
                        .apiError,
            },

            heb: {
                updated:
                    hebResult
                        .results
                        .length,

                failures:
                    hebResult
                        .failures,

                apiUnavailable:
                    false,

                apiError:
                    null,
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
                    error instanceof
                    Error
                        ? error.message
                        : "Unknown error",
            },
            {
                status: 500,
            }
        );
    }
}
import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/getProducts";
import { updateAldiPrices } from "@/lib/aldi/updatePrices";

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
                error: "Unauthorized",
            },
            {
                status: 401,
            }
        );
    }

    try {
        const products =
            await getProducts();

        const {
            results,
            failures,
        } = await updateAldiPrices(
            products
        );

        return NextResponse.json({
            success: true,

            updated:
                results.length,

            failures,
        });
    } catch (error) {
        console.error(
            "Aldi price refresh failed:",
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
            {
                status: 500,
            }
        );
    }
}
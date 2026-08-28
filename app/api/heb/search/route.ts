import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    searchHebProducts,
} from "@/lib/heb/client";

export async function GET(
    request: NextRequest
) {
    try {
        const {
            searchParams,
        } = new URL(
            request.url
        );

        const query =
            searchParams.get(
                "query"
            );

        const storeId =
            searchParams.get(
                "store_id"
            ) ||
            process.env.HEB_STORE_ID;

        const pageParam =
            searchParams.get(
                "page"
            );

        const page =
            pageParam
                ? Number(pageParam)
                : 1;

        if (!query) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Missing query parameter.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!storeId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Missing H-E-B store ID. Provide store_id or set HEB_STORE_ID.",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !Number.isInteger(
                page
            ) ||
            page < 1
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "page must be a positive integer.",
                },
                {
                    status: 400,
                }
            );
        }

        const data =
            await searchHebProducts(
                query,
                storeId,
                page
            );

        return NextResponse.json(
            {
                success: true,
                ...data,
            }
        );
    } catch (error) {
        console.error(
            "H-E-B search failed:",
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
import { NextRequest, NextResponse } from "next/server";
import { searchAldiProducts } from "@/lib/aldi/client";

export async function GET(
    request: NextRequest
) {
    try {
        const { searchParams } =
            new URL(request.url);

        const query =
            searchParams.get("query");

        const zipCode =
            searchParams.get("zip_code") ||
            process.env.ALDI_ZIP_CODE;

        const limitParam =
            searchParams.get("limit");

        const limit = limitParam
            ? Number(limitParam)
            : 10;

        if (!query) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Missing query parameter.",
                },
                { status: 400 }
            );
        }

        if (!zipCode) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Missing ALDI ZIP code. Provide zip_code or set ALDI_ZIP_CODE.",
                },
                { status: 400 }
            );
        }

        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 60
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "limit must be an integer between 1 and 60.",
                },
                { status: 400 }
            );
        }

        const data =
            await searchAldiProducts(
                query,
                zipCode,
                limit
            );

        return NextResponse.json({
            success: true,
            ...data,
        });
    } catch (error) {
        console.error(
            "ALDI search failed:",
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
import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/getProducts";
import { updateAldiPrices } from "@/lib/aldi/updatePrices";

export async function GET() {
  try {
    const zipCode =
      process.env.ALDI_ZIP_CODE;

    const storeId =
      process.env.ALDI_STORE_ID;

    console.log(
      "ALDI_ZIP_CODE:",
      zipCode
    );

    console.log(
      "ALDI_STORE_ID:",
      storeId
    );

    if (!zipCode) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ALDI_ZIP_CODE is not being loaded.",
        },
        { status: 500 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ALDI_STORE_ID is not being loaded.",
        },
        { status: 500 }
      );
    }

    if (!process.env.PARSE_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PARSE_API_KEY is not being loaded.",
        },
        { status: 500 }
      );
    }

    const products =
      await getProducts();

    const {
      results,
      failures,
    } =
      await updateAldiPrices(
        products
      );

    return NextResponse.json({
      success: true,
      zipCode,
      storeId,
      updated:
        results.length,
      failed:
        failures.length,
      results,
      failures,
    });
  } catch (error) {
    console.error(
      "ALDI update failed:",
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
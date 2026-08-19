import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/getProducts";
import { updateKrogerPrices } from "@/lib/kroger/updatePrices";

export async function POST() {
  try {
    const products = await getProducts();

    const { results, failures } =
      await updateKrogerPrices(products);

    return NextResponse.json({
      success: true,
      updated: results.length,
      results,
      failures,
    });
  } catch (error) {
    console.error("Kroger update failed:", error);

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
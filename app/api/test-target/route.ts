import { NextResponse } from "next/server";
import { searchTargetProducts } from "@/lib/target/client";

export async function GET() {
  try {
    const products = await searchTargetProducts(
      "milk",
      "77840"
    );

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Target API test failed:", error);

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
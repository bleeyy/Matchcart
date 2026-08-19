import {
  getKrogerProduct,
  searchKrogerProducts,
} from "@/lib/kroger/products";

import type {
  RetailerAdapter,
  RetailerPrice,
} from "./types";

const LOCATION_ID = process.env.KROGER_LOCATION_ID;

function getPrice(product: Awaited<ReturnType<typeof getKrogerProduct>>) {
  const item = product?.items?.find(
    (item) =>
      item.price?.promo !== undefined ||
      item.price?.regular !== undefined
  );

  if (!item?.price) {
    return null;
  }

  const regularPrice = item.price.regular ?? null;
  const promoPrice = item.price.promo ?? null;

  return {
    price: promoPrice ?? regularPrice ?? 0,
    regularPrice,
    promoPrice,
  };
}

export const krogerAdapter: RetailerAdapter = {
  async searchProduct(
    productName: string
  ): Promise<RetailerPrice | null> {
    if (!LOCATION_ID) {
      throw new Error("Missing KROGER_LOCATION_ID.");
    }

    const results = await searchKrogerProducts(
      productName,
      LOCATION_ID
    );

    if (results.length === 0) {
      return null;
    }

    const match =
      results.find((product) =>
        product.description
          ?.toLowerCase()
          .includes(productName.toLowerCase())
      ) ?? results[0];

    const exactProduct = await getKrogerProduct(
      match.productId,
      LOCATION_ID
    );

    if (!exactProduct) {
      return null;
    }

    const pricing = getPrice(exactProduct);

    if (!pricing) {
      return null;
    }

    return {
      externalProductId: exactProduct.productId,
      productName:
        exactProduct.description ?? productName,
      brand: exactProduct.brand ?? null,
      price: pricing.price,
      regularPrice: pricing.regularPrice,
      promoPrice: pricing.promoPrice,
      currency: "USD",
      updatedAt: new Date().toISOString(),
    };
  },

  async getProductPrice(
    externalProductId: string
  ): Promise<RetailerPrice | null> {
    if (!LOCATION_ID) {
      throw new Error("Missing KROGER_LOCATION_ID.");
    }

    const product = await getKrogerProduct(
      externalProductId,
      LOCATION_ID
    );

    if (!product) {
      return null;
    }

    const pricing = getPrice(product);

    if (!pricing) {
      return null;
    }

    return {
      externalProductId: product.productId,
      productName: product.description ?? "Unknown",
      brand: product.brand ?? null,
      price: pricing.price,
      regularPrice: pricing.regularPrice,
      promoPrice: pricing.promoPrice,
      currency: "USD",
      updatedAt: new Date().toISOString(),
    };
  },
};
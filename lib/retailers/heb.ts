import {
  searchHEBProducts,
} from "@/lib/heb/client";

import type {
  RetailerAdapter,
  RetailerPrice,
} from "@/lib/retailers/types";

function getBestHEBProduct(
  searchTerm: string,
  products: Awaited<
    ReturnType<typeof searchHEBProducts>
  >
) {
  const queryWords = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const ranked = products
    .map((product) => {
      const name =
        product.name.toLowerCase();

      let score = 0;

      for (const word of queryWords) {
        if (name.includes(word)) {
          score++;
        }
      }

      return {
        product,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.product ?? null;
}

function convertHEBProduct(
  product: Awaited<
    ReturnType<typeof searchHEBProducts>
  >[number]
): RetailerPrice | null {
  if (!product.price || product.price <= 0) {
    return null;
  }

  return {
    externalProductId:
      product.productId,

    productName:
      product.name,

    brand:
      product.brand,

    price:
      product.price,

    regularPrice:
      product.regularPrice,

    promoPrice:
      product.promoPrice,

    currency: "USD",

    source: "heb",

    updatedAt:
      new Date().toISOString(),
  };
}

export const hebRetailer: RetailerAdapter = {
  async searchProduct(
    productName: string
  ): Promise<RetailerPrice | null> {
    const products =
      await searchHEBProducts(
        productName,
        10
      );

    if (products.length === 0) {
      return null;
    }

    const best =
      getBestHEBProduct(
        productName,
        products
      );

    if (!best) {
      return null;
    }

    return convertHEBProduct(best);
  },

  async getProductPrice(
    externalProductId: string
  ): Promise<RetailerPrice | null> {
    /*
     * H-E-B does not currently have a
     * direct product lookup implemented.
     */
    return null;
  },
};
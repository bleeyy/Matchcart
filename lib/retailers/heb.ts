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
    >["products"]
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
    >["products"][number]
): RetailerPrice | null {
    const price =
        product.price ??
        product.sale_price;

    if (!price || price <= 0) {
        return null;
    }

    return {
        externalProductId:
            product.id,

        productName:
            product.name,

        brand:
            product.brand,

        price,

        regularPrice:
            product.price,

        promoPrice:
            product.sale_price,

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
        const storeId =
            process.env.HEB_STORE_ID;

        if (!storeId) {
            throw new Error(
                "Missing HEB_STORE_ID environment variable."
            );
        }

        const result =
            await searchHEBProducts(
                productName,
                storeId,
                1
            );

        const products =
            result.products;

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
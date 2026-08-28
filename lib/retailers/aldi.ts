import type {
    RetailerAdapter,
    RetailerPrice,
} from "@/lib/retailers/types";

const ALDI_API_URL =
    "https://api.aldi.us/v1/catalog-search-product-offers";

/*
 * Fixed ALDI location.
 *
 * This is intentionally one store/location for
 * the portfolio version of MatchCart.
 */
const ALDI_STORE_ID =
    "479-022";

type AldiProduct = {
    productConcreteSku: string;
    name: string;
    brandName?: string | null;
    prices?: {
        formattedPrice?: string;
    }[];
};

type AldiResponse = {
    data?: {
        attributes?: {
            catalogSearchProductOfferResults?: AldiProduct[];
        };
    }[];
};

function parsePrice(
    formattedPrice?: string
): number | null {
    if (!formattedPrice) {
        return null;
    }

    const cleaned =
        formattedPrice.replace(
            /[^0-9.]/g,
            ""
        );

    const price =
        Number(cleaned);

    return Number.isFinite(price)
        ? price
        : null;
}

function normalizeSearchTerm(
    productName: string
): string {
    return productName
        .toLowerCase()
        .trim();
}

function findBestProduct(
    products: AldiProduct[],
    productName: string
): AldiProduct | null {
    const searchTerm =
        normalizeSearchTerm(
            productName
        );

    const searchWords =
        searchTerm
            .split(/\s+/)
            .filter(Boolean);

    const scored = products
        .map((product) => {
            const productName =
                product.name
                    .toLowerCase();

            let score = 0;

            for (const word of searchWords) {
                if (
                    productName.includes(
                        word
                    )
                ) {
                    score += 1;
                }
            }

            /*
             * Give an exact name match
             * a large advantage.
             */
            if (
                productName ===
                searchTerm
            ) {
                score += 100;
            }

            return {
                product,
                score,
            };
        })
        .filter(
            (result) =>
                result.score > 0
        )
        .sort(
            (a, b) =>
                b.score -
                a.score
        );

    return (
        scored[0]?.product ??
        null
    );
}

function convertProduct(
    product: AldiProduct
): RetailerPrice | null {
    const price =
        parsePrice(
            product.prices?.[0]
                ?.formattedPrice
        );

    if (
        !product.productConcreteSku ||
        !product.name ||
        price === null
    ) {
        return null;
    }

    return {
        externalProductId:
            product.productConcreteSku,

        productName:
            product.name,

        brand:
            product.brandName ??
            null,

        price,

        regularPrice:
            price,

        promoPrice:
            null,

        currency:
            "USD",

        source:
            "aldi",

        updatedAt:
            new Date().toISOString(),
    };
}

async function searchAldi(
    productName: string
): Promise<RetailerPrice | null> {
    const params =
        new URLSearchParams({
            currency: "USD",
            serviceType: "pickup",
            "page[limit]": "48",
            "page[offset]": "0",
            sort: "relevance",
            merchantReference:
                ALDI_STORE_ID,
        });

    const response =
        await fetch(
            `${ALDI_API_URL}?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json",
                    "User-Agent":
                        "Mozilla/5.0",
                    Origin:
                        "https://new.aldi.us",
                },
                cache: "no-store",
            }
        );

    if (!response.ok) {
        const errorText =
            await response.text();

        throw new Error(
            `ALDI request failed (${response.status}): ${errorText}`
        );
    }

    const data =
        (await response.json()) as AldiResponse;

    const products =
        data.data?.[0]
            ?.attributes
            ?.catalogSearchProductOfferResults ??
        [];

    const bestProduct =
        findBestProduct(
            products,
            productName
        );

    if (!bestProduct) {
        return null;
    }

    return convertProduct(
        bestProduct
    );
}

export const aldiRetailer: RetailerAdapter = {
    async searchProduct(
        productName: string
    ): Promise<RetailerPrice | null> {
        return searchAldi(
            productName
        );
    },

    async getProductPrice(
        externalProductId: string
    ): Promise<RetailerPrice | null> {
        /*
         * ALDI's product-detail endpoint can
         * be added later if we need direct SKU
         * lookups.
         *
         * For now, MatchCart searches the catalog
         * by product name.
         */
        console.log(
            `ALDI price requested: ${externalProductId}`
        );

        return null;
    },
};
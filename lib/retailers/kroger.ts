import {
    searchKrogerProducts,
} from "@/lib/kroger/client";

import type {
    RetailerAdapter,
    RetailerPrice,
} from "@/lib/retailers/types";

/*
 * Words that usually indicate the product is
 * substantially different from what was requested.
 */
const UNRELATED_WORDS = [
    "pepper",
    "lentil",
    "blend",
    "seasoned",
    "flavored",
    "flavour",
    "soup",
    "sauce",
    "snack",
    "cracker",
    "cookie",
    "cereal",
    "juice",
    "drink",
    "powder",
    "mix",
    "kit",
    "dressing",
];

/*
 * Normalize product text so matching is more
 * consistent.
 */
function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/*
 * Convert common size formats into a normalized
 * representation.
 *
 * Examples:
 *
 * "1 gallon"       → "1 gallon"
 * "1 gal"          → "1 gallon"
 * "16 oz"          → "16 oz"
 * "16-ounce"       → "16 oz"
 * "12 count"       → "12 count"
 */
function normalizeSize(value: string): string {
    return normalizeText(value)
        .replace(/\bgal\b/g, "gallon")
        .replace(/\bgals\b/g, "gallons")
        .replace(/\blb\b/g, "pound")
        .replace(/\blbs\b/g, "pounds")
        .replace(/\boz\b/g, "oz")
        .replace(/\bounces?\b/g, "oz")
        .replace(/\bct\b/g, "count")
        .replace(/\bpk\b/g, "pack");
}

/*
 * Extract useful size tokens from a string.
 *
 * Examples:
 *
 * "1 gallon" → ["1 gallon"]
 * "16 oz"    → ["16 oz"]
 * "12 count" → ["12 count"]
 */
function extractSizeTokens(
    value: string
): string[] {
    const normalized = normalizeSize(value);

    const matches =
        normalized.match(
            /\b\d+(?:\.\d+)?\s*(?:oz|gallon|gallons|pound|pounds|count|pack|liter|liters|ml|l)\b/g
        );

    return matches ?? [];
}

/*
 * Determine whether a product description contains
 * an explicitly different size from the requested size.
 */
function hasConflictingSize(
    searchTerm: string,
    productName: string
): boolean {
    const requestedSizes =
        extractSizeTokens(searchTerm);

    /*
     * If the user's search doesn't contain a size,
     * don't reject based on size.
     */
    if (requestedSizes.length === 0) {
        return false;
    }

    const productSizes =
        extractSizeTokens(productName);

    /*
     * If the retailer doesn't expose a recognizable
     * size, let the normal word matching decide.
     */
    if (productSizes.length === 0) {
        return false;
    }

    /*
     * At least one requested size must appear in
     * the product description.
     */
    return !requestedSizes.some(
        (requestedSize) =>
            productSizes.includes(
                requestedSize
            )
    );
}

/*
 * Create progressively less-specific searches.
 *
 * Example:
 *
 * "Milk Whole Milk 1 gallon"
 *
 * → "Milk Whole Milk 1 gallon"
 * → "Whole Milk 1 gallon"
 * → "Milk Whole Milk"
 * → "Whole Milk"
 *
 * We intentionally DO NOT automatically reduce
 * this all the way to just "Milk", because that
 * would create a very high risk of bad matches.
 */
function buildProgressiveSearches(
    searchTerm: string
): string[] {
    const normalized =
        normalizeText(searchTerm);

    const words =
        normalized
            .split(/\s+/)
            .filter(Boolean);

    const searches: string[] = [];

    const addSearch = (value: string) => {
        const cleaned =
            normalizeText(value);

        if (
            cleaned &&
            !searches.includes(cleaned)
        ) {
            searches.push(cleaned);
        }
    };

    /*
     * First attempt:
     * exact complete search.
     */
    addSearch(normalized);

    /*
     * Remove generic leading words such as the
     * base product name when there are enough words.
     *
     * "Milk Whole Milk 1 gallon"
     * → "Whole Milk 1 gallon"
     */
    if (words.length >= 3) {
        addSearch(
            words
                .slice(1)
                .join(" ")
        );
    }

    /*
     * Remove the first word AND size for a more
     * general product-type search.
     *
     * "Milk Whole Milk 1 gallon"
     * → "Whole Milk"
     */
    const sizeTokens =
        extractSizeTokens(normalized);

    const wordsWithoutSize =
        words.filter(
            (word) =>
                !sizeTokens.some(
                    (size) =>
                        size
                            .split(" ")
                            .includes(word)
                )
        );

    if (
        wordsWithoutSize.length >= 2
    ) {
        addSearch(
            wordsWithoutSize
                .slice(1)
                .join(" ")
        );

        addSearch(
            wordsWithoutSize.join(" ")
        );
    }

    /*
     * If the query has a size and a meaningful
     * product phrase, also try the product phrase
     * plus the size.
     */
    if (
        sizeTokens.length > 0 &&
        wordsWithoutSize.length > 0
    ) {
        addSearch(
            `${wordsWithoutSize.join(" ")} ${sizeTokens[0]}`
        );
    }

    return searches;
}

/*
 * Strictly rank Kroger products against the
 * ORIGINAL user search.
 */
function getBestKrogerProduct(
    originalSearchTerm: string,
    products: any[]
) {
    const normalizedSearch =
        normalizeText(
            originalSearchTerm
        );

    const queryWords =
        normalizedSearch
            .split(/\s+/)
            .filter(Boolean);

    /*
     * Ignore extremely generic words when deciding
     * whether a product is a strong match.
     */
    const meaningfulWords =
        queryWords.filter(
            (word) =>
                ![
                    "the",
                    "and",
                    "of",
                    "with",
                    "for",
                    "item",
                ].includes(word)
        );

    const ranked = products
        .map((product) => {
            const name =
                normalizeText(
                    String(
                        product.description ??
                            ""
                    )
                );

            const brand =
                normalizeText(
                    String(
                        product.brand ??
                            ""
                    )
                );

            if (!name) {
                return {
                    product,
                    score: -Infinity,
                    matchedWords: 0,
                    requiredWords: meaningfulWords.length,
                };
            }

            let score = 0;

            let matchedWords = 0;

            /*
             * Exact full-name match.
             */
            if (
                name ===
                normalizedSearch
            ) {
                score += 1000;
            }

            /*
             * Exact search phrase.
             */
            if (
                name.includes(
                    normalizedSearch
                )
            ) {
                score += 400;
            }

            /*
             * Description starts with the
             * requested phrase.
             */
            if (
                name.startsWith(
                    normalizedSearch
                )
            ) {
                score += 200;
            }

            /*
             * Score individual meaningful words.
             */
            for (const word of meaningfulWords) {
                if (
                    name.includes(word)
                ) {
                    matchedWords++;
                    score += 100;
                }
            }

            /*
             * Penalize missing important words.
             */
            const missingWords =
                meaningfulWords.filter(
                    (word) =>
                        !name.includes(
                            word
                        )
                );

            score -=
                missingWords.length *
                80;

            /*
             * Brand match gets a modest bonus.
             */
            if (
                brand &&
                normalizedSearch.includes(
                    brand
                )
            ) {
                score += 40;
            }

            /*
             * Penalize obvious unrelated products.
             */
            for (
                const word of UNRELATED_WORDS
            ) {
                if (
                    name.includes(word) &&
                    !queryWords.includes(word)
                ) {
                    score -= 200;
                }
            }

            /*
             * Reject products with an explicitly
             * conflicting size.
             */
            if (
                hasConflictingSize(
                    originalSearchTerm,
                    name
                )
            ) {
                score -= 500;
            }

            /*
             * Strong bonus when the product contains
             * the requested size.
             */
            const requestedSizes =
                extractSizeTokens(
                    originalSearchTerm
                );

            if (
                requestedSizes.some(
                    (size) =>
                        name.includes(size)
                )
            ) {
                score += 250;
            }

            return {
                product,
                score,
                matchedWords,
                requiredWords:
                    meaningfulWords.length,
            };
        })
        .sort(
            (a, b) =>
                b.score - a.score
        );

    const best = ranked[0];

    if (!best) {
        return null;
    }

    /*
     * Require the majority of meaningful search
     * words to be present.
     *
     * For very short searches, require every word.
     */
    const minimumMatchedWords =
        meaningfulWords.length <= 2
            ? meaningfulWords.length
            : Math.ceil(
                  meaningfulWords.length *
                      0.7
              );

    /*
     * Don't accept a weak result merely because
     * progressive searching found something.
     */
    if (
        best.matchedWords <
        minimumMatchedWords
    ) {
        console.log(
            "Rejected Kroger product: insufficient word match",
            {
                searchTerm:
                    originalSearchTerm,
                product:
                    best.product
                        .description,
                score:
                    best.score,
                matchedWords:
                    best.matchedWords,
                requiredWords:
                    meaningfulWords.length,
            }
        );

        return null;
    }

    /*
     * A hard score floor prevents weak matches.
     */
    if (best.score < 100) {
        console.log(
            "Rejected Kroger product: score too low",
            {
                searchTerm:
                    originalSearchTerm,
                product:
                    best.product
                        .description,
                score:
                    best.score,
            }
        );

        return null;
    }

    /*
     * Reject an explicit size conflict.
     */
    if (
        hasConflictingSize(
            originalSearchTerm,
            String(
                best.product
                    .description ?? ""
            )
        )
    ) {
        console.log(
            "Rejected Kroger product: conflicting size",
            {
                searchTerm:
                    originalSearchTerm,
                product:
                    best.product
                        .description,
            }
        );

        return null;
    }

    console.log(
        "Selected Kroger product:",
        {
            productId:
                best.product
                    .productId,

            description:
                best.product
                    .description,

            brand:
                best.product.brand,

            score:
                best.score,

            matchedWords:
                best.matchedWords,

            requiredWords:
                best.requiredWords,
        }
    );

    return best.product;
}

/*
 * Convert Kroger API product data into the
 * common MatchCart retailer price format.
 */
function convertKrogerProduct(
    product: any
): RetailerPrice | null {
    /*
     * Find the first item that actually has
     * usable pricing.
     */
    const item =
        product.items?.find(
            (candidate: any) =>
                candidate.price
        );

    if (!item) {
        return null;
    }

    const regularPrice =
        item.price?.regular ??
        null;

    const promoPrice =
        item.price?.promo ??
        null;

    const price =
        promoPrice !== null
            ? promoPrice
            : regularPrice;

    if (price === null) {
        return null;
    }

    return {
        externalProductId:
            String(
                product.productId
            ),

        productName:
            product.description ??
            "Unknown Product",

        brand:
            product.brand ??
            null,

        price:

            Number(price),

        regularPrice:
            regularPrice !== null
                ? Number(
                      regularPrice
                  )
                : null,

        promoPrice:
            promoPrice !== null
                ? Number(
                      promoPrice
                  )
                : null,

        currency: "USD",

        source: "kroger",

        updatedAt:
            new Date().toISOString(),
    };
}

export const krogerRetailer: RetailerAdapter =
    {
        async searchProduct(
            productName: string
        ): Promise<RetailerPrice | null> {
            /*
             * Generate progressively broader searches.
             */
            const searches =
                buildProgressiveSearches(
                    productName
                );

            console.log(
                "Kroger progressive searches:",
                searches
            );

            /*
             * Try each search until Kroger returns
             * products.
             */
            for (
                const searchTerm of searches
            ) {
                try {
                    const response =
                        await searchKrogerProducts(
                            searchTerm
                        );

                    const products =
                        response.data ??
                        [];

                    console.log(
                        `Kroger search "${searchTerm}": ${products.length} results`
                    );

                    if (
                        products.length ===
                        0
                    ) {
                        continue;
                    }

                    /*
                     * IMPORTANT:
                     *
                     * We rank against the ORIGINAL
                     * search term, not the relaxed
                     * search term.
                     *
                     * This prevents a fallback search
                     * such as "Milk" from automatically
                     * accepting a random milk product.
                     */
                    const best =
                        getBestKrogerProduct(
                            productName,
                            products
                        );

                    if (!best) {
                        /*
                         * This search returned products,
                         * but none were sufficiently
                         * relevant.
                         *
                         * Continue to the next search.
                         */
                        continue;
                    }

                    const converted =
                        convertKrogerProduct(
                            best
                        );

                    if (!converted) {
                        console.log(
                            "Kroger product had no usable price:",
                            best.description
                        );

                        continue;
                    }

                    return converted;
                } catch (error) {
                    console.error(
                        `Kroger search failed for "${searchTerm}":`,
                        error
                    );

                    /*
                     * Continue trying the next search
                     * instead of failing the entire
                     * comparison.
                     */
                    continue;
                }
            }

            console.log(
                `No sufficiently relevant Kroger product found for "${productName}"`
            );

            return null;
        },

        async getProductPrice(
            externalProductId: string
        ): Promise<RetailerPrice | null> {
            /*
             * Direct product lookup will be added
             * when we build the price refresh system.
             */
            return null;
        },
    };
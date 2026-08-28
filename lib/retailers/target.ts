import {
    searchTargetProducts,
} from "@/lib/target/client";

import type {
    RetailerAdapter,
    RetailerPrice,
} from "@/lib/retailers/types";

type TargetProduct = Awaited<
    ReturnType<typeof searchTargetProducts>
>[number];

const STOP_WORDS = new Set([
    "the",
    "a",
    "an",
    "and",
    "with",
    "for",
    "of",
]);

const SIZE_WORDS = new Set([
    "oz",
    "ounce",
    "ounces",
    "fl",
    "lb",
    "lbs",
    "pound",
    "pounds",
    "gallon",
    "gal",
    "quart",
    "qt",
    "pint",
    "pt",
    "liter",
    "liters",
    "litre",
    "litres",
    "l",
    "ml",
    "count",
    "ct",
    "pack",
    "pk",
]);

const UNRELATED_WORDS = new Set([
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
    "protein",
    "powder",
]);

function normalizeWords(value: string): string[] {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(
            (word) =>
                word.length > 0 &&
                !STOP_WORDS.has(word)
        );
}

function uniqueWords(words: string[]): string[] {
    return Array.from(new Set(words));
}

/**
 * Convert a requested size into ounces.
 */
function getRequestedSize(
    searchTerm: string
): number | null {
    const normalized = searchTerm
        .toLowerCase()
        .replace(/,/g, " ");

    const gallonMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(gallon|gal)\b/
    );

    if (gallonMatch) {
        return Number(gallonMatch[1]) * 128;
    }

    // "gallon" without a number
    if (/\bgallon\b|\bgal\b/.test(normalized)) {
        return 128;
    }

    const quartMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(quart|qt)\b/
    );

    if (quartMatch) {
        return Number(quartMatch[1]) * 32;
    }

    const pintMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(pint|pt)\b/
    );

    if (pintMatch) {
        return Number(pintMatch[1]) * 16;
    }

    const literMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(liter|liters|litre|litres|l)\b/
    );

    if (literMatch) {
        return Number(literMatch[1]) * 33.814;
    }

    const ounceMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(oz|ounce|ounces)\b/
    );

    if (ounceMatch) {
        return Number(ounceMatch[1]);
    }

    const poundMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds)\b/
    );

    if (poundMatch) {
        return Number(poundMatch[1]) * 16;
    }

    const countMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(count|ct)\b/
    );

    if (countMatch) {
        return Number(countMatch[1]);
    }

    return null;
}

/**
 * Extract a product size from a Target title.
 *
 * Everything is normalized to ounces.
 */
function getProductSize(
    title: string
): number | null {
    const normalized = title
        .toLowerCase()
        .replace(/,/g, " ");

    // 128 fl oz
    const ounceMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(?:fl\s*)?(oz|ounce|ounces)\b/
    );

    if (ounceMatch) {
        return Number(ounceMatch[1]);
    }

    // 1 gallon / 1 gal
    const gallonMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(gallon|gal)\b/
    );

    if (gallonMatch) {
        return Number(gallonMatch[1]) * 128;
    }

    // "Gallon" without a number
    if (/\bgallon\b|\bgal\b/.test(normalized)) {
        return 128;
    }

    // 1 quart / 1 qt
    const quartMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(quart|qt)\b/
    );

    if (quartMatch) {
        return Number(quartMatch[1]) * 32;
    }

    // 1 pint / 1 pt
    const pintMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(pint|pt)\b/
    );

    if (pintMatch) {
        return Number(pintMatch[1]) * 16;
    }

    // liters
    const literMatch = normalized.match(
        /(\d+(?:\.\d+)?)\s*(liter|liters|litre|litres|l)\b/
    );

    if (literMatch) {
        return Number(literMatch[1]) * 33.814;
    }

    return null;
}

function getRequiredWords(
    searchTerm: string
): string[] {
    const words = normalizeWords(searchTerm);

    return uniqueWords(words).filter(
        (word) =>
            !SIZE_WORDS.has(word) &&
            !/^\d+(?:\.\d+)?$/.test(word)
    );
}

function getBestTargetProduct(
    searchTerm: string,
    products: TargetProduct[]
): TargetProduct | null {
    const queryWords =
        getRequiredWords(searchTerm);

    if (queryWords.length === 0) {
        return null;
    }

    const requestedSize =
        getRequestedSize(searchTerm);

    console.log(
        "Target matching:",
        {
            searchTerm,
            queryWords,
            requestedSize,
            productCount: products.length,
        }
    );

    const uniqueProducts =
        Array.from(
            new Map(
                products
                    .filter(
                        (product) =>
                            product.tcin &&
                            product.price !== null &&
                            product.price > 0
                    )
                    .map((product) => [
                        product.tcin,
                        product,
                    ])
            ).values()
        );

    /**
     * If the user requested a size, first determine
     * which products actually match that size.
     */
    let candidates = uniqueProducts;

    if (requestedSize !== null) {
        const sizedProducts =
            uniqueProducts.filter((product) => {
                const productSize =
                    getProductSize(product.title);

                if (productSize === null) {
                    return false;
                }

                const ratio =
                    Math.min(
                        requestedSize,
                        productSize
                    ) /
                    Math.max(
                        requestedSize,
                        productSize
                    );

                return ratio >= 0.9;
            });

        console.log(
            "Target size candidates:",
            sizedProducts.map((product) => ({
                title: product.title,
                price: product.price,
                size: getProductSize(
                    product.title
                ),
            }))
        );

        if (sizedProducts.length > 0) {
            candidates = sizedProducts;
        }
    }

    const ranked = candidates
        .map((product) => {
            const name =
                product.title.toLowerCase();

            const nameWords =
                normalizeWords(product.title);

            let score = 0;
            let matchedWords = 0;

            /**
             * Match product words.
             */
            for (const word of queryWords) {
                if (
                    nameWords.includes(word)
                ) {
                    matchedWords++;
                    score += 150;
                } else if (
                    name.includes(word)
                ) {
                    matchedWords++;
                    score += 100;
                }
            }

            /**
             * Reward adjacent phrases.
             *
             * "whole milk" is especially useful.
             */
            for (
                let i = 0;
                i < queryWords.length - 1;
                i++
            ) {
                const phrase =
                    `${queryWords[i]} ${queryWords[i + 1]}`;

                if (name.includes(phrase)) {
                    score += 200;
                }
            }

            /**
             * Exact full phrase.
             */
            const normalizedSearch =
                queryWords.join(" ");

            if (
                name.includes(
                    normalizedSearch
                )
            ) {
                score += 250;
            }

            /**
             * Penalize unrelated products.
             */
            for (
                const word of UNRELATED_WORDS
            ) {
                if (
                    nameWords.includes(word) &&
                    !queryWords.includes(word)
                ) {
                    score -= 200;
                }
            }

            /**
             * Size scoring.
             */
            const productSize =
                getProductSize(product.title);

            if (
                requestedSize !== null &&
                productSize !== null
            ) {
                const sizeRatio =
                    Math.min(
                        requestedSize,
                        productSize
                    ) /
                    Math.max(
                        requestedSize,
                        productSize
                    );

                if (sizeRatio === 1) {
                    score += 1000;
                } else if (
                    sizeRatio >= 0.9
                ) {
                    score += 500;
                } else if (
                    sizeRatio >= 0.7
                ) {
                    score -= 200;
                } else {
                    score -= 800;
                }
            }

            /**
             * Reward matching all product words.
             */
            if (
                matchedWords ===
                queryWords.length
            ) {
                score += 400;
            }

            /**
             * Penalize missing words.
             */
            const missingWords =
                queryWords.length -
                matchedWords;

            score -=
                missingWords * 150;

            return {
                product,
                score,
                matchedWords,
                requiredWords:
                    queryWords.length,
                productSize,
            };
        })
        .sort((a, b) => {
            if (b.score !== a.score) {
                return (
                    b.score - a.score
                );
            }

            return (
                (a.product.price ??
                    Infinity) -
                (b.product.price ??
                    Infinity)
            );
        });

    const best = ranked[0];

    if (!best) {
        console.log(
            `No Target product found for "${searchTerm}"`
        );

        return null;
    }

    /**
     * Require all words for simple searches.
     */
    const minimumMatchedWords =
        queryWords.length <= 2
            ? queryWords.length
            : Math.ceil(
                  queryWords.length * 0.6
              );

    if (
        best.matchedWords <
        minimumMatchedWords
    ) {
        console.log(
            `No sufficiently relevant Target product found for "${searchTerm}"`,
            {
                queryWords,
                bestTitle:
                    best.product.title,
                bestScore:
                    best.score,
                matchedWords:
                    best.matchedWords,
                requiredWords:
                    best.requiredWords,
                minimumMatchedWords,
            }
        );

        return null;
    }

    /**
     * Final size safety check.
     */
    if (
        requestedSize !== null &&
        best.productSize !== null
    ) {
        const sizeRatio =
            Math.min(
                requestedSize,
                best.productSize
            ) /
            Math.max(
                requestedSize,
                best.productSize
            );

        if (sizeRatio < 0.7) {
            console.log(
                `No Target product with an appropriate size found for "${searchTerm}"`,
                {
                    requestedSize,
                    productSize:
                        best.productSize,
                    title:
                        best.product.title,
                }
            );

            return null;
        }
    }

    console.log(
        "Selected Target product:",
        {
            tcin:
                best.product.tcin,
            title:
                best.product.title,
            brand:
                best.product.brand,
            price:
                best.product.price,
            score:
                best.score,
            matchedWords:
                best.matchedWords,
            requiredWords:
                best.requiredWords,
            requestedSize,
            productSize:
                best.productSize,
        }
    );

    return best.product;
}

function convertTargetProduct(
    product: TargetProduct
): RetailerPrice | null {
    if (
        product.price === null ||
        product.price <= 0
    ) {
        return null;
    }

    return {
        externalProductId:
            product.tcin,
        productName:
            product.title,
        brand:
            product.brand,
        price:
            product.price,
        regularPrice: null,
        promoPrice: null,
        currency:
            product.currency,
        source: "target",
        updatedAt:
            new Date().toISOString(),
    };
}

export const targetRetailer:
    RetailerAdapter = {
    async searchProduct(
        productName: string
    ): Promise<RetailerPrice | null> {
        const products =
            await searchTargetProducts(
                productName,
                "77840"
            );

        if (products.length === 0) {
            return null;
        }

        const best =
            getBestTargetProduct(
                productName,
                products
            );

        if (!best) {
            return null;
        }

        return convertTargetProduct(
            best
        );
    },

    async getProductPrice(
        externalProductId: string
    ): Promise<RetailerPrice | null> {
        return null;
    },
};
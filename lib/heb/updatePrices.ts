import {
    saveRetailerPrice,
} from "@/lib/data/priceRepository";

import {
    searchHEBProducts,
    type HebProduct,
} from "./client";

type ProductSize = {
    id: number;
    label: string;
};

type ProductVariant = {
    id: number;
    name: string;
    sizes: ProductSize[];
};

type ProductCatalog = {
    id: number;
    name: string;
    category: string;
    variants: ProductVariant[];
};

type UpdateJob = {
    product: ProductCatalog;
    variant: ProductVariant | null;
    size: ProductSize | null;
};

type HebUpdateResult = {
    productId: number;
    name: string;
    hebProductId: string;
    price: number;
    sizeId: number | null;
};

type HebFailure = {
    product: string;
    reason: string;
};

/*
 * H-E-B store ID for MatchCart.
 */
const HEB_STORE_ID = "543";

/*
 * H-E-B searches return plenty of products.
 * We only need the first page because we rank
 * the returned products ourselves.
 */
const SEARCH_PAGE = 1;

function normalize(
    value: string
) {
    return value
        .toLowerCase()
        .replace(
            /[™®©]/g,
            ""
        )
        .replace(
            /[-–—]/g,
            " "
        )
        .replace(
            /[^\w\s.]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}

function getWords(
    value: string
) {
    return normalize(value)
        .split(" ")
        .filter(Boolean);
}

const COMMON_WORDS =
    new Set([
        "the",
        "a",
        "an",
        "and",
        "with",
        "for",
        "of",
        "in",
        "on",
        "fresh",
        "premium",
        "original",
        "brand",
        "heb",
    ]);

const CONFLICT_GROUPS:
    string[][] = [
        [
            "milk",
            "almond",
            "oat",
            "soy",
            "coconut",
        ],

        [
            "chicken",
            "turkey",
            "beef",
            "pork",
        ],

        [
            "white",
            "brown",
            "black",
            "red",
            "yellow",
            "green",
        ],

        [
            "whole",
            "skim",
            "2",
            "1",
        ],

        [
            "rice",
            "lentils",
            "beans",
            "quinoa",
            "couscous",
            "pasta",
            "noodles",
        ],
    ];

const STRONG_EXTRA_WORDS =
    new Set([
        "lentils",
        "beans",
        "blend",
        "mix",
        "seasoned",
        "flavored",
        "flavor",
        "soup",
        "broth",
        "sauce",
        "snack",
        "chips",
        "crackers",
        "cereal",
        "protein",
        "powder",
        "bar",
        "bars",
        "drink",
        "juice",
        "frozen",
        "microwavable",
        "microwave",
        "instant",
        "ready",
        "organic",
    ]);

function hasConflict(
    searchWords: string[],
    resultWords: string[]
) {
    for (
        const group of
        CONFLICT_GROUPS
    ) {
        const searchGroupWords =
            searchWords.filter(
                (word) =>
                    group.includes(
                        word
                    )
            );

        const resultGroupWords =
            resultWords.filter(
                (word) =>
                    group.includes(
                        word
                    )
            );

        if (
            searchGroupWords.length ===
                0 ||
            resultGroupWords.length ===
                0
        ) {
            continue;
        }

        for (
            const searchWord of
            searchGroupWords
        ) {
            for (
                const resultWord of
                resultGroupWords
            ) {
                if (
                    searchWord !==
                    resultWord
                ) {
                    return true;
                }
            }
        }
    }

    return false;
}

function scoreHebProduct(
    searchTerm: string,
    product: HebProduct
) {
    const normalizedSearch =
        normalize(
            searchTerm
        );

    const normalizedName =
        normalize(
            product.name
        );

    const searchWords =
        getWords(
            normalizedSearch
        ).filter(
            (word) =>
                !COMMON_WORDS.has(
                    word
                )
        );

    const resultWords =
        getWords(
            normalizedName
        );

    if (
        searchWords.length ===
        0
    ) {
        return {
            score: 0,
            valid: false,
        };
    }

    if (
        normalizedName ===
        normalizedSearch
    ) {
        return {
            score: 10000,
            valid: true,
        };
    }

    if (
        hasConflict(
            searchWords,
            resultWords
        )
    ) {
        return {
            score: -10000,
            valid: false,
        };
    }

    const matchedWords =
        searchWords.filter(
            (word) =>
                resultWords.includes(
                    word
                )
        );

    /*
     * Require every meaningful search
     * word to appear in the H-E-B name.
     */
    if (
        matchedWords.length !==
        searchWords.length
    ) {
        return {
            score: -5000,
            valid: false,
        };
    }

    let score = 0;

    score +=
        matchedWords.length *
        1000;

    if (
        normalizedName.includes(
            normalizedSearch
        )
    ) {
        score += 1500;
    }

    if (
        normalizedName.startsWith(
            normalizedSearch
        )
    ) {
        score += 1200;
    }

    const extraWords =
        resultWords.filter(
            (word) =>
                !searchWords.includes(
                    word
                ) &&
                STRONG_EXTRA_WORDS.has(
                    word
                )
        );

    score -=
        extraWords.length *
        700;

    const unrelatedWords =
        resultWords.filter(
            (word) =>
                !searchWords.includes(
                    word
                )
        ).length;

    score -= Math.min(
        unrelatedWords * 50,
        500
    );

    if (
        resultWords.length <=
        searchWords.length + 3
    ) {
        score += 500;
    }

    const firstWords =
        resultWords.slice(
            0,
            searchWords.length +
                3
        );

    const earlyMatches =
        searchWords.filter(
            (word) =>
                firstWords.includes(
                    word
                )
        ).length;

    score +=
        earlyMatches * 150;

    if (
        product.in_stock
    ) {
        score += 300;
    } else {
        score -= 500;
    }

    /*
     * H-E-B own-brand products are often
     * exactly what we want for generic
     * grocery searches.
     */
    if (
        product.is_own_brand
    ) {
        score += 100;
    }

    return {
        score,
        valid: score > 0,
    };
}

function chooseBestHebMatch(
    searchTerm: string,
    products: HebProduct[]
) {
    const ranked =
        products
            .map(
                (product) => {
                    const match =
                        scoreHebProduct(
                            searchTerm,
                            product
                        );

                    return {
                        product,
                        score:
                            match.score,
                        valid:
                            match.valid,
                    };
                }
            )
            .filter(
                (item) =>
                    item.valid
            )
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            );

    console.log(
        "H-E-B match ranking:",
        ranked
            .slice(0, 5)
            .map(
                (item) => ({
                    productId:
                        item.product
                            .id,
                    name:
                        item.product
                            .name,
                    price:
                        item.product
                            .price,
                    size:
                        item.product
                            .size,
                    score:
                        item.score,
                })
            )
    );

    return (
        ranked[0]?.product ??
        null
    );
}

function getHebPrice(
    product: HebProduct
) {
    const effectivePrice =
        product.is_on_sale &&
        product.sale_price !==
            null
            ? product.sale_price
            : product.price;

    if (
        effectivePrice ===
            null ||
        !Number.isFinite(
            Number(
                effectivePrice
            )
        ) ||
        Number(
            effectivePrice
        ) < 0
    ) {
        return null;
    }

    return Number(
        effectivePrice
    );
}

async function updateSingleHebProduct(
    job: UpdateJob
): Promise<{
    result?: HebUpdateResult;
    failure?: HebFailure;
}> {
    const {
        product,
        variant,
        size,
    } = job;

    const displayParts = [
        product.name,
    ];

    if (variant) {
        displayParts.push(
            variant.name
        );
    }

    if (size) {
        displayParts.push(
            `(${size.label})`
        );
    }

    const displayName =
        displayParts.join(
            " - "
        );

    try {
        const searchParts: string[] =
            [];

        if (variant) {
            searchParts.push(
                variant.name
            );
        } else {
            searchParts.push(
                product.name
            );
        }

        if (size) {
            searchParts.push(
                size.label
            );
        }

        const searchTerm =
            searchParts.join(
                " "
            );

        console.log(
            `\n--- Processing H-E-B: ${displayName} ---`
        );

        console.log(
            "H-E-B search term:",
            searchTerm
        );

        let searchResponse;

        try {
            searchResponse =
                await searchHEBProducts(
                    searchTerm,
                    HEB_STORE_ID,
                    SEARCH_PAGE
                );
        } catch (error) {
            return {
                failure: {
                    product:
                        displayName,

                    reason:
                        `H-E-B API unavailable: ${
                            error instanceof
                            Error
                                ? error.message
                                : "Unknown API error"
                        }`,
                },
            };
        }

        const products =
            searchResponse.products ??
            [];

        if (
            products.length ===
            0
        ) {
            return {
                failure: {
                    product:
                        displayName,

                    reason:
                        "H-E-B API worked, but no products were found",
                },
            };
        }

        const match =
            chooseBestHebMatch(
                searchTerm,
                products
            );

        if (!match) {
            return {
                failure: {
                    product:
                        displayName,

                    reason:
                        "H-E-B API worked, but no sufficiently close product match was found",
                },
            };
        }

        if (
            !match.in_stock
        ) {
            return {
                failure: {
                    product:
                        displayName,

                    reason:
                        "H-E-B product was found but is currently out of stock",
                },
            };
        }

        const price =
            getHebPrice(
                match
            );

        if (
            price === null
        ) {
            return {
                failure: {
                    product:
                        displayName,

                    reason:
                        "H-E-B product was found, but no usable price was returned",
                },
            };
        }

        console.log(
            "Selected H-E-B product:",
            {
                productId:
                    match.id,

                name:
                    match.name,

                brand:
                    match.brand,

                size:
                    match.size,

                price,

                salePrice:
                    match.sale_price,

                isOnSale:
                    match.is_on_sale,
            }
        );

        const regularPrice =
            match.is_on_sale &&
            match.price !== null
                ? Number(
                      match.price
                  )
                : price;

        const promoPrice =
            match.is_on_sale
                ? price
                : null;

        await saveRetailerPrice(
            product.id,
            Number(
                HEB_STORE_ID
            ),
            size?.id ?? null,
            {
                externalProductId:
                    match.id,

                productName:
                    match.name,

                brand:
                    match.brand,

                price,

                regularPrice,

                promoPrice,

                currency:
                    "USD",

                source:
                    "heb-api",

                updatedAt:
                    new Date().toISOString(),
            }
        );

        console.log(
            `H-E-B SUCCESS: ${displayName} -> $${price.toFixed(
                2
            )}`
        );

        return {
            result: {
                productId:
                    product.id,

                name:
                    displayName,

                hebProductId:
                    match.id,

                price,

                sizeId:
                    size?.id ??
                    null,
            },
        };
    } catch (error) {
        return {
            failure: {
                product:
                    displayName,

                reason:
                    error instanceof
                    Error
                        ? error.message
                        : "Unknown error",
            },
        };
    }
}

export async function updateHebPrices(
    products: ProductCatalog[]
) {
    const results:
        HebUpdateResult[] =
        [];

    const failures:
        HebFailure[] =
        [];

    const jobs:
        UpdateJob[] =
        [];

    /*
     * Flatten the MatchCart catalog
     * into individual price jobs.
     */
    for (
        const product of products
    ) {
        if (
            product.variants
                ?.length > 0
        ) {
            for (
                const variant of
                product.variants
            ) {
                if (
                    variant.sizes
                        ?.length > 0
                ) {
                    for (
                        const size of
                        variant.sizes
                    ) {
                        jobs.push({
                            product,
                            variant,
                            size,
                        });
                    }
                } else {
                    jobs.push({
                        product,
                        variant,
                        size:
                            null,
                    });
                }
            }
        } else {
            jobs.push({
                product,
                variant:
                    null,
                size:
                    null,
            });
        }
    }

    console.log(
        "H-E-B products received:",
        products.length
    );

    console.log(
        "Total H-E-B price jobs:",
        jobs.length
    );

    console.log(
        "H-E-B store ID:",
        HEB_STORE_ID
    );

    /*
     * Run sequentially to avoid
     * burning Parse credits too quickly.
     */
    for (
        let i = 0;
        i < jobs.length;
        i++
    ) {
        const job =
            jobs[i];

        console.log(
            `\nProcessing H-E-B job ${
                i + 1
            }-${jobs.length}`
        );

        const result =
            await updateSingleHebProduct(
                job
            );

        if (
            result.result
        ) {
            results.push(
                result.result
            );
        }

        if (
            result.failure
        ) {
            failures.push(
                result.failure
            );
        }
    }

    console.log(
        "\n=============================="
    );

    console.log(
        "H-E-B PRICE UPDATE COMPLETE"
    );

    console.log(
        "=============================="
    );

    console.log(
        "Successful:",
        results.length
    );

    console.log(
        "Failed:",
        failures.length
    );

    if (
        failures.length > 0
    ) {
        console.log(
            "\nH-E-B failures:"
        );

        console.log(
            JSON.stringify(
                failures,
                null,
                2
            )
        );
    }

    return {
        results,
        failures,
    };
}

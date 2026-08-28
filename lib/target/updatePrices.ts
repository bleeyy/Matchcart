import {
    saveRetailerPrice,
} from "@/lib/data/priceRepository";

import {
    searchTargetProducts,
    type TargetProduct,
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

type TargetUpdateResult = {
    productId: number;
    name: string;
    targetProductId: string;
    price: number;
    sizeId: number | null;
};

type TargetFailure = {
    product: string;
    reason: string;
};

const TARGET_STORE_ID = 3;

function normalize(value: string): string {
    return value
        .toLowerCase()
        .replace(/[™®©]/g, "")
        .replace(/[-–—]/g, " ")
        .replace(/[^\w\s.]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function getWords(value: string): string[] {
    return normalize(value)
        .split(" ")
        .filter(Boolean);
}

const COMMON_WORDS = new Set([
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
]);

const CONFLICT_GROUPS: string[][] = [
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

const STRONG_EXTRA_WORDS = new Set([
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
): boolean {
    for (const group of CONFLICT_GROUPS) {
        const searchGroupWords =
            searchWords.filter((word) =>
                group.includes(word)
            );

        const resultGroupWords =
            resultWords.filter((word) =>
                group.includes(word)
            );

        if (
            searchGroupWords.length === 0 ||
            resultGroupWords.length === 0
        ) {
            continue;
        }

        for (const searchWord of searchGroupWords) {
            for (const resultWord of resultGroupWords) {
                if (searchWord !== resultWord) {
                    return true;
                }
            }
        }
    }

    return false;
}

function scoreTargetProduct(
    searchTerm: string,
    product: TargetProduct
): number {
    const normalizedSearch =
        normalize(searchTerm);

    const normalizedName =
        normalize(product.title);

    const searchWords =
        getWords(searchTerm).filter(
            (word) =>
                !COMMON_WORDS.has(word)
        );

    const resultWords =
        getWords(product.title);

    if (searchWords.length === 0) {
        return -10000;
    }

    if (
        normalizedName ===
        normalizedSearch
    ) {
        return 10000;
    }

    if (
        hasConflict(
            searchWords,
            resultWords
        )
    ) {
        return -10000;
    }

    const matchedWords =
        searchWords.filter((word) =>
            resultWords.includes(word)
        );

    if (
        matchedWords.length !==
        searchWords.length
    ) {
        return -5000;
    }

    let score = 0;

    score +=
        matchedWords.length * 1000;

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
                !searchWords.includes(word) &&
                STRONG_EXTRA_WORDS.has(word)
        );

    score -=
        extraWords.length * 700;

    const unrelatedWords =
        resultWords.filter(
            (word) =>
                !searchWords.includes(word)
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
            searchWords.length + 3
        );

    const earlyMatches =
        searchWords.filter((word) =>
            firstWords.includes(word)
        ).length;

    score +=
        earlyMatches * 150;

    return score;
}

function chooseBestTargetMatch(
    searchTerm: string,
    products: TargetProduct[]
): TargetProduct | null {
    const ranked = products
        .map((product) => ({
            product,
            score:
                scoreTargetProduct(
                    searchTerm,
                    product
                ),
        }))
        .filter(
            (item) =>
                item.score > 0
        )
        .sort(
            (a, b) =>
                b.score - a.score
        );

    console.log(
        "Target match ranking:",
        ranked.slice(0, 5).map(
            (item) => ({
                tcin:
                    item.product.tcin,
                title:
                    item.product.title,
                price:
                    item.product.price,
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

function buildSearchTerm(
    job: UpdateJob
): string {
    const {
        product,
        variant,
        size,
    } = job;

    const parts: string[] = [];

    if (variant) {
        parts.push(product.name);
        parts.push(variant.name);
    } else {
        parts.push(product.name);
    }

    if (size) {
        parts.push(size.label);
    }

    return parts.join(" ");
}

async function updateSingleTargetProduct(
    job: UpdateJob,
    zipCode: string
): Promise<{
    result?: TargetUpdateResult;
    failure?: TargetFailure;
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
        displayParts.join(" - ");

    try {
        const searchTerm =
            buildSearchTerm(job);

        console.log(
            `\n--- Processing Target: ${displayName} ---`
        );

        console.log(
            "Target search term:",
            searchTerm
        );

        let products: TargetProduct[];

        try {
            products =
                await searchTargetProducts(
                    searchTerm,
                    zipCode
                );
        } catch (error) {
            return {
                failure: {
                    product:
                        displayName,

                    reason:
                        `Target API unavailable: ${
                            error instanceof Error
                                ? error.message
                                : "Unknown API error"
                        }`,
                },
            };
        }

        if (
            products.length === 0
        ) {
            return {
                failure: {
                    product:
                        displayName,

                    reason:
                        "Target API worked, but no products were found",
                },
            };
        }

        const match =
            chooseBestTargetMatch(
                searchTerm,
                products
            );

        if (!match) {
            return {
                failure: {
                    product:
                        displayName,

                    reason:
                        "Target API worked, but no sufficiently close product match was found",
                },
            };
        }

        if (
            match.price === null ||
            match.price <= 0
        ) {
            return {
                failure: {
                    product:
                        displayName,

                    reason:
                        "Target product was found, but no usable price was returned",
                },
            };
        }

        console.log(
            "Selected Target product:",
            {
                tcin:
                    match.tcin,

                title:
                    match.title,

                brand:
                    match.brand,

                price:
                    match.price,
            }
        );

        await saveRetailerPrice(
            product.id,
            TARGET_STORE_ID,
            variant?.id ?? null,
            size?.id ?? null,
            {
                externalProductId:
                    match.tcin,

                productName:
                    match.title,

                brand:
                    match.brand,

                price:
                    match.price,

                regularPrice:
                    match.price,

                promoPrice:
                    null,

                currency:
                    match.currency,

                source:
                    "target-api",

                updatedAt:
                    new Date().toISOString(),
            }
        );

        console.log(
            `TARGET SUCCESS: ${displayName} -> $${match.price.toFixed(
                2
            )}`
        );

        return {
            result: {
                productId:
                    product.id,

                name:
                    displayName,

                targetProductId:
                    match.tcin,

                price:
                    match.price,

                sizeId:
                    size?.id ?? null,
            },
        };
    } catch (error) {
        return {
            failure: {
                product:
                    displayName,

                reason:
                    error instanceof Error
                        ? error.message
                        : "Unknown API error",
            },
        };
    }
}

export async function updateTargetPrices(
    products: ProductCatalog[]
) {
    const zipCode =
        process.env.TARGET_ZIP_CODE;

    if (!zipCode) {
        throw new Error(
            "Missing TARGET_ZIP_CODE."
        );
    }

    const results:
        TargetUpdateResult[] = [];

    const failures:
        TargetFailure[] = [];

    const jobs:
        UpdateJob[] = [];

    for (const product of products) {
        if (
            product.variants?.length > 0
        ) {
            for (const variant of product.variants) {
                if (
                    variant.sizes?.length > 0
                ) {
                    for (const size of variant.sizes) {
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
                        size: null,
                    });
                }
            }
        } else {
            jobs.push({
                product,
                variant: null,
                size: null,
            });
        }
    }

    console.log(
        "Target products received:",
        products.length
    );

    console.log(
        "Total Target price jobs:",
        jobs.length
    );

    console.log(
        "Target ZIP:",
        zipCode
    );

    for (
        let i = 0;
        i < jobs.length;
        i++
    ) {
        const job =
            jobs[i];

        console.log(
            `\nProcessing Target job ${
                i + 1
            }-${jobs.length}`
        );

        const result =
            await updateSingleTargetProduct(
                job,
                zipCode
            );

        if (result.result) {
            results.push(
                result.result
            );
        }

        if (result.failure) {
            failures.push(
                result.failure
            );
        }
    }

    console.log(
        "\n=============================="
    );

    console.log(
        "TARGET PRICE UPDATE COMPLETE"
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
            "\nTarget failures:"
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
import { saveRetailerPrice } from "@/lib/data/priceRepository";
import {
    searchAldiProducts,
    type AldiProduct,
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

type AldiUpdateResult = {
    productId: number;
    name: string;
    aldiProductId: string;
    price: number;
    sizeId: number | null;
};

type AldiFailure = {
    product: string;
    reason: string;
};

const ALDI_STORE_ID = 2;

/*
 * Keep Aldi requests small because the API has
 * finite credits.
 */
const SEARCH_LIMIT = 5;

/*
 * Normalize text before comparing products.
 */
function normalize(value: string) {
    return value
        .toLowerCase()
        .replace(/[™®©]/g, "")
        .replace(/[-–—]/g, " ")
        .replace(/[^\w\s.]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function getWords(value: string) {
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
) {
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

function scoreAldiProduct(
    searchTerm: string,
    product: AldiProduct
) {
    const normalizedSearch =
        normalize(searchTerm);

    const normalizedName =
        normalize(product.name);

    const searchWords = getWords(
        normalizedSearch
    ).filter(
        (word) => !COMMON_WORDS.has(word)
    );

    const resultWords =
        getWords(normalizedName);

    if (searchWords.length === 0) {
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
        searchWords.filter((word) =>
            resultWords.includes(word)
        );

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

    if (product.available) {
        score += 300;
    } else {
        score -= 500;
    }

    return {
        score,
        valid: score > 0,
    };
}

function chooseBestAldiMatch(
    searchTerm: string,
    products: AldiProduct[]
) {
    const ranked = products
        .map((product) => {
            const match =
                scoreAldiProduct(
                    searchTerm,
                    product
                );

            return {
                product,
                score: match.score,
                valid: match.valid,
            };
        })
        .filter(
            (item) => item.valid
        )
        .sort(
            (a, b) =>
                b.score - a.score
        );

    console.log(
        "Aldi match ranking:",
        ranked.slice(0, 5).map(
            (item) => ({
                productId:
                    item.product
                        .product_id,
                name:
                    item.product.name,
                price:
                    item.product.price,
                size:
                    item.product.size,
                score:
                    item.score,
            })
        )
    );

    return ranked[0]?.product ?? null;
}

function parsePrice(
    product: AldiProduct
) {
    const price =
        Number(product.price);

    if (
        !Number.isFinite(price) ||
        price < 0
    ) {
        return null;
    }

    return price;
}

async function updateSingleAldiProduct(
    job: UpdateJob,
    zipCode: string
): Promise<{
    result?: AldiUpdateResult;
    failure?: AldiFailure;
    apiUnavailable?: boolean;
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
        searchParts.join(" ");

    console.log(
        `\n--- Processing Aldi: ${displayName} ---`
    );

    console.log(
        "Aldi search term:",
        searchTerm
    );

    /*
     * Search Aldi.
     *
     * If the API itself fails, mark the entire
     * retailer as unavailable.
     */
    let searchResponse;

    try {
        searchResponse =
            await searchAldiProducts(
                searchTerm,
                zipCode,
                SEARCH_LIMIT
            );
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unknown Aldi API error";

        console.error(
            "ALDI API unavailable:",
            message
        );

        return {
            apiUnavailable: true,

            failure: {
                product:
                    displayName,

                reason:
                    `Aldi API unavailable: ${message}`,
            },
        };
    }

    const products =
        searchResponse.products ?? [];

    if (products.length === 0) {
        return {
            failure: {
                product:
                    displayName,

                reason:
                    "Aldi API worked, but no products were found",
            },
        };
    }

    const match =
        chooseBestAldiMatch(
            searchTerm,
            products
        );

    if (!match) {
        return {
            failure: {
                product:
                    displayName,

                reason:
                    "Aldi API worked, but no sufficiently close product match was found",
            },
        };
    }

    const price =
        parsePrice(match);

    if (price === null) {
        return {
            failure: {
                product:
                    displayName,

                reason:
                    "Aldi product was found, but no usable price was returned",
            },
        };
    }

    if (!match.available) {
        return {
            failure: {
                product:
                    displayName,

                reason:
                    "Aldi product was found but is currently unavailable",
            },
        };
    }

    console.log(
        "Selected Aldi product:",
        {
            productId:
                match.product_id,

            name:
                match.name,

            brand:
                match.brand,

            size:
                match.size,

            price,
        }
    );

    await saveRetailerPrice(
        product.id,
        ALDI_STORE_ID,
        size?.id ?? null,
        {
            externalProductId:
                match.product_id,

            productName:
                match.name,

            brand:
                match.brand,

            price,

            regularPrice:
                price,

            promoPrice:
                null,

            currency:
                "USD",

            source:
                "aldi-api",

            updatedAt:
                new Date().toISOString(),
        }
    );

    console.log(
        `ALDI SUCCESS: ${displayName} -> $${price.toFixed(
            2
        )}`
    );

    return {
        result: {
            productId:
                product.id,

            name:
                displayName,

            aldiProductId:
                match.product_id,

            price,

            sizeId:
                size?.id ?? null,
        },
    };
}

export async function updateAldiPrices(
    products: ProductCatalog[]
) {
    const zipCode =
        process.env.ALDI_ZIP_CODE;

    if (!zipCode) {
        throw new Error(
            "Missing ALDI_ZIP_CODE."
        );
    }

    const results:
        AldiUpdateResult[] = [];

    const failures:
        AldiFailure[] = [];

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
        "Aldi products received:",
        products.length
    );

    console.log(
        "Total Aldi price jobs:",
        jobs.length
    );

    console.log(
        "Aldi ZIP:",
        zipCode
    );

    /*
     * IMPORTANT:
     *
     * Process requests one at a time.
     *
     * If the API becomes unavailable, immediately
     * stop making requests so we don't waste
     * additional API credits.
     */
    let apiUnavailable = false;
    let apiError:
        | string
        | null = null;

    for (
        let i = 0;
        i < jobs.length;
        i++
    ) {
        const job = jobs[i];

        console.log(
            `\nProcessing Aldi job ${
                i + 1
            }-${jobs.length}`
        );

        const result =
            await updateSingleAldiProduct(
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

        /*
         * The API itself failed.
         *
         * Do NOT continue making requests.
         */
        if (result.apiUnavailable) {
            apiUnavailable = true;

            apiError =
                result.failure?.reason ??
                "Aldi API unavailable.";

            console.log(
                "\nALDI API IS UNAVAILABLE."
            );

            console.log(
                "Stopping remaining Aldi requests to preserve API credits."
            );

            break;
        }
    }

    /*
     * If the API became unavailable halfway through,
     * mark all remaining jobs as unavailable instead
     * of pretending they were missing products.
     */
    if (
        apiUnavailable &&
        jobs.length > results.length + failures.length
    ) {
        const processedJobs =
            results.length +
            failures.length;

        for (
            let i = processedJobs;
            i < jobs.length;
            i++
        ) {
            const job =
                jobs[i];

            const displayParts = [
                job.product.name,
            ];

            if (job.variant) {
                displayParts.push(
                    job.variant.name
                );
            }

            if (job.size) {
                displayParts.push(
                    `(${job.size.label})`
                );
            }

            failures.push({
                product:
                    displayParts.join(
                        " - "
                    ),

                reason:
                    "Aldi API unavailable — request skipped to preserve API credits",
            });
        }
    }

    console.log(
        "\n=============================="
    );

    console.log(
        "ALDI PRICE UPDATE COMPLETE"
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

    console.log(
        "API unavailable:",
        apiUnavailable
    );

    if (apiError) {
        console.log(
            "API error:",
            apiError
        );
    }

    if (failures.length > 0) {
        console.log(
            "\nAldi failures:"
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
        apiUnavailable,
        apiError,
    };
}
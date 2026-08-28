const TARGET_API_URL =
    "https://api.parse.bot/scraper/9935e57e-18c2-4c7c-aebe-bc311e983dc8/search_products";

const REQUEST_TIMEOUT_MS = 15000;

export type TargetProduct = {
    tcin: string;
    title: string;
    brand: string | null;

    price: number | null;
    regularPrice: number | null;
    promoPrice: number | null;

    currency: string;

    imageUrl: string | null;
    productUrl: string | null;
};

type TargetApiProduct = {
    tcin?: string;
    title?: string;
    brand?: string | null;

    price?: string | number | null;
    regular_price?: string | number | null;
    current_retail?: number | null;

    image_url?: string | null;
    url?: string | null;

    item_type?: string | null;
};

type TargetSearchResponse = {
    count?: number;
    offset?: number;
    keyword?: string;

    products?: TargetApiProduct[];

    total_pages?: number;
    current_page?: number;
    total_results?: number;
};

function parsePrice(
    value: string | number | null | undefined
): number | null {
    if (typeof value === "number") {
        return Number.isFinite(value)
            ? value
            : null;
    }

    if (typeof value === "string") {
        const cleaned = value
            .replace("$", "")
            .replace(",", "")
            .trim();

        const parsed = Number(cleaned);

        return Number.isFinite(parsed)
            ? parsed
            : null;
    }

    return null;
}

/**
 * Normalize text for product matching.
 */
function normalizeText(
    value: string
): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Get useful search words.
 */
function getSearchWords(
    value: string
): string[] {
    return normalizeText(value)
        .split(" ")
        .filter(
            (word) =>
                word.length > 1
        );
}

/**
 * Calculate how closely a Target product
 * matches the user's search.
 */
function calculateMatchScore(
    searchTerm: string,
    product: TargetProduct
): number {
    const searchWords =
        getSearchWords(
            searchTerm
        );

    const titleWords =
        new Set(
            getSearchWords(
                product.title
            )
        );

    if (
        searchWords.length === 0
    ) {
        return 0;
    }

    let matchedWords = 0;

    for (const word of searchWords) {
        if (titleWords.has(word)) {
            matchedWords++;
        }
    }

    let score =
        matchedWords /
        searchWords.length;

    const normalizedSearch =
        normalizeText(
            searchTerm
        );

    const normalizedTitle =
        normalizeText(
            product.title
        );

    /*
     * Give a bonus when the entire
     * search phrase appears in the
     * Target product title.
     */
    if (
        normalizedTitle.includes(
            normalizedSearch
        )
    ) {
        score += 0.25;
    }

    /*
     * Prefer products whose title
     * starts with the search.
     */
    if (
        normalizedTitle.startsWith(
            normalizedSearch
        )
    ) {
        score += 0.15;
    }

    /*
     * Prefer products that have
     * a usable price.
     */
    if (
        product.price !== null &&
        product.price > 0
    ) {
        score += 0.05;
    }

    return score;
}

/**
 * Choose the best Target product from
 * the results returned by search_products.
 *
 * A minimum score prevents something
 * completely unrelated from being selected.
 */
export function chooseBestTargetMatch(
    searchTerm: string,
    products: TargetProduct[]
): TargetProduct | null {
    if (
        products.length === 0
    ) {
        return null;
    }

    let bestProduct:
        TargetProduct | null = null;

    let bestScore = 0;

    for (const product of products) {
        const score =
            calculateMatchScore(
                searchTerm,
                product
            );

        console.log(
            "Target match:",
            {
                searchTerm,
                title:
                    product.title,
                score:
                    score.toFixed(3),
            }
        );

        if (
            score > bestScore
        ) {
            bestScore =
                score;

            bestProduct =
                product;
        }
    }

    /*
     * Require at least 40% of the
     * search words to match.
     *
     * This prevents a random Target
     * product from being selected.
     */
    if (
        !bestProduct ||
        bestScore < 0.40
    ) {
        console.warn(
            "No sufficiently relevant Target product found:",
            {
                searchTerm,
                bestScore,
            }
        );

        return null;
    }

    return bestProduct;
}

/**
 * Make a request to the Parse.bot Target API.
 */
async function targetRequest(
    params: Record<
        string,
        string | number
    >
): Promise<TargetSearchResponse> {
    const apiKey =
        process.env.PARSE_API_KEY?.trim();

    if (!apiKey) {
        throw new Error(
            "Missing PARSE_API_KEY environment variable."
        );
    }

    const searchParams =
        new URLSearchParams();

    for (
        const [
            key,
            value,
        ] of Object.entries(params)
    ) {
        searchParams.set(
            key,
            String(value)
        );
    }

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () =>
                controller.abort(),
            REQUEST_TIMEOUT_MS
        );

    try {
        const response =
            await fetch(
                `${TARGET_API_URL}?${searchParams.toString()}`,
                {
                    method: "GET",

                    headers: {
                        "X-API-Key":
                            apiKey,

                        "API-Snapshot-Version":
                            "12",

                        Accept:
                            "application/json",
                    },

                    signal:
                        controller.signal,

                    cache:
                        "no-store",
                }
            );

        const responseText =
            await response.text();

        if (
            !response.ok
        ) {
            throw new Error(
                `Target API error: ${response.status} ${responseText}`
            );
        }

        let json: unknown;

        try {
            json =
                JSON.parse(
                    responseText
                );
        } catch {
            throw new Error(
                "Target API returned invalid JSON."
            );
        }

        if (
            typeof json !==
                "object" ||
            json === null
        ) {
            throw new Error(
                "Target API returned an invalid response."
            );
        }

        const root =
            json as Record<
                string,
                unknown
            >;

        /*
         * Parse.bot normally returns:
         *
         * {
         *   data: {
         *     products: [...]
         *   },
         *   status: "success"
         * }
         *
         * Support both that format
         * and a direct data response.
         */
        const data =
            root.data &&
            typeof root.data ===
                "object"
                ? root.data
                : root;

        return data as TargetSearchResponse;
    } catch (error) {
        if (
            error instanceof
                DOMException &&
            error.name ===
                "AbortError"
        ) {
            throw new Error(
                "Target API request timed out."
            );
        }

        if (
            error instanceof Error
        ) {
            throw error;
        }

        throw new Error(
            "Unknown Target API error."
        );
    } finally {
        clearTimeout(
            timeout
        );
    }
}

/**
 * Search Target products.
 *
 * The Target Parse API accepts:
 *
 * keyword
 * zip
 * count
 * offset
 * sort_by
 * title
 *
 * The third argument is accepted for
 * compatibility with update-prices/target.ts.
 * Target itself limits count to 24.
 */
export async function searchTargetProducts(
    searchTerm: string,
    zipcode?: string,
    limit: number = 24
): Promise<TargetProduct[]> {
    const trimmedSearch =
        searchTerm.trim();

    if (!trimmedSearch) {
        return [];
    }

    console.log(
        "Target search:",
        trimmedSearch
    );

    try {
        const safeLimit =
            Math.min(
                Math.max(
                    limit,
                    1
                ),
                24
            );

        const params: Record<
            string,
            string | number
        > = {
            keyword:
                trimmedSearch,

            count:
                safeLimit,

            offset: 0,

            sort_by:
                "relevance",
        };

        if (zipcode) {
            params.zip =
                zipcode;
        }

        const data =
            await targetRequest(
                params
            );

        const products =
            Array.isArray(
                data.products
            )
                ? data.products
                : [];

        const parsedProducts =
            products
                .map(
                    (
                        product: TargetApiProduct
                    ): TargetProduct | null => {
                        const tcin =
                            typeof product.tcin ===
                            "string"
                                ? product.tcin
                                : "";

                        const title =
                            typeof product.title ===
                            "string"
                                ? product.title
                                : "";

                        if (
                            !tcin ||
                            !title
                        ) {
                            return null;
                        }

                        /*
                         * current_retail is the
                         * clean numeric price
                         * returned by Target.
                         */
                        const currentRetail =
                            parsePrice(
                                product.current_retail
                            );

                        const regularPrice =
                            parsePrice(
                                product.regular_price
                            );

                        const directPrice =
                            parsePrice(
                                product.price
                            );

                        /*
                         * Prefer current_retail,
                         * then price.
                         */
                        const price =
                            currentRetail ??
                            directPrice ??
                            regularPrice;

                        if (
                            price ===
                                null ||
                            price <= 0
                        ) {
                            return null;
                        }

                        /*
                         * If Target gives a
                         * regular price higher
                         * than the current price,
                         * treat the current price
                         * as a promotion.
                         */
                        const promoPrice =
                            regularPrice !==
                                null &&
                            price <
                                regularPrice
                                ? price
                                : null;

                        return {
                            tcin,

                            title,

                            brand:
                                typeof product.brand ===
                                "string"
                                    ? product.brand
                                    : null,

                            price,

                            regularPrice:
                                regularPrice ??
                                price,

                            promoPrice,

                            currency:
                                "USD",

                            imageUrl:
                                typeof product.image_url ===
                                "string"
                                    ? product.image_url
                                    : null,

                            productUrl:
                                typeof product.url ===
                                "string"
                                    ? product.url
                                    : null,
                        };
                    }
                )
                .filter(
                    (
                        product
                    ): product is TargetProduct =>
                        product !== null
                );

        console.log(
            `Target search "${trimmedSearch}": ${parsedProducts.length} usable results`
        );

        return parsedProducts;
    } catch (error) {
        console.error(
            `Target search "${trimmedSearch}" failed:`,
            error instanceof Error
                ? error.message
                : error
        );

        return [];
    }
}

/**
 * Get a specific Target product.
 *
 * This is not currently used by
 * updateTargetPrices, but is provided
 * for future product-detail lookups.
 */
export async function getTargetProduct(
    tcin: string,
    zipcode?: string
): Promise<TargetProduct | null> {
    /*
     * The current Target API has a
     * separate get_product endpoint.
     *
     * This function intentionally isn't
     * implemented through search_products,
     * because the endpoint has a different
     * URL and response structure.
     *
     * Use searchTargetProducts when
     * updating prices for now.
     */
    console.warn(
        "getTargetProduct is not implemented through search_products.",
        {
            tcin,
            zipcode,
        }
    );

    return null;
}
const PARSE_BASE_URL =
    "https://api.parse.bot/scraper/31f011bb-8718-4424-bcff-0f9f6bb1b28a";

export type AldiProduct = {
    name: string;
    price: string;
    size: string | null;
    brand: string | null;
    sale: unknown | null;
    available: boolean;
    image_url: string | null;
    product_id: string;
    product_url: string | null;
    pricing_unit: string | null;
    stock_status: string | null;
    price_display: string | null;
};

export type AldiSearchResponse = {
    query: string;
    products: AldiProduct[];
    zip_code: string;
    total_results: number;
};

export async function searchAldiProducts(
    query: string,
    zipCode: string,
    limit: number = 10
): Promise<AldiSearchResponse> {
    const apiKey = process.env.PARSE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "Missing PARSE_API_KEY environment variable"
        );
    }

    const params = new URLSearchParams();

    params.set("query", query);
    params.set("zip_code", zipCode);
    params.set(
        "limit",
        Math.min(limit, 60).toString()
    );
    params.set("sort", "bestMatch");

    const url =
        `${PARSE_BASE_URL}/search_products?` +
        params.toString();

    console.log("ALDI Product Request:", {
        query,
        zipCode,
        limit,
    });

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-API-Key": apiKey,
            Accept: "application/json",
        },
        cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
        throw new Error(
            `ALDI API error: ${response.status} ${responseText}`
        );
    }

    const parsed = JSON.parse(responseText);

    if (
        parsed?.status === "success" &&
        parsed?.data
    ) {
        return parsed.data;
    }

    throw new Error(
        "ALDI API returned an unexpected response."
    );
}
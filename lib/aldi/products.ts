const ALDI_API_BASE_URL =
    "https://api.parse.bot/scraper/31f011bb-8718-4424-bcff-0f9f6bb1b28a";

export type AldiProduct = {
    product_id: string;
    name: string;
    brand: string | null;
    price: string;
    price_display: string;
    size: string | null;
    pricing_unit: string | null;
    available: boolean;
    stock_status: string | null;
    sale: {
        on_sale?: boolean;
        discount?: string;
        original_price?: string;
    } | null;
    image_url: string | null;
    product_url: string | null;
};

export type AldiSearchResponse = {
    success: boolean;
    query: string;
    zip_code: string;
    total_results: number;
    products: AldiProduct[];
};

export async function searchAldiProducts(
    term: string,
    zipCode: string
): Promise<AldiProduct[]> {
    const apiKey =
        process.env.PARSE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "Missing PARSE_API_KEY environment variable"
        );
    }

    const params = new URLSearchParams();

    params.set("sort", "bestMatch");
    params.set("limit", "10");
    params.set("query", term);
    params.set("zip_code", zipCode);

    const response = await fetch(
        `${ALDI_API_BASE_URL}/search_products?${params.toString()}`,
        {
            method: "GET",
            headers: {
                "X-API-Key": apiKey,
                Accept: "application/json",
            },
            cache: "no-store",
        }
    );

    const responseText =
        await response.text();

    if (!response.ok) {
        throw new Error(
            `ALDI API error: ${response.status} ${responseText}`
        );
    }

    let data: AldiSearchResponse;

    try {
        data = JSON.parse(responseText);
    } catch {
        throw new Error(
            "ALDI API returned invalid JSON"
        );
    }

    if (!data.success) {
        throw new Error(
            "ALDI API returned an unsuccessful response"
        );
    }

    return data.products ?? [];
}
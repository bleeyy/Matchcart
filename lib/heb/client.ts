const PARSE_BASE_URL =
    "https://api.parse.bot/scraper/a96a5f01-55f6-4a45-a52d-23f334d160a2";

export type HebProduct = {
    id: string;
    upc: string | null;
    name: string;
    size: string | null;
    brand: string | null;
    price: number | null;
    category: string | null;
    in_stock: boolean;
    image_url: string | null;
    is_on_sale: boolean;
    sale_price: number | null;
    unit_price: string | null;
    description: string | null;
    product_url: string | null;
    is_own_brand: boolean | null;
};

export type HebSearchResponse = {
    page: number;
    query: string;
    total: number;
    products: HebProduct[];
};

export async function searchHEBProducts(
    query: string,
    storeId: string,
    page: number = 1
): Promise<HebSearchResponse> {
    const apiKey =
        process.env.PARSE_API_KEY;

    if (!apiKey) {
        throw new Error(
            "Missing PARSE_API_KEY environment variable."
        );
    }

    const params =
        new URLSearchParams();

    params.set(
        "page",
        page.toString()
    );

    params.set(
        "sort",
        "best_match"
    );

    params.set(
        "query",
        query
    );

    params.set(
        "store_id",
        storeId
    );

    const url =
        `${PARSE_BASE_URL}/search_products?` +
        params.toString();

    console.log(
        "H-E-B Product Request:",
        {
            query,
            storeId,
            page,
        }
    );

    const response = await fetch(
        url,
        {
            method: "GET",
            headers: {
                "X-API-Key":
                    apiKey,
                Accept:
                    "application/json",
            },
            cache: "no-store",
        }
    );

    const responseText =
        await response.text();

    if (!response.ok) {
        throw new Error(
            `H-E-B API error: ${response.status} ${responseText}`
        );
    }

    let parsed: any;

    try {
        parsed =
            JSON.parse(
                responseText
            );
    } catch {
        throw new Error(
            "H-E-B API returned invalid JSON."
        );
    }

    if (
        parsed?.status ===
            "success" &&
        parsed?.data
    ) {
        return parsed.data;
    }

    throw new Error(
        "H-E-B API returned an unexpected response."
    );
}
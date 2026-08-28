const KROGER_BASE_URL =
    process.env.KROGER_BASE_URL ||
    "https://api.kroger.com";

const KROGER_LOCATION_ID =
    process.env.KROGER_LOCATION_ID;

let cachedToken: {
    accessToken: string;
    expiresAt: number;
} | null = null;

export async function getKrogerToken() {
    if (
        cachedToken &&
        cachedToken.expiresAt > Date.now()
    ) {
        return cachedToken.accessToken;
    }

    const clientId =
        process.env.KROGER_CLIENT_ID;

    const clientSecret =
        process.env.KROGER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            "Missing Kroger API credentials"
        );
    }

    const credentials = Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString("base64");

    const response = await fetch(
        `${KROGER_BASE_URL}/v1/connect/oauth2/token`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type":
                    "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body:
                "grant_type=client_credentials&scope=product.compact",
            cache: "no-store",
        }
    );

    const responseText =
        await response.text();

    if (!response.ok) {
        throw new Error(
            `Kroger token error: ${response.status} ${responseText}`
        );
    }

    const data = JSON.parse(responseText);

    cachedToken = {
        accessToken: data.access_token,
        expiresAt:
            Date.now() +
            (data.expires_in - 60) * 1000,
    };

    return data.access_token;
}

export async function searchKrogerProducts(
    term: string,
    locationId?: string
) {
    const token = await getKrogerToken();

    /*
     * Use the explicitly provided location ID first.
     * Otherwise fall back to KROGER_LOCATION_ID
     * from .env.local.
     */
    const effectiveLocationId =
        locationId || KROGER_LOCATION_ID;

    if (!effectiveLocationId) {
        throw new Error(
            "Missing KROGER_LOCATION_ID environment variable"
        );
    }

    const params = new URLSearchParams();

    params.set("filter.term", term);

    params.set(
        "filter.locationId",
        effectiveLocationId
    );

    params.set("filter.limit", "10");

    const url =
        `${KROGER_BASE_URL}/v1/products?` +
        params.toString();

    console.log(
        "Kroger Product Request:",
        {
            url,
            searchTerm: term,
            locationId: effectiveLocationId,
            hasToken: Boolean(token),
            tokenLength: token.length,
        }
    );

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "User-Agent": "MatchCart",
        },
        cache: "no-store",
    });

    const responseText =
        await response.text();

    if (!response.ok) {
        throw new Error(
            `Kroger Products API error: ${response.status} ${responseText}`
        );
    }

    return JSON.parse(responseText);
}
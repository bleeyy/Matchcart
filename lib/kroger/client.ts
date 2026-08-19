const KROGER_BASE_URL = "https://api.kroger.com/v1";

type KrogerTokenResponse = {
    access_token: string;
    token_type: string;
    expires_in: number;
};

let cachedToken: {
    accessToken: string;
    expiresAt: number;
} | null = null;

export async function getKrogerAccessToken() {
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.accessToken;
    }

    const clientId = process.env.KROGER_CLIENT_ID;
    const clientSecret = process.env.KROGER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Missing Kroger API credentials.");
    }

    const credentials = Buffer.from(
        `${clientId}:${clientSecret}`
    ).toString("base64");

    console.log({
        hasClientId: Boolean(clientId),
        clientIdLength: clientId?.length,
        hasClientSecret: Boolean(clientSecret),
        clientSecretLength: clientSecret?.length,
    });

    const body = new URLSearchParams({
        grant_type: "client_credentials",
        scope: "product.compact",
    });

    const response = await fetch(
        `${KROGER_BASE_URL}/connect/oauth2/token`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: body.toString(),
            cache: "no-store",
        }
    );
    
    const responseText = await response.text();

    if (!response.ok) {
        throw new Error(
            `Kroger token request failed: ${response.status} - ${responseText}`
        );
    }

    const data =
        JSON.parse(responseText) as KrogerTokenResponse;

    cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };

    return data.access_token;
}
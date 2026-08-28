const KROGER_BASE_URL = "https://api.kroger.com/v1";

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) {
      return response;
    }

    const responseText = await response.text();

    // Retry temporary Kroger server errors.
    if (
      (response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504) &&
      attempt < retries
    ) {
      console.log(
        `Kroger request failed with ${response.status}. ` +
          `Retrying (${attempt}/${retries - 1})...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * attempt)
      );

      continue;
    }

    throw new Error(
      `Kroger request failed: ${response.status} - ${responseText}`
    );
  }

  throw new Error("Kroger request failed after retries.");
}

type KrogerTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type KrogerProduct = {
  productId: string;
  description?: string;
  brand?: string;
  items?: {
    itemId?: string;
    price?: {
      regular?: number;
      promo?: number;
      regularPerUnitEstimate?: number;
      promoPerUnitEstimate?: number;
    };
    size?: string;
    soldBy?: string;
  }[];
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

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "product.compact",
  });

  const response = await fetchWithRetry(
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

  const data = JSON.parse(responseText) as KrogerTokenResponse;

  console.log("Kroger OAuth response:", {
    token_type: data.token_type,
    expires_in: data.expires_in,
    hasAccessToken: !!data.access_token,
  });

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

export async function searchKrogerProducts(
  searchTerm: string,
  locationId?: string
): Promise<KrogerProduct[]> {
  const token = await getKrogerAccessToken();

  const params = new URLSearchParams();

  params.set("filter.term", searchTerm);

  if (locationId) {
    params.set("filter.locationId", locationId);
  }

  console.log("Kroger Product Request:", {
    url: `${KROGER_BASE_URL}/products?${params.toString()}`,
    searchTerm,
    locationId,
    hasToken: !!token,
    tokenLength: token.length,
  });

  const response = await fetchWithRetry(
    `${KROGER_BASE_URL}/products?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const responseText = await response.text();

  const data = JSON.parse(responseText);

  return data.data ?? [];
}

export async function getKrogerProduct(
  productId: string,
  locationId?: string
): Promise<KrogerProduct | null> {
  const token = await getKrogerAccessToken();

  const params = new URLSearchParams();

  if (locationId) {
    params.set("filter.locationId", locationId);
  }

  const queryString = params.toString();

  const response = await fetchWithRetry(
    `${KROGER_BASE_URL}/products/${productId}${
      queryString ? `?${queryString}` : ""
    }`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const responseText = await response.text();

  const data = JSON.parse(responseText);

  return data.data ?? null;
}
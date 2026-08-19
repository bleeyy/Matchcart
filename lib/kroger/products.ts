import { getKrogerAccessToken } from "./client";

const KROGER_BASE_URL = "https://api.kroger.com/v1";

type KrogerItem = {
  price?: {
    regular?: number;
    promo?: number;
  };
  size?: string;
};

export type KrogerProduct = {
  productId: string;
  brand?: string;
  description?: string;
  items?: KrogerItem[];
};

type KrogerProductResponse = {
  data: KrogerProduct[];
};

export async function searchKrogerProducts(
  term: string,
  locationId: string
): Promise<KrogerProduct[]> {
  const accessToken = await getKrogerAccessToken();

  const params = new URLSearchParams({
    "filter.term": term,
    "filter.locationId": locationId,
    "filter.limit": "10",
  });

  const response = await fetch(
    `${KROGER_BASE_URL}/products?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Kroger product search failed: ${response.status}`
    );
  }

  const data =
    (await response.json()) as KrogerProductResponse;

  return data.data ?? [];
}

export async function getKrogerProduct(
  productId: string,
  locationId: string
): Promise<KrogerProduct | null> {
  const accessToken = await getKrogerAccessToken();

  const params = new URLSearchParams({
    "filter.locationId": locationId,
  });

  const response = await fetch(
    `${KROGER_BASE_URL}/products/${productId}?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const data =
    (await response.json()) as {
      data?: KrogerProduct;
    };

  return data.data ?? null;
}
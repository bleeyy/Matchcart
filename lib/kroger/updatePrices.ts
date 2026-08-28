import { createAdminClient } from "@/lib/supabase/admin";
import {
  getKrogerProduct,
  searchKrogerProducts,
  type KrogerProduct,
} from "./products";

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

type UpdateResult = {
  productId: number;
  name: string;
  krogerProductId: string;
  price: number;
  regularPrice: number | null;
  promoPrice: number | null;
  sizeId: number | null;
};

type Failure = {
  product: string;
  reason: string;
};

const CONCURRENCY = 5;

/*
 * Get the price we actually want to save.
 *
 * If Kroger has a promo price, use that.
 * Otherwise use the regular price.
 */
function getEffectivePrice(product: KrogerProduct) {
  const item = product.items?.find(
    (item) =>
      item.price?.promo !== undefined ||
      item.price?.regular !== undefined
  );

  if (!item?.price) {
    return null;
  }

  const regularPrice = item.price.regular ?? null;
  const promoPrice = item.price.promo ?? null;

  const effectivePrice = promoPrice ?? regularPrice;

  if (effectivePrice === null) {
    return null;
  }

  return {
    effectivePrice,
    regularPrice,
    promoPrice,
  };
}

/*
 * Normalize text before comparing product names.
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

/*
 * Convert a normalized string into individual words.
 */
function getWords(value: string) {
  return normalize(value)
    .split(" ")
    .filter(Boolean);
}

/*
 * Words that are useful for identifying a product.
 *
 * These are intentionally NOT treated as required because
 * Kroger product names can contain them inconsistently.
 */
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
  "style",
  "brand",
  "original",
  "fresh",
  "premium",
  "great",
  "value",
]);

/*
 * Product descriptors that can indicate that a result
 * is materially different from what the user searched for.
 *
 * Example:
 *
 * Search:
 *   Black Rice
 *
 * Result:
 *   Black Pepper Lentils Brown Rice
 *
 * "pepper" and "lentils" are strong conflicting terms.
 */
const CONFLICT_GROUPS: string[][] = [
  [
    "rice",
    "lentils",
    "beans",
    "quinoa",
    "couscous",
    "pasta",
    "noodles",
  ],

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
    "fat free",
  ],
];

/*
 * Words that commonly describe a completely different
 * preparation/product type.
 */
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
]);

/*
 * Determine whether two words belong to the same
 * mutually-exclusive descriptor group.
 */
function hasConflict(
  searchWords: string[],
  resultWords: string[]
) {
  for (const group of CONFLICT_GROUPS) {
    const searchGroupWords = searchWords.filter((word) =>
      group.includes(word)
    );

    const resultGroupWords = resultWords.filter((word) =>
      group.includes(word)
    );

    if (searchGroupWords.length === 0) {
      continue;
    }

    /*
     * If the search specifies one member of a group
     * but the result contains a different member,
     * treat that as a conflict.
     *
     * Example:
     *
     * Search: whole milk
     * Result: almond milk
     */
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

/*
 * Score a Kroger result against the search term.
 *
 * Higher = better match.
 *
 * The goal is to strongly prefer products that actually
 * contain the requested words instead of merely containing
 * one word somewhere in a long description.
 */
function scoreProductMatch(
  searchTerm: string,
  product: KrogerProduct
) {
  const normalizedSearch = normalize(searchTerm);
  const normalizedDescription = normalize(
    product.description ?? ""
  );

  const searchWords = getWords(normalizedSearch).filter(
    (word) => !COMMON_WORDS.has(word)
  );

  const descriptionWords = getWords(
    normalizedDescription
  );

  if (searchWords.length === 0) {
    return {
      score: 0,
      valid: false,
    };
  }

  /*
   * Exact description match is the strongest possible match.
   */
  if (normalizedDescription === normalizedSearch) {
    return {
      score: 10000,
      valid: true,
    };
  }

  /*
   * Reject obvious descriptor conflicts.
   */
  if (
    hasConflict(
      searchWords,
      descriptionWords
    )
  ) {
    return {
      score: -10000,
      valid: false,
    };
  }

  /*
   * Count how many search words actually appear
   * as complete words in the Kroger description.
   */
  const matchedWords = searchWords.filter((word) =>
    descriptionWords.includes(word)
  );

  const matchedCount = matchedWords.length;

  /*
   * Every meaningful search word must appear somewhere
   * in the result.
   *
   * This is much stricter than using .includes().
   */
  if (matchedCount !== searchWords.length) {
    return {
      score: -5000,
      valid: false,
    };
  }

  let score = 0;

  /*
   * Reward every exact word match.
   */
  score += matchedCount * 1000;

  /*
   * Reward the search phrase appearing in the description.
   */
  if (
    normalizedDescription.includes(
      normalizedSearch
    )
  ) {
    score += 1500;
  }

  /*
   * Reward the search phrase appearing near the beginning
   * of the product description.
   */
  if (
    normalizedDescription.startsWith(
      normalizedSearch
    )
  ) {
    score += 1200;
  }

  /*
   * Penalize unrelated strong descriptors.
   *
   * Example:
   *
   * Search:
   *   Black Rice
   *
   * Result:
   *   Black Rice Protein Blend
   *
   * The result still matches the words, but the extra
   * descriptor makes it less desirable.
   */
  const extraWords = descriptionWords.filter(
    (word) =>
      !searchWords.includes(word) &&
      STRONG_EXTRA_WORDS.has(word)
  );

  score -= extraWords.length * 700;

  /*
   * Penalize descriptions with many additional words.
   *
   * This prevents a very long product description from
   * beating a simple, direct match.
   */
  const unrelatedWordCount = descriptionWords.filter(
    (word) => !searchWords.includes(word)
  ).length;

  score -= Math.min(
    unrelatedWordCount * 50,
    500
  );

  /*
   * Prefer shorter, cleaner matches.
   */
  if (descriptionWords.length <= searchWords.length + 2) {
    score += 500;
  }

  /*
   * Prefer results where the first few words contain
   * the requested product.
   */
  const firstWords = descriptionWords.slice(
    0,
    searchWords.length + 3
  );

  const earlyMatches = searchWords.filter((word) =>
    firstWords.includes(word)
  ).length;

  score += earlyMatches * 150;

  return {
    score,
    valid: score > 0,
  };
}

/*
 * Pick the most relevant Kroger search results.
 *
 * This is intentionally stricter than the previous
 * implementation.
 */
function chooseBestMatches(
  searchTerm: string,
  searchResults: KrogerProduct[]
) {
  const normalizedSearch = normalize(searchTerm);

  const scoredResults = searchResults
    .map((product) => {
      const match = scoreProductMatch(
        normalizedSearch,
        product
      );

      return {
        product,
        score: match.score,
        valid: match.valid,
      };
    })
    .filter((item) => item.valid)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const aDescription = normalize(
        a.product.description ?? ""
      );

      const bDescription = normalize(
        b.product.description ?? ""
      );

      return (
        aDescription.length -
        bDescription.length
      );
    });

  /*
   * Log the ranking so we can see why a product was chosen.
   */
  console.log(
    "Kroger match ranking:",
    scoredResults.slice(0, 5).map((item) => ({
      productId: item.product.productId,
      description: item.product.description,
      score: item.score,
    }))
  );

  return scoredResults.map(
    (item) => item.product
  );
}

/*
 * Update one individual price.
 */
async function updateSingleProduct(
  supabase: ReturnType<typeof createAdminClient>,
  job: UpdateJob,
  locationId: string
): Promise<{
  result?: UpdateResult;
  failure?: Failure;
}> {
  const { product, variant, size } = job;

  /*
   * Build the name that will be displayed in logs/results.
   *
   * Examples:
   *
   * Rice
   * Rice - Jasmine Rice
   * Rice - Jasmine Rice (2 lb)
   */
  const displayParts = [product.name];

  if (variant) {
    displayParts.push(variant.name);
  }

  if (size) {
    displayParts.push(`(${size.label})`);
  }

  const displayName = displayParts.join(" - ");

  try {
    console.log(
      `\n--- Processing ${displayName} ---`
    );

    /*
     * Build the Kroger search term.
     *
     * Examples:
     *
     * Milk
     * Jasmine Rice
     * Jasmine Rice 2 lb
     */
    const searchParts: string[] = [];

    if (variant) {
      searchParts.push(variant.name);
    } else {
      searchParts.push(product.name);
    }

    if (size) {
      searchParts.push(size.label);
    }

    const searchTerm = searchParts.join(" ");

    console.log(
      "Kroger search term:",
      searchTerm
    );

    /*
     * Search Kroger.
     */
    const searchResults =
      await searchKrogerProducts(
        searchTerm,
        locationId
      );

    console.log(
      `${displayName}: ${searchResults.length} search results`
    );

    if (searchResults.length === 0) {
      return {
        failure: {
          product: displayName,
          reason:
            "No Kroger search results",
        },
      };
    }

    /*
     * Rank the search results.
     */
    const matches = chooseBestMatches(
      searchTerm,
      searchResults
    );

    if (matches.length === 0) {
      return {
        failure: {
          product: displayName,
          reason:
            "Could not find a sufficiently close Kroger match",
        },
      };
    }

    let exactProduct: KrogerProduct | null =
      null;

    let priceData: ReturnType<
      typeof getEffectivePrice
    > = null;

    /*
     * Try multiple Kroger results until we find
     * one that actually has a price.
     */
    for (const match of matches) {
      console.log(
        "Trying Kroger product:",
        {
          productId:
            match.productId,
          description:
            match.description,
          brand: match.brand,
        }
      );

      try {
        const candidate =
          await getKrogerProduct(
            match.productId,
            locationId
          );

        if (!candidate) {
          continue;
        }

        const candidatePrice =
          getEffectivePrice(candidate);

        console.log(
          "Candidate price:",
          candidatePrice
        );

        if (!candidatePrice) {
          console.log(
            `Skipping ${candidate.productId} because it has no price`
          );

          continue;
        }

        exactProduct = candidate;
        priceData = candidatePrice;

        break;
      } catch (error) {
        /*
         * A temporary Kroger error shouldn't prevent us
         * from trying another search result.
         */
        console.log(
          `Failed to retrieve ${match.productId}:`,
          error instanceof Error
            ? error.message
            : "Unknown error"
        );
      }
    }

    if (
      !exactProduct ||
      !priceData
    ) {
      return {
        failure: {
          product: displayName,
          reason:
            "Kroger search results found, but none had a usable price",
        },
      };
    }

    console.log(
      "Selected Kroger product:",
      {
        productId:
          exactProduct.productId,
        description:
          exactProduct.description,
        brand:
          exactProduct.brand,
        price:
          priceData.effectivePrice,
      }
    );

    /*
     * Find the existing MatchCart store_products row.
     *
     * IMPORTANT:
     *
     * store_products belongs to the base MatchCart product.
     *
     * The size is stored separately in prices.size_id.
     */
    const {
      data: storeProduct,
      error:
        storeProductError,
    } = await supabase
      .from("store_products")
      .select("id")
      .eq(
        "product_id",
        product.id
      )
      .eq("store_id", 4)
      .maybeSingle();

    if (storeProductError) {
      return {
        failure: {
          product: displayName,
          reason:
            `store_products lookup failed: ${storeProductError.message}`,
        },
      };
    }

    let storeProductId =
      storeProduct?.id;

    /*
     * Create the store_products row if necessary.
     */
    if (!storeProductId) {
      /*
       * Prevent the same Kroger product from being linked
       * to two MatchCart products.
       */
      const {
        data:
          existingExternalProduct,
        error:
          externalLookupError,
      } = await supabase
        .from("store_products")
        .select(
          "id, product_id"
        )
        .eq("store_id", 4)
        .eq(
          "external_id",
          exactProduct.productId
        )
        .maybeSingle();

      if (externalLookupError) {
        return {
          failure: {
            product: displayName,
            reason:
              `store_products external ID lookup failed: ${externalLookupError.message}`,
          },
        };
      }

      if (
        existingExternalProduct
      ) {
        /*
         * If it is already linked to the same product,
         * allow it.
         *
         * Otherwise report a conflict.
         */
        if (
          existingExternalProduct.product_id !==
          product.id
        ) {
          return {
            failure: {
              product: displayName,
              reason:
                `Kroger product ${exactProduct.productId} is already linked to MatchCart product ${existingExternalProduct.product_id}`,
            },
          };
        }

        storeProductId =
          existingExternalProduct.id;
      } else {
        const {
          data:
            newStoreProduct,
          error:
            insertStoreProductError,
        } = await supabase
          .from("store_products")
          .insert({
            product_id:
              product.id,
            store_id: 4,
            external_id:
              exactProduct.productId,
            name:
              exactProduct.description ??
              product.name,
          })
          .select("id")
          .single();

        if (
          insertStoreProductError
        ) {
          return {
            failure: {
              product: displayName,
              reason:
                `store_products insert failed: ${insertStoreProductError.message}`,
            },
          };
        }

        storeProductId =
          newStoreProduct.id;
      }
    } else {
      /*
       * Update the existing Kroger association.
       */
      const {
        error: updateError,
      } = await supabase
        .from("store_products")
        .update({
          external_id:
            exactProduct.productId,
          name:
            exactProduct.description ??
            product.name,
        })
        .eq(
          "id",
          storeProductId
        );

      if (updateError) {
        return {
          failure: {
            product: displayName,
            reason:
              `store_products update failed: ${updateError.message}`,
          },
        };
      }
    }

    /*
     * Size ID comes from the size record.
     */
    const sizeId =
      size?.id ?? null;

    /*
     * Save the price.
     *
     * This means:
     *
     * store_product_id = the Kroger product association
     * size_id          = the requested size
     */
    const {
      error: priceError,
    } = await supabase
      .from("prices")
      .upsert(
        {
          store_product_id:
            storeProductId,
          size_id:
            sizeId,
          price:
            priceData.effectivePrice,
          regular_price:
            priceData.regularPrice,
          promo_price:
            priceData.promoPrice,
          currency: "USD",
          source: "kroger-api",
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "store_product_id,size_id",
        }
      );

    if (priceError) {
      return {
        failure: {
          product: displayName,
          reason:
            `prices upsert failed: ${priceError.message}`,
        },
      };
    }

    console.log(
      `SUCCESS: ${displayName} -> $${priceData.effectivePrice.toFixed(
        2
      )}`
    );

    return {
      result: {
        productId:
          product.id,
        name:
          displayName,
        krogerProductId:
          exactProduct.productId,
        price:
          priceData.effectivePrice,
        regularPrice:
          priceData.regularPrice,
        promoPrice:
          priceData.promoPrice,
        sizeId,
      },
    };
  } catch (error) {
    return {
      failure: {
        product: displayName,
        reason:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
    };
  }
}

/*
 * Update Kroger prices for the entire product catalog.
 *
 * getProducts() now returns:
 *
 * Product
 *   -> variants
 *       -> sizes
 *
 * We convert that into individual jobs here.
 */
export async function updateKrogerPrices(
  products: ProductCatalog[]
) {
  const locationId =
    process.env.KROGER_LOCATION_ID;

  if (!locationId) {
    throw new Error(
      "Missing KROGER_LOCATION_ID."
    );
  }

  const supabase =
    createAdminClient();

  const results: UpdateResult[] = [];
  const failures: Failure[] = [];

  /*
   * Flatten the nested catalog into individual
   * price-update jobs.
   */
  const jobs: UpdateJob[] = [];

  for (const product of products) {
    /*
     * Product with variants.
     */
    if (
      product.variants?.length > 0
    ) {
      for (const variant of product.variants) {
        /*
         * Variant with sizes.
         */
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
          /*
           * Variant without sizes.
           */
          jobs.push({
            product,
            variant,
            size: null,
          });
        }
      }
    } else {
      /*
       * Product without variants.
       */
      jobs.push({
        product,
        variant: null,
        size: null,
      });
    }
  }

  console.log(
    "Products received:",
    products.length
  );

  console.log(
    "Total price jobs:",
    jobs.length
  );

  console.log(
    "Kroger location:",
    locationId
  );

  console.log(
    "Concurrency:",
    CONCURRENCY
  );

  /*
   * Process jobs in batches.
   */
  for (
    let i = 0;
    i < jobs.length;
    i += CONCURRENCY
  ) {
    const batch = jobs.slice(
      i,
      i + CONCURRENCY
    );

    console.log(
      `\nProcessing jobs ${i + 1}-${Math.min(
        i + CONCURRENCY,
        jobs.length
      )} of ${jobs.length}`
    );

    const batchResults =
      await Promise.all(
        batch.map((job) =>
          updateSingleProduct(
            supabase,
            job,
            locationId
          )
        )
      );

    for (const result of batchResults) {
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
  }

  console.log(
    "\n=============================="
  );

  console.log(
    "PRICE UPDATE COMPLETE"
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

  if (failures.length > 0) {
    console.log(
      "\nFailures:"
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
import { createClient } from "@/lib/supabase/server";

export async function getProducts() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`
            id,
            name,
            category,
            product_variants (
                id,
                name,
                product_sizes (
                    id,
                    label
                )
            )
        `)
        .order("id");

    if (error) {
        throw new Error(
            `Failed to fetch products: ${error.message}`
        );
    }

    return (data ?? []).map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        variants: (product.product_variants ?? []).map(
            (variant) => ({
                id: variant.id,
                name: variant.name,
                sizes: variant.product_sizes ?? [],
            })
        ),
    }));
}
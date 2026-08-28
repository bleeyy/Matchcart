export type CartItem = {
    id: number;

    // Product being added to the cart
    productId: number;

    // Selected size, if applicable
    sizeId?: number;
    sizeLabel?: string;

    // Selected variant, if applicable
    variantId?: number;
    variantName?: string;

    // Display name
    name: string;

    // Quantity selected
    quantity: number;
};
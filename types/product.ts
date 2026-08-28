export type ProductSize = {
    id: number;
    label: string;
};

export type ProductVariant = {
    id: number;
    name: string;
    sizes: ProductSize[];
};

export type Product = {
    id: number;
    name: string;
    category: string;
    variants: ProductVariant[];
};
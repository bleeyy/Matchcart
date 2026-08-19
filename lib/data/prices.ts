export type Price = {
  productId: number;
  storeId: number;
  price: number;
  currency: string;
  source: string;
  updatedAt: string;
  regularPrice?: number | null;
  promoPrice?: number | null;
};
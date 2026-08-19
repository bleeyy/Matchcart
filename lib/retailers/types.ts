export type RetailerPrice = {
  externalProductId: string;
  productName: string;
  brand: string | null;
  price: number;
  regularPrice: number | null;
  promoPrice: number | null;
  currency: string;
  updatedAt: string;
};

export type RetailerAdapter = {
  searchProduct: (
    productName: string
  ) => Promise<RetailerPrice | null>;

  getProductPrice: (
    externalProductId: string
  ) => Promise<RetailerPrice | null>;
};
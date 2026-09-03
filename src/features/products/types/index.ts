export interface Product {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  category: Record<string, string>;
  price: number;
  onSale: boolean;
  discount: number;
  quantityAvailable: number;
  imageUrl: string;
}

export enum SortType {
  NameAsc = 'nameAsc',
  NameDesc = 'nameDesc',
  PriceAsc = 'priceAsc',
  PriceDesc = 'priceDesc',
  DiscountAsc = 'discountAsc',
  DiscountDesc = 'discountDesc',
}

export const getLocalizedName = (
  product: Product,
  locale: string = 'en'
): string => {
  return (
    product.name[locale] ||
    product.name['en'] ||
    Object.values(product.name)[0] ||
    ''
  );
};

export const getLocalizedDescription = (
  product: Product,
  locale: string = 'en'
): string => {
  return (
    product.description[locale] ||
    product.description['en'] ||
    Object.values(product.description)[0] ||
    ''
  );
};

export const getLocalizedCategory = (
  product: Product,
  locale: string = 'en'
): string => {
  return (
    product.category[locale] ||
    product.category['en'] ||
    Object.values(product.category)[0] ||
    ''
  );
};

export const getDiscountedPrice = (product: Product): number => {
  if (product.onSale && product.discount > 0) {
    return product.price * (1.0 - product.discount);
  }
  return product.price;
};

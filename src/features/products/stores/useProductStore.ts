import { create } from 'zustand';
import {
  Product,
  SortType,
  getLocalizedName,
  getLocalizedCategory,
  getDiscountedPrice,
} from '../types';
import { ProductService } from '../services/productService';

interface ProductState {
  products: Product[];
  loading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  sortType: SortType;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSortType: (sortType: SortType) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: true,
  searchQuery: '',
  selectedCategory: null,
  sortType: SortType.NameAsc,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSortType: (sortType) => set({ sortType }),
}));

// Initialize real-time listener for products collection
ProductService.watchProducts((products) => {
  useProductStore.setState({ products, loading: false });
});

export const getFilteredAndSortedProducts = (
  products: Product[],
  searchQuery: string,
  selectedCategory: string | null,
  sortType: SortType,
  locale: string
): Product[] => {
  let filtered = [...products];

  // 1. Filter by category
  if (selectedCategory && selectedCategory.trim() !== '') {
    filtered = filtered.filter(
      (p) =>
        getLocalizedCategory(p, locale).toLowerCase() ===
        selectedCategory.toLowerCase()
    );
  }

  // 2. Filter by search query
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((p) => {
      const name = getLocalizedName(p, locale).toLowerCase();
      return name.includes(q);
    });
  }

  // 3. Sort
  filtered.sort((a, b) => {
    switch (sortType) {
      case SortType.NameAsc:
        return getLocalizedName(a, locale).localeCompare(
          getLocalizedName(b, locale)
        );
      case SortType.NameDesc:
        return getLocalizedName(b, locale).localeCompare(
          getLocalizedName(a, locale)
        );
      case SortType.PriceAsc:
        return getDiscountedPrice(a) - getDiscountedPrice(b);
      case SortType.PriceDesc:
        return getDiscountedPrice(b) - getDiscountedPrice(a);
      case SortType.DiscountAsc:
        return a.discount - b.discount;
      case SortType.DiscountDesc:
        return b.discount - a.discount;
      default:
        return 0;
    }
  });

  return filtered;
};

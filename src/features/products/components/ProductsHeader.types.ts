import { SortType } from '../types';

export interface ProductsHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onOpenCategoryFilter: () => void;
  sortType: SortType;
  onOpenSort: () => void;
  onSelectSort: (sort: SortType) => void;
  categories: string[];
}

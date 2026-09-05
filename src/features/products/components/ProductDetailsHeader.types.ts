export interface ProductDetailsHeaderProps {
  title: string;
  onBack?: () => void;
  isInWishlist?: boolean;
  onToggleWishlist?: () => void;
}

import { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation, useRoute } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { ProductDetailsScreen } from '@/features/products/screens/ProductDetailsScreen';
import { useProductStore } from '@/features/products/stores/useProductStore';
import { ProductService } from '@/features/products/services/productService';
import { Product } from '@/features/products/types';
import { useAppTheme } from '@/core/theme/ThemeContext';

export default function ProductDetailsRoute(props: any) {
  const navigation = useNavigation();
  const rnRoute = useRoute<any>();
  const rawParams = useLocalSearchParams();
  const products = useProductStore((s) => s.products);
  const productsLoading = useProductStore((s) => s.loading);
  const { colors } = useAppTheme();

  const getInitialProduct = (): Product | null => {
    // 1. Direct route params from React Navigation
    const directProduct = rnRoute?.params?.product || props?.route?.params?.product;
    if (
      directProduct &&
      typeof directProduct === 'object' &&
      directProduct.id &&
      directProduct.name &&
      typeof directProduct.name === 'object'
    ) {
      return directProduct;
    }

    // 2. Parsed JSON from stringified route param
    if (typeof directProduct === 'string' && directProduct !== '[object Object]') {
      try {
        const parsed = JSON.parse(directProduct);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed;
        }
      } catch {}
    }

    // 3. Raw search params from expo-router (if JSON string)
    const rawProduct = rawParams.product;
    if (typeof rawProduct === 'string' && rawProduct !== '[object Object]') {
      try {
        const parsed = JSON.parse(rawProduct);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed;
        }
      } catch {}
    }

    return null;
  };

  const [product, setProduct] = useState<Product | null>(getInitialProduct);
  const [fetching, setFetching] = useState(false);

  const productId =
    product?.id ||
    rnRoute?.params?.id ||
    rnRoute?.params?.productId ||
    props?.route?.params?.id ||
    props?.route?.params?.productId ||
    (typeof rawParams.id === 'string' ? rawParams.id : undefined) ||
    (typeof rawParams.productId === 'string' ? rawParams.productId : undefined);

  useEffect(() => {
    // If product is already fully loaded, no need to fetch
    if (product && product.id && product.name && typeof product.name === 'object') {
      return;
    }

    if (!productId) return;

    // Check zustand store
    const foundInStore = products.find((p) => p.id === String(productId));
    if (foundInStore) {
      setProduct(foundInStore);
      return;
    }

    // Fetch from service if not in store
    let isMounted = true;
    setFetching(true);
    ProductService.getProductById(String(productId))
      .then((p) => {
        if (isMounted && p) {
          setProduct(p);
        }
      })
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, products, product]);

  if ((fetching || productsLoading) && !product) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ProductDetailsScreen
      navigation={navigation as any}
      route={{
        key: 'ProductDetails',
        name: 'ProductDetails',
        params: { product: product as any },
      }}
    />
  );
}

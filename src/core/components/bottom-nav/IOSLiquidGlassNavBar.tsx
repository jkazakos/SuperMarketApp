import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useCartStore } from '@/features/shopping_list/stores/useCartStore';
import { useWishlistStore } from '@/features/wishlist/stores/useWishlistStore';
import {
  NativeLiquidGlassView,
  isNativeLiquidGlassAvailable,
  NativeTabItem,
} from 'modules/native-liquid-glass';

export const IOSLiquidGlassNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const totalCartCount = useCartStore((s) => s.totalQuantity);
  const totalWishlistCount = useWishlistStore((s) => s.items.length);

  // Tab data mapping for native module
  const nativeTabs: NativeTabItem[] = state.routes.map((route) => {
    const { options } = descriptors[route.key];
    let iconName = 'storefront-outline';
    let badgeCount = 0;

    if (route.name === 'Products') {
      iconName = 'storefront';
    } else if (route.name === 'Wishlist') {
      iconName = 'heart';
      badgeCount = totalWishlistCount;
    } else if (route.name === 'ShoppingList') {
      iconName = 'cart';
      badgeCount = totalCartCount;
    } else if (route.name === 'Profile') {
      iconName = 'person';
    }

    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
          ? options.title
          : route.name;

    return {
      key: route.key,
      name: route.name,
      label: typeof label === 'string' ? label : route.name,
      icon: iconName,
      badgeCount,
    };
  });

  // Check if compiled native Swift UIBlurEffect/UIVibrancyEffect component is available
  if (isNativeLiquidGlassAvailable()) {
    return (
      <View
        style={[
          styles.wrapper,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
        pointerEvents="box-none"
      >
        <NativeLiquidGlassView
          tabs={nativeTabs}
          selectedIndex={state.index}
          isDark={isDark}
          style={{ width: '100%', height: 72 }}
          onTabSelect={(e) => {
            const targetRoute = e.nativeEvent.name;
            const targetIndex = e.nativeEvent.index;
            if (targetIndex !== state.index) {
              navigation.navigate(targetRoute);
            }
          }}
        />
      </View>
    );
  }

  // --- Real-time Spring Physics Liquid Glass Pill (for Expo Go & Native) ---
  const [containerWidth, setContainerWidth] = useState(0);
  const animatedIndex = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: state.index,
      damping: 17,
      stiffness: 140,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const tabCount = state.routes.length;
  const paddingH = 6;
  const usableWidth = containerWidth > 0 ? containerWidth - paddingH * 2 : 0;
  const tabWidth = tabCount > 0 ? usableWidth / tabCount : 0;

  const translateX = animatedIndex.interpolate({
    inputRange: state.routes.map((_, i) => i),
    outputRange: state.routes.map((_, i) => paddingH + i * tabWidth),
  });

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Outer ambient drop shadow */}
      <View
        style={[
          styles.shadowWrapper,
          {
            shadowColor: isDark ? '#000000' : '#1E1B4B',
            shadowOpacity: isDark ? 0.65 : 0.18,
            shadowRadius: 28,
          },
        ]}
      >
        {/* Main Glass Pill */}
        <View
          style={[
            styles.glassPill,
            {
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.16)'
                : 'rgba(255, 255, 255, 0.70)',
              borderTopColor: isDark
                ? 'rgba(255, 255, 255, 0.38)'
                : 'rgba(255, 255, 255, 0.95)',
              borderBottomColor: isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.35)',
            },
          ]}
          onLayout={onContainerLayout}
        >
          {/* Native Frosted Blur */}
          <BlurView
            intensity={60}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />

          {/* Crystalline Glass Tint Base */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark
                  ? 'rgba(15, 23, 42, 0.68)'
                  : 'rgba(255, 255, 255, 0.55)',
              },
            ]}
          />

          {/* Upper Glass Horizon Sheen */}
          <View
            style={[
              styles.glassHorizonSheen,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.30)',
              },
            ]}
            pointerEvents="none"
          />

          {/* Sliding Liquid Glass Droplet with Spring Physics */}
          {tabWidth > 0 && (
            <Animated.View
              style={[
                styles.slidingDropletWrapper,
                {
                  width: tabWidth,
                  transform: [{ translateX }],
                },
              ]}
              pointerEvents="none"
            >
              <View style={styles.dropletInner}>
                {/* Caustic Glow */}
                <View style={styles.causticGlow} />

                {/* Prismatic Cyan Rim */}
                <View style={styles.chromaticCyan} />

                {/* Prismatic Magenta/Amber Rim */}
                <View style={styles.chromaticMagenta} />

                {/* Convex Lens Body with Blur */}
                <View
                  style={[
                    styles.lensBody,
                    {
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.45)'
                        : 'rgba(255, 255, 255, 0.90)',
                      borderTopColor: isDark
                        ? 'rgba(255, 255, 255, 0.95)'
                        : 'rgba(255, 255, 255, 1.0)',
                      backgroundColor: isDark
                        ? 'rgba(30, 41, 59, 0.50)'
                        : 'rgba(255, 255, 255, 0.40)',
                    },
                  ]}
                >
                  <BlurView
                    intensity={45}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Top Specular Sheen */}
                  <View
                    style={[
                      styles.lensSpecularSheen,
                      {
                        backgroundColor: isDark
                          ? 'rgba(255, 255, 255, 0.18)'
                          : 'rgba(255, 255, 255, 0.55)',
                      },
                    ]}
                  />
                </View>
              </View>
            </Animated.View>
          )}

          {/* Interactive Tab Items */}
          <View style={styles.tabContentRow}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              let iconName: keyof typeof Ionicons.glyphMap = 'cube-outline';
              let badgeCount = 0;

              if (route.name === 'Products') {
                iconName = isFocused ? 'storefront' : 'storefront-outline';
              } else if (route.name === 'Wishlist') {
                iconName = isFocused ? 'heart' : 'heart-outline';
                badgeCount = totalWishlistCount;
              } else if (route.name === 'ShoppingList') {
                iconName = isFocused ? 'cart' : 'cart-outline';
                badgeCount = totalCartCount;
              } else if (route.name === 'Profile') {
                iconName = isFocused ? 'person' : 'person-outline';
              }

              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                    ? options.title
                    : route.name;

              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={styles.tabButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name={iconName}
                      size={21}
                      color={
                        isFocused
                          ? '#FFFFFF'
                          : isDark
                            ? 'rgba(255, 255, 255, 0.60)'
                            : 'rgba(15, 23, 42, 0.50)'
                      }
                    />
                    {badgeCount > 0 && (
                      <View
                        style={[styles.badge, { backgroundColor: colors.secondary }]}
                      >
                        <Text style={styles.badgeText}>
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused
                          ? '#FFFFFF'
                          : isDark
                            ? 'rgba(255, 255, 255, 0.60)'
                            : 'rgba(15, 23, 42, 0.50)',
                        fontWeight: isFocused ? '700' : '500',
                      },
                    ]}
                  >
                    {typeof label === 'string' ? label : route.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  shadowWrapper: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 36,
    shadowOffset: { width: 0, height: 12 },
  },
  glassPill: {
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1.2,
    position: 'relative',
    height: 64,
  },
  glassHorizonSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },

  /* Sliding Liquid Glass Droplet */
  slidingDropletWrapper: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dropletInner: {
    width: '92%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  causticGlow: {
    position: 'absolute',
    top: 1,
    left: 2,
    right: 2,
    bottom: 1,
    borderRadius: 24,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
  },
  chromaticCyan: {
    position: 'absolute',
    top: -1,
    left: -1.5,
    right: 0.5,
    bottom: 1.5,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.75)',
    borderBottomColor: 'transparent',
    borderRightColor: 'rgba(56, 189, 248, 0.35)',
  },
  chromaticMagenta: {
    position: 'absolute',
    top: 1.5,
    left: 0.5,
    right: -1.5,
    bottom: -1,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderBottomColor: 'rgba(244, 63, 94, 0.85)',
    borderRightColor: 'rgba(251, 191, 36, 0.80)',
    borderLeftColor: 'rgba(168, 85, 247, 0.70)',
  },
  lensBody: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.2,
  },
  lensSpecularSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.18)',
  },

  /* Tab Navigation Content */
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    height: '100%',
    zIndex: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

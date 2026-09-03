import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useCartStore } from '@/features/shopping_list/stores/useCartStore';
import { useWishlistStore } from '@/features/wishlist/stores/useWishlistStore';

export const AndroidMaterialNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const totalCartCount = useCartStore((s) => s.totalQuantity);
  const totalWishlistCount = useWishlistStore((s) => s.items.length);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.08)',
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.navBarContent}>
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
            <Pressable
              key={route.key}
              onPress={onPress}
              android_ripple={{
                color: isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(79, 70, 229, 0.1)',
                borderless: true,
                radius: 40,
              }}
              style={styles.tabItem}
            >
              {/* Material 3 Active Indicator Pill behind the Icon */}
              <View
                style={[
                  styles.iconIndicatorPill,
                  {
                    backgroundColor: isFocused
                      ? colors.primaryContainer
                      : 'transparent',
                  },
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? colors.primary : colors.textSecondary}
                />

                {/* Badge attached to pill/icon container */}
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

              {/* Material 3 Typography Label */}
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.primary : colors.textSecondary,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
              >
                {typeof label === 'string' ? label : route.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navBarContent: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconIndicatorPill: {
    width: 64,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});

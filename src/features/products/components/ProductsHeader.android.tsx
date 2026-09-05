import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { SortType } from '../types';
import { ProductsHeaderProps } from './ProductsHeader.types';

interface HeaderActionButtonProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  isActive?: boolean;
  activeBadge?: string | number;
  onPress: () => void;
  onClear?: () => void;
}

const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
  label,
  icon,
  isActive = false,
  activeBadge,
  onPress,
  onClear,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 5,
    }).start();
  };

  const tintColor = isActive ? colors.primary : colors.textPrimary;

  return (
    <Animated.View style={[styles.buttonOuter, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.actionButton,
          {
            backgroundColor: isActive ? colors.primaryContainer : colors.surfaceVariant,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={styles.buttonContent}>
          <Ionicons name={icon} size={17} color={tintColor} style={styles.buttonIcon} />

          <Text
            numberOfLines={1}
            style={[
              styles.buttonLabel,
              {
                color: tintColor,
                fontWeight: isActive ? '700' : '600',
              },
            ]}
          >
            {label}
          </Text>

          {activeBadge !== undefined && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isActive
                    ? colors.primary
                    : colors.isDark
                      ? 'rgba(255, 255, 255, 0.15)'
                      : 'rgba(0, 0, 0, 0.08)',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: isActive ? '#FFFFFF' : colors.isDark ? '#E2E8F0' : '#475569',
                  },
                ]}
              >
                {activeBadge}
              </Text>
            </View>
          )}

          {isActive && onClear && (
            <Pressable
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation();
                onClear();
              }}
              accessibilityRole="button"
              accessibilityLabel={t('clearFilter')}
              style={styles.clearHit}
            >
              <Ionicons name="close-circle" size={16} color={tintColor} />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  title,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenCategoryFilter,
  sortType,
  onOpenSort,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.androidSolidHeader,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 12),
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>{title}</Text>
      </View>

      {/* Modern Search Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={19}
          color={colors.textSecondary}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder={t('search')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          accessibilityRole="search"
          accessibilityLabel={t('search')}
        />
        {searchQuery !== '' && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={8}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('clearSearch', 'Clear search')}
          >
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Buttons Row: Solid Material 3 on Android */}
      <View style={styles.actionRow}>
        <HeaderActionButton
          label={selectedCategory || t('categoryFilter')}
          icon="filter-outline"
          isActive={Boolean(selectedCategory)}
          onPress={onOpenCategoryFilter}
          onClear={selectedCategory ? () => onSelectCategory(null) : undefined}
        />

        <HeaderActionButton
          label={t('sort')}
          icon="swap-vertical-outline"
          isActive={sortType !== SortType.NameAsc}
          activeBadge={sortType !== SortType.NameAsc ? '•' : undefined}
          onPress={onOpenSort}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  androidSolidHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    marginBottom: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  buttonOuter: {
    flex: 1,
    borderRadius: 22,
  },
  actionButton: {
    height: 42,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonIcon: {
    marginRight: 2,
  },
  buttonLabel: {
    fontSize: 13.5,
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    marginLeft: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  clearHit: {
    marginLeft: 2,
    padding: 2,
  },
});

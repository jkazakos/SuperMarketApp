import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { SortType } from '../types';
import { ProductsHeaderProps } from './ProductsHeader.types';

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  title,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  sortType,
  onSelectSort,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerTitleStyle: {
            color: colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
          },
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Menu
          icon="arrow.up.arrow.down"
          separateBackground
          tintColor={sortType !== SortType.NameAsc ? colors.primary : undefined}
          accessibilityLabel={t('sort')}
        >
          <Stack.Toolbar.Menu inline title={t('sortBy')}>
            <Stack.Toolbar.MenuAction
              isOn={sortType === SortType.NameAsc}
              onPress={() => onSelectSort(SortType.NameAsc)}
            >
              {t('sortNameAsc')}
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              isOn={sortType === SortType.NameDesc}
              onPress={() => onSelectSort(SortType.NameDesc)}
            >
              {t('sortNameDesc')}
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu inline>
            <Stack.Toolbar.MenuAction
              isOn={sortType === SortType.PriceAsc}
              onPress={() => onSelectSort(SortType.PriceAsc)}
            >
              {t('sortPriceAsc')}
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              isOn={sortType === SortType.PriceDesc}
              onPress={() => onSelectSort(SortType.PriceDesc)}
            >
              {t('sortPriceDesc')}
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
          <Stack.Toolbar.Menu inline>
            <Stack.Toolbar.MenuAction
              isOn={sortType === SortType.DiscountAsc}
              onPress={() => onSelectSort(SortType.DiscountAsc)}
            >
              {t('sortDiscountAsc')}
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              isOn={sortType === SortType.DiscountDesc}
              onPress={() => onSelectSort(SortType.DiscountDesc)}
            >
              {t('sortDiscountDesc')}
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
          {sortType !== SortType.NameAsc ? (
            <Stack.Toolbar.Menu inline>
              <Stack.Toolbar.MenuAction
                icon="xmark.circle"
                destructive
                onPress={() => onSelectSort(SortType.NameAsc)}
              >
                {t('clearSort')}
              </Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
          ) : null}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Stack.SearchBar
        placeholder={t('search')}
        onChangeText={(e) => onSearchChange(e.nativeEvent.text)}
        onCancelButtonPress={() => onSearchChange('')}
        hideWhenScrolling={false}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon={
            selectedCategory
              ? 'line.3.horizontal.decrease.circle.fill'
              : 'line.3.horizontal.decrease'
          }
          separateBackground
          tintColor={selectedCategory ? colors.primary : undefined}
          accessibilityLabel={t('categoryFilter')}
        >
          <Stack.Toolbar.Menu inline>
            <Stack.Toolbar.MenuAction
              isOn={!selectedCategory}
              onPress={() => onSelectCategory(null)}
            >
              {t('allProducts')}
            </Stack.Toolbar.MenuAction>
            {categories.map((category) => (
              <Stack.Toolbar.MenuAction
                key={category}
                isOn={selectedCategory === category}
                onPress={() =>
                  onSelectCategory(selectedCategory === category ? null : category)
                }
              >
                {category}
              </Stack.Toolbar.MenuAction>
            ))}
          </Stack.Toolbar.Menu>
          {selectedCategory ? (
            <Stack.Toolbar.Menu inline>
              <Stack.Toolbar.MenuAction
                icon="xmark.circle"
                destructive
                onPress={() => onSelectCategory(null)}
              >
                {t('clearFilter')}
              </Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
          ) : null}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
    </>
  );
};

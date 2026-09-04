import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { CurrencyFormatter } from '@/core/utils/currencyFormatter';

interface SpendingCardProps {
  title: string;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
}

export const SpendingCard: React.FC<SpendingCardProps> = ({
  title,
  amount,
  icon,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}
      >
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>
          {CurrencyFormatter.format(amount)} €
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
  },
});

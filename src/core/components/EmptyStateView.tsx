import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';

interface EmptyStateViewProps {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  message,
  icon = 'basket-outline',
  actionLabel,
  onAction,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {icon && (
        <View
          style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name={icon} size={48} color={colors.textSecondary} />
        </View>
      )}
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';

interface EmptyStateViewProps {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  message,
  icon = 'basket-outline',
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {icon && (
        <Ionicons
          name={icon}
          size={64}
          color={colors.textSecondary}
          style={{ opacity: 0.5, marginBottom: 16 }}
        />
      )}
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
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
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
});

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

export const LoadingIndicator: React.FC<{ size?: 'small' | 'large' }> = ({ size = 'large' }) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

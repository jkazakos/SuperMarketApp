import React, { useEffect } from 'react';
import { Text, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';

interface CustomSnackBarProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
}

export const CustomSnackBar: React.FC<CustomSnackBarProps> = ({
  visible,
  message,
  type = 'info',
  onDismiss,
  duration = 2500,
}) => {
  const { colors } = useAppTheme();
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (message) {
        AccessibilityInfo.announceForAccessibility(message);
      }

      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onDismiss());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, message, onDismiss, opacity]);

  if (!visible) return null;

  const backgroundColor =
    type === 'error' ? colors.error : type === 'success' ? colors.success : colors.card;

  const textColor = type === 'error' || type === 'success' ? '#FFFFFF' : colors.textPrimary;

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion={type === 'error' ? 'assertive' : 'polite'}
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor: colors.border,
          opacity,
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

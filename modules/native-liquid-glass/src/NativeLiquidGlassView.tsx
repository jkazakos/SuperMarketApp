import React from 'react';
import { View, Platform, ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';

export interface NativeTabItem {
  key: string;
  name: string;
  label: string;
  icon: string;
  badgeCount: number;
}

export interface NativeLiquidGlassProps extends ViewProps {
  tabs: NativeTabItem[];
  selectedIndex: number;
  isDark: boolean;
  onTabSelect?: (event: { nativeEvent: { index: number; name: string } }) => void;
}

let NativeComponent: React.ComponentType<NativeLiquidGlassProps> | null = null;

if (Platform.OS === 'ios') {
  try {
    NativeComponent = requireNativeViewManager(
      'NativeLiquidGlass',
      'NativeLiquidGlassView'
    );
  } catch {
    NativeComponent = null;
  }
}

export const isNativeLiquidGlassAvailable = (): boolean => {
  return NativeComponent !== null;
};

export const NativeLiquidGlassView: React.FC<NativeLiquidGlassProps> = (props) => {
  if (NativeComponent) {
    return <NativeComponent {...props} />;
  }
  return null;
};

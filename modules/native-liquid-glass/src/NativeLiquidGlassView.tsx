import React from 'react';
import { View, Platform, ViewProps } from 'react-native';
import { requireNativeViewManager, requireNativeModule } from 'expo-modules-core';

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

export const isNativeLiquidGlassAvailable = (): boolean => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  try {
    const nativeModule = requireNativeModule('NativeLiquidGlass');
    return !!nativeModule;
  } catch {
    return false;
  }
};

const getNativeComponent = (): React.ComponentType<NativeLiquidGlassProps> | null => {
  if (NativeComponent) {
    return NativeComponent;
  }
  if (isNativeLiquidGlassAvailable()) {
    try {
      NativeComponent = requireNativeViewManager(
        'NativeLiquidGlass',
        'NativeLiquidGlassView'
      );
      return NativeComponent;
    } catch {
      return null;
    }
  }
  return null;
};

export const NativeLiquidGlassView: React.FC<NativeLiquidGlassProps> = (props) => {
  const Component = getNativeComponent();
  if (Component) {
    return <Component {...props} />;
  }
  return null;
};

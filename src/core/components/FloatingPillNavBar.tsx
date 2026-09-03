import React from 'react';
import { Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { IOSLiquidGlassNavBar } from './bottom-nav/IOSLiquidGlassNavBar';
import { AndroidMaterialNavBar } from './bottom-nav/AndroidMaterialNavBar';

export const FloatingPillNavBar: React.FC<BottomTabBarProps> = (props) => {
  if (Platform.OS === 'ios') {
    return <IOSLiquidGlassNavBar {...props} />;
  }

  return <AndroidMaterialNavBar {...props} />;
};

export { IOSLiquidGlassNavBar, AndroidMaterialNavBar };

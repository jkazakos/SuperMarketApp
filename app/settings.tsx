import React from 'react';
import { useNavigation } from 'expo-router';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';

export default function SettingsRoute() {
  const navigation = useNavigation();
  return (
    <SettingsScreen
      navigation={navigation as any}
      route={{
        key: 'Settings',
        name: 'Settings',
        params: undefined,
      }}
    />
  );
}

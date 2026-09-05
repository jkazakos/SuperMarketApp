import React from 'react';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { useNavigation } from 'expo-router';

export default function ProfileRoute() {
  const navigation = useNavigation();
  return (
    <ProfileScreen
      navigation={navigation as any}
      route={{ key: 'Profile', name: 'Profile' } as any}
    />
  );
}

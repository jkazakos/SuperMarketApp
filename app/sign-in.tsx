import React from 'react';
import { useNavigation } from 'expo-router';
import { SignInScreen } from '@/features/auth/screens/SignInScreen';

export default function SignInRoute() {
  const navigation = useNavigation();
  return (
    <SignInScreen
      navigation={navigation as any}
      route={{
        key: 'SignIn',
        name: 'SignIn',
        params: undefined,
      }}
    />
  );
}

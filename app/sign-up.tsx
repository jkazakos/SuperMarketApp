import React from 'react';
import { useNavigation } from 'expo-router';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';

export default function SignUpRoute() {
  const navigation = useNavigation();
  return (
    <SignUpScreen
      navigation={navigation as any}
      route={{
        key: 'SignUp',
        name: 'SignUp',
        params: undefined,
      }}
    />
  );
}

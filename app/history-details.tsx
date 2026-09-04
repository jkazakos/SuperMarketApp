import React from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { HistoryDetailsScreen } from '@/features/history/screens/HistoryDetailsScreen';

export default function HistoryDetailsRoute() {
  const navigation = useNavigation();
  const rawParams = useLocalSearchParams();

  let history = (rawParams as any).history;
  if (typeof history === 'string') {
    try {
      history = JSON.parse(history);
    } catch {
      // Keep as string if parsing fails
    }
  }

  return (
    <HistoryDetailsScreen
      navigation={navigation as any}
      route={{
        key: 'HistoryDetails',
        name: 'HistoryDetails',
        params: { history },
      }}
    />
  );
}

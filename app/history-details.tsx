import React, { useMemo } from 'react';
import { useLocalSearchParams, useNavigation, useRoute } from 'expo-router';
import { HistoryDetailsScreen } from '@/features/history/screens/HistoryDetailsScreen';
import { useHistoryStore } from '@/features/history/stores/useHistoryStore';
import { ShoppingHistory } from '@/features/history/types';

export default function HistoryDetailsRoute(props: any) {
  const navigation = useNavigation();
  const rnRoute = useRoute<any>();
  const rawParams = useLocalSearchParams();
  const historyList = useHistoryStore((s) => s.history);

  const history = useMemo((): ShoppingHistory | null => {
    // 1. Direct route param from React Navigation
    const directHistory = rnRoute?.params?.history || props?.route?.params?.history;
    if (directHistory && typeof directHistory === 'object' && directHistory.id) {
      return directHistory;
    }

    // 2. Parsed JSON from stringified route param
    if (typeof directHistory === 'string' && directHistory !== '[object Object]') {
      try {
        const parsed = JSON.parse(directHistory);
        if (parsed && typeof parsed === 'object' && parsed.id) return parsed;
      } catch {}
    }

    // 3. Raw search params from expo-router (if JSON string)
    const raw = rawParams.history;
    if (typeof raw === 'string' && raw !== '[object Object]') {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.id) return parsed;
      } catch {}
    }

    // 4. By ID lookup
    const historyId =
      directHistory?.id ||
      rnRoute?.params?.id ||
      props?.route?.params?.id ||
      (typeof rawParams.id === 'string' ? rawParams.id : undefined);

    if (historyId) {
      const found = historyList.find((h) => h.id === String(historyId));
      if (found) return found;
    }

    return null;
  }, [rnRoute?.params, props?.route?.params, rawParams, historyList]);

  return (
    <HistoryDetailsScreen
      navigation={navigation as any}
      route={{
        key: 'HistoryDetails',
        name: 'HistoryDetails',
        params: { history: history as any },
      }}
    />
  );
}

import { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation, useRoute } from 'expo-router';
import { HistoryDetailsScreen } from '@/features/history/screens/HistoryDetailsScreen';
import { useHistoryStore } from '@/features/history/stores/useHistoryStore';
import { useAppTheme } from '@/core/theme/ThemeContext';

export default function HistoryDetailsRoute() {
  const navigation = useNavigation();
  const rawParams = useLocalSearchParams<{ id?: string }>();
  const rnRoute = useRoute<any>();
  const historyList = useHistoryStore((s) => s.history);
  const loading = useHistoryStore((s) => s.loading);
  const { colors } = useAppTheme();

  const historyId = rawParams.id || rnRoute?.params?.id;

  const history = useMemo(() => {
    if (!historyId) return null;
    return historyList.find((h) => h.id === String(historyId)) ?? null;
  }, [historyId, historyList]);

  if (loading && !history) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <HistoryDetailsScreen
      navigation={navigation as any}
      route={{
        key: 'HistoryDetails',
        name: 'HistoryDetails',
        params: { history: history as any, id: historyId },
      }}
    />
  );
}

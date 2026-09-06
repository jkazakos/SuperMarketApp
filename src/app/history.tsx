import { useNavigation } from 'expo-router';
import { HistoryScreen } from '@/features/history/screens/HistoryScreen';

export default function HistoryRoute() {
  const navigation = useNavigation();
  return (
    <HistoryScreen
      navigation={navigation as any}
      route={{
        key: 'History',
        name: 'History',
        params: undefined,
      }}
    />
  );
}

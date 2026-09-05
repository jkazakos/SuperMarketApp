import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useHistoryStore } from '../stores/useHistoryStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { HistoryCard } from '../components/HistoryCard';
import { HistoryHeader } from '../components/HistoryHeader';
import { ConfirmDialog } from '@/core/components/ConfirmDialog';
import { EmptyStateView } from '@/core/components/EmptyStateView';
import { CustomSnackBar } from '@/core/components/CustomSnackBar';
import { RootStackScreenProps } from '@/navigation/types';
import { ShoppingHistory } from '../types';

export const HistoryScreen: React.FC<RootStackScreenProps<'History'>> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const history = useHistoryStore((s) => s.history);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const [clearDialogVisible, setClearDialogVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const handleClear = async () => {
    await clearHistory();
    setClearDialogVisible(false);
    setSnackMessage(t('shoppingHistoryCleared'));
    setSnackVisible(true);
  };

  const handleCardPress = (item: ShoppingHistory) => {
    (navigation as any).navigate('history-details', {
      id: item.id,
    });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      (navigation as any).navigate('(tabs)', { screen: '(products)' });
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Platform-Specific Native Header (iOS UIKit navigation vs Android Material 3 header) */}
        <HistoryHeader title={t('shoppingHistory')} onBack={handleBack} />
        <EmptyStateView message={t('guestMessage')} icon="lock-closed-outline" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Platform-Specific Native Header (iOS UIKit navigation vs Android Material 3 header) */}
      <HistoryHeader
        title={t('shoppingHistory')}
        onBack={handleBack}
        onClear={history.length > 0 ? () => setClearDialogVisible(true) : undefined}
      />

      {/* History List */}
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 20, 40),
          flexGrow: 1,
        }}
        renderItem={({ item }) => (
          <HistoryCard history={item} onPress={() => handleCardPress(item)} />
        )}
        ListEmptyComponent={
          <EmptyStateView message={t('emptyShoppingHistoryText')} icon="receipt-outline" />
        }
      />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        visible={clearDialogVisible}
        title={t('clearShoppingHistory')}
        message={t('clearShoppingHistoryConfirmationMessage')}
        onConfirm={handleClear}
        onCancel={() => setClearDialogVisible(false)}
      />

      {/* SnackBar */}
      <CustomSnackBar
        visible={snackVisible}
        message={snackMessage}
        type="success"
        onDismiss={() => setSnackVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

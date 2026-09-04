import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useHistoryStore } from '../stores/useHistoryStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { HistoryCard } from '../components/HistoryCard';
import { ConfirmDialog } from '@/core/components/ConfirmDialog';
import { EmptyStateView } from '@/core/components/EmptyStateView';
import { CustomSnackBar } from '@/core/components/CustomSnackBar';
import { RootStackScreenProps } from '@/navigation/types';
import { ShoppingHistory } from '../types';

export const HistoryScreen: React.FC<RootStackScreenProps<'History'>> = ({
  navigation,
}) => {
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
    (navigation as any).navigate('history-details', { history: item });
  };

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: Math.max(insets.top, 16),
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t('shoppingHistory')}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <EmptyStateView message={t('guestMessage')} icon="lock-closed-outline" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('shoppingHistory')}
        </Text>

        {history.length > 0 ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setClearDialogVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* History List */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        renderItem={({ item }) => (
          <HistoryCard history={item} onPress={() => handleCardPress(item)} />
        )}
        ListEmptyComponent={
          <EmptyStateView
            message={t('emptyShoppingHistoryText')}
            icon="receipt-outline"
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  clearButton: {
    padding: 8,
  },
});

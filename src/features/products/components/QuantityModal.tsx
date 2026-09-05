import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { Product } from '../types';

interface QuantityModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
}

export const QuantityModal: React.FC<QuantityModalProps> = ({
  visible,
  product,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [quantityText, setQuantityText] = useState('1');
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleConfirm = () => {
    const qty = parseInt(quantityText.trim(), 10);
    if (isNaN(qty) || qty <= 0) {
      setError(t('invalidQuantity'));
      return;
    }

    if (qty > product.quantityAvailable) {
      setError(t('productAvailability', { quantity: product.quantityAvailable }));
      return;
    }

    setError(null);
    onSubmit(qty);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
      aria-modal={true}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.dialogContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t('addToShoppingList')}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  borderColor: error ? colors.error : colors.border,
                  backgroundColor: colors.surfaceVariant,
                },
              ]}
              keyboardType="number-pad"
              value={quantityText}
              onChangeText={(text) => {
                setQuantityText(text);
                setError(null);
              }}
              placeholder={t('enterQuantityHint')}
              placeholderTextColor={colors.textSecondary}
              accessibilityLabel={t('enterQuantityHint')}
              autoFocus
            />
            {error && (
              <Text
                accessibilityLiveRegion="polite"
                style={[styles.errorText, { color: colors.error }]}
              >
                {error}
              </Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('cancelText')}
              hitSlop={8}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                {t('cancelText')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('add')}
              hitSlop={8}
            >
              <Text style={styles.confirmText}>{t('add')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

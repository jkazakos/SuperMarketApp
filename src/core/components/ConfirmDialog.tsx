import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../theme/ThemeContext';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  positiveText?: string;
  negativeText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  positiveText,
  negativeText,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal={true}
      aria-modal={true}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          accessibilityRole="alert"
          style={[
            styles.dialogContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={negativeText || t('no')}
              hitSlop={8}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                {negativeText || t('no')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onConfirm}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={positiveText || t('yes')}
              hitSlop={8}
            >
              <Text style={styles.confirmText}>{positiveText || t('yes')}</Text>
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { SortType } from '../types';

interface SortModalProps {
  visible: boolean;
  selectedSort: SortType;
  onClose: () => void;
  onSelect: (sort: SortType) => void;
}

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  selectedSort,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const options = [
    { type: SortType.NameAsc, label: t('sortNameAsc') },
    { type: SortType.NameDesc, label: t('sortNameDesc') },
    { type: SortType.PriceAsc, label: t('sortPriceAsc') },
    { type: SortType.PriceDesc, label: t('sortPriceDesc') },
    { type: SortType.DiscountAsc, label: t('sortDiscountAsc') },
    { type: SortType.DiscountDesc, label: t('sortDiscountDesc') },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
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
            {t('sortBy')}
          </Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {options.map((opt) => {
              const isSelected = selectedSort === opt.type;
              return (
                <TouchableOpacity
                  key={opt.type}
                  style={[
                    styles.optionRow,
                    isSelected && { backgroundColor: colors.primaryContainer },
                  ]}
                  onPress={() => {
                    onSelect(opt.type);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: isSelected ? colors.primary : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                {t('cancelText')}
              </Text>
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
    maxHeight: '75%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
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
  scrollView: {
    maxHeight: 340,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
  },
  optionText: {
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

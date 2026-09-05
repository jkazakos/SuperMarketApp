import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';

interface CategoryFilterModalProps {
  visible: boolean;
  categories: string[];
  selectedCategory: string | null;
  onClose: () => void;
  onSelect: (category: string | null) => void;
}

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  visible,
  categories,
  selectedCategory,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

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
        {Platform.OS === 'ios' && (
          <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill} />
        )}
        <Pressable
          style={[
            styles.dialogContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('filterCategories')}</Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* All Categories option */}
            <TouchableOpacity
              style={[
                styles.optionRow,
                !selectedCategory && { backgroundColor: colors.primaryContainer },
              ]}
              onPress={() => {
                onSelect(null);
                onClose();
              }}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: !selectedCategory }}
              accessibilityLabel={t('allProducts')}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: !selectedCategory ? colors.primary : colors.textPrimary,
                    fontWeight: !selectedCategory ? '700' : '500',
                  },
                ]}
              >
                {t('allProducts')}
              </Text>
              {!selectedCategory && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.optionRow,
                    isSelected && { backgroundColor: colors.primaryContainer },
                  ]}
                  onPress={() => {
                    onSelect(cat);
                    onClose();
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={cat}
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
                    {cat}
                  </Text>
                  {isSelected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '75%',
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  scrollView: {
    maxHeight: 320,
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

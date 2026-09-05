import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useWishlistStore } from '@/features/wishlist/stores/useWishlistStore';
import { useSpendingTotals } from '../stores/useProfileStore';
import { SpendingCard } from '../components/SpendingCard';
import { ProfileHeader } from '../components/ProfileHeader';
import { ConfirmDialog } from '@/core/components/ConfirmDialog';
import { CustomSnackBar } from '@/core/components/CustomSnackBar';
import { MainTabScreenProps } from '@/navigation/types';
import { getFullName } from '@/features/auth/types';

export const ProfileScreen: React.FC<MainTabScreenProps<'Profile'>> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const spending = useSpendingTotals();
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const [signOutDialogVisible, setSignOutDialogVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const displayName = getFullName(profile) || user?.displayName || user?.email || 'User';

  const handleSignOut = async () => {
    await signOut();
    setSignOutDialogVisible(false);
    setSnackMessage(t('signOutSuccessful'));
    setSnackVisible(true);
  };

  const navigateToHistory = () => {
    (navigation as any).navigate('history');
  };

  const navigateToWishlist = () => {
    (navigation as any).navigate('wishlist');
  };

  const navigateToSettings = () => {
    (navigation as any).navigate('settings');
  };

  const navigateToSignIn = () => {
    (navigation as any).navigate('sign-in');
  };

  const navigateToSignUp = () => {
    (navigation as any).navigate('sign-up');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Platform-Specific Native Header (iOS UIKit bar items vs Android Material 3 header) */}
      <ProfileHeader title={t('userProfile')} onOpenSettings={navigateToSettings} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 8,
            paddingBottom: 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card or Guest Card */}
        {user ? (
          <View
            style={[
              styles.userCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.avatarCircle, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{displayName}</Text>
              {user.email && (
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                  {user.email}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.guestCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="person-circle-outline" size={56} color={colors.textSecondary} />
            <Text style={[styles.guestPrompt, { color: colors.textPrimary }]}>
              {t('guestMessage')}
            </Text>
            <View style={styles.guestButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.guestButton,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={navigateToSignIn}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('signIn')}
              >
                <Text style={styles.guestButtonText}>{t('signIn')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.guestButton,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
                onPress={navigateToSignUp}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t('signUp')}
              >
                <Text style={[styles.guestButtonText, { color: colors.textPrimary }]}>
                  {t('signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* If Logged In: Spending Statistics & Order History Link */}
        {user && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textPrimary, marginTop: 24, marginBottom: 8 },
              ]}
            >
              {t('SpendingDashboard')}
            </Text>

            <SpendingCard
              title={t('weeklySpending', { amount: '' }).replace(': €', '')}
              amount={spending.weekly}
              icon="calendar-outline"
            />

            <SpendingCard
              title={t('monthlySpending', { amount: '' }).replace(': €', '')}
              amount={spending.monthly}
              icon="trending-up-outline"
            />

            {/* Wishlist Button */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  marginTop: 16,
                },
              ]}
              onPress={navigateToWishlist}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${t('wishlist')}${wishlistCount > 0 ? `, ${t('itemCount', { count: wishlistCount })}` : ''}`}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[styles.menuIconContainer, { backgroundColor: colors.secondaryContainer }]}
                >
                  <Ionicons name="heart" size={20} color={colors.secondary} />
                </View>
                <Text style={[styles.menuItemLabel, { color: colors.textPrimary }]}>
                  {t('wishlist')}
                </Text>
              </View>
              <View style={styles.menuItemRight}>
                {wishlistCount > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: colors.primaryContainer }]}>
                    <Text style={[styles.countBadgeText, { color: colors.primary }]}>
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* View Purchase History Button */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  marginTop: 10,
                },
              ]}
              onPress={navigateToHistory}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('viewHistory')}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[styles.menuIconContainer, { backgroundColor: colors.surfaceVariant }]}
                >
                  <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuItemLabel, { color: colors.textPrimary }]}>
                  {t('viewHistory')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Sign Out Button */}
            <TouchableOpacity
              style={[
                styles.signOutButton,
                {
                  backgroundColor: colors.error + '15',
                  borderColor: colors.error + '30',
                },
              ]}
              onPress={() => setSignOutDialogVisible(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('signOut')}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.signOutText, { color: colors.error }]}>{t('signOut')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        visible={signOutDialogVisible}
        title={t('signOut')}
        message={t('signOutConfirmation')}
        positiveText={t('yes')}
        negativeText={t('cancelText')}
        onConfirm={handleSignOut}
        onCancel={() => setSignOutDialogVisible(false)}
      />

      {/* SnackBar */}
      <CustomSnackBar
        visible={snackVisible}
        message={snackMessage}
        type="info"
        onDismiss={() => setSnackVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  guestCard: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
    textAlign: 'center',
  },
  guestPrompt: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 22,
  },
  guestButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  guestButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

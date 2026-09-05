import React from 'react';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { ProfileHeaderProps } from './ProfileHeader.types';

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  title,
  onOpenSettings,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerTitleStyle: {
            color: colors.textPrimary,
            fontSize: 26,
            fontWeight: '700',
          },
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="gearshape"
          separateBackground
          onPress={onOpenSettings}
          accessibilityLabel={t('settings')}
        />
      </Stack.Toolbar>
    </>
  );
};

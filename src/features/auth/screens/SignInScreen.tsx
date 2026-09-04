import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/core/theme/ThemeContext';
import { AuthService } from '../services/authService';
import { CustomSnackBar } from '@/core/components/CustomSnackBar';
import { RootStackScreenProps } from '@/navigation/types';

export const SignInScreen: React.FC<RootStackScreenProps<'SignIn'>> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const [snackMessage, setSnackMessage] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  const isValidEmail = (val: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val);
  };

  const handleSignIn = async () => {
    if (!email.trim()) {
      setSnackMessage(t('emailRequired'));
      setSnackVisible(true);
      return;
    }

    if (!isValidEmail(email.trim())) {
      setSnackMessage(t('invalidEmailFormat'));
      setSnackVisible(true);
      return;
    }

    if (!password) {
      setSnackMessage(t('passwordRequired'));
      setSnackVisible(true);
      return;
    }

    setLoading(true);

    try {
      await AuthService.signIn(email, password);
      navigation.goBack();
    } catch (e: any) {
      setSnackMessage(t('wrongEmailOrPassword'));
      setSnackVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t('signIn')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to access your shopping list, wishlist, and orders.
          </Text>

          {/* Email Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('emailHint')}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="name@example.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {t('passwordHint')}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={obscurePassword}
              />
              <TouchableOpacity
                onPress={() => setObscurePassword(!obscurePassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={obscurePassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{t('signIn')}</Text>
            )}
          </TouchableOpacity>

          {/* Prompt to Sign Up */}
          <View style={styles.promptRow}>
            <Text style={{ color: colors.textSecondary }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('sign-up')}
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                {t('signUp')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <CustomSnackBar
          visible={snackVisible}
          message={snackMessage}
          type="error"
          onDismiss={() => setSnackVisible(false)}
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  submitButton: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  promptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkText: {
    fontWeight: '700',
  },
});

/**
 * LoginScreen — Figma "Log in" screen
 * Minimal underline inputs, large two-line heading, circular social icons.
 */
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Typography } from '../../theme/tokens';
import type { RootStackParamList } from '../../types/index';
import { isEmptyOrWhitespace } from '../../utils/validation';
import UnderlineInput from '../../components/UnderlineInput';
import PrimaryButton from '../../components/PrimaryButton';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { state, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    const emailEmpty = isEmptyOrWhitespace(email);
    const passwordEmpty = isEmptyOrWhitespace(password);
    setEmailError(emailEmpty ? 'Email is required.' : '');
    setPasswordError(passwordEmpty ? 'Password is required.' : '');
    if (emailEmpty || passwordEmpty) return;
    await login(email, password);
  };

  const handleSocialAuth = (provider: 'Apple' | 'Google' | 'Facebook') => {
    console.log(`Social auth initiated: ${provider}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Two-line heading */}
        <Text style={styles.headingLine1}>Log into</Text>
        <Text style={styles.headingLine2}>your account</Text>

        <View style={styles.form}>
          <UnderlineInput
            placeholder="Email address"
            value={email}
            onChangeText={(t: string) => { setEmail(t); if (emailError) setEmailError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMessage={emailError}
          />
          <UnderlineInput
            placeholder="Password"
            value={password}
            onChangeText={(t: string) => { setPassword(t); if (passwordError) setPasswordError(''); }}
            secureTextEntry
            autoCapitalize="none"
            errorMessage={passwordError}
          />

          <TouchableOpacity style={styles.forgotRow} accessibilityRole="button">
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {state.error ? (
            <Text style={styles.authError} accessibilityRole="alert">
              {state.error}
            </Text>
          ) : null}

          <PrimaryButton
            label="LOG IN"
            onPress={handleLogin}
            loading={state.isLoading}
            disabled={state.isLoading}
          />

          <Text style={styles.orText}>or log in with</Text>

          {/* Social icons row */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialCircle}
              onPress={() => handleSocialAuth('Apple')}
              accessibilityRole="button"
              accessibilityLabel="Continue with Apple"
            >
              <Text style={styles.socialIcon}>🍎</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialCircle}
              onPress={() => handleSocialAuth('Google')}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <Text style={styles.socialIcon}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialCircle}
              onPress={() => handleSocialAuth('Facebook')}
              accessibilityRole="button"
              accessibilityLabel="Continue with Facebook"
            >
              <Text style={[styles.socialIcon, styles.fbIcon]}>f</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.signUpRow}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Registration')}
            accessibilityRole="link"
          >
            <Text style={styles.signUpLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  headingLine1: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.black,
    lineHeight: 36,
  },
  headingLine2: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '700',
    color: Colors.black,
    lineHeight: 36,
    marginBottom: Spacing.xl,
  },
  form: {
    flex: 1,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray600,
  },
  authError: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  orText: {
    textAlign: 'center',
    fontSize: Typography.fontSize.sm,
    color: Colors.gray400,
    marginVertical: Spacing.lg,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  socialCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  socialIcon: {
    fontSize: 20,
    color: Colors.black,
    fontWeight: '700',
  },
  fbIcon: {
    color: '#1877F2',
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  signUpText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
  },
  signUpLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.black,
    textDecorationLine: 'underline',
  },
});

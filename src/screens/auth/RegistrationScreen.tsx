/**
 * RegistrationScreen — Figma "Sign up" screen
 * Minimal underline inputs, two-line heading.
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
import { doPasswordsMatch, isEmptyOrWhitespace } from '../../utils/validation';
import UnderlineInput from '../../components/UnderlineInput';
import PrimaryButton from '../../components/PrimaryButton';

type Props = StackScreenProps<RootStackParamList, 'Registration'>;

export default function RegistrationScreen({ navigation }: Props) {
  const { state, register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullNameError, setFullNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSignUp = async () => {
    const fullNameEmpty = isEmptyOrWhitespace(fullName);
    const usernameEmpty = isEmptyOrWhitespace(username);
    const passwordEmpty = isEmptyOrWhitespace(password);
    const confirmPasswordEmpty = isEmptyOrWhitespace(confirmPassword);

    setFullNameError(fullNameEmpty ? 'Full name is required.' : '');
    setUsernameError(usernameEmpty ? 'Email is required.' : '');
    setPasswordError(passwordEmpty ? 'Password is required.' : '');

    if (!confirmPasswordEmpty && !passwordEmpty && !doPasswordsMatch(password, confirmPassword)) {
      setConfirmPasswordError('Passwords do not match.');
    } else if (confirmPasswordEmpty) {
      setConfirmPasswordError('Please confirm your password.');
    } else {
      setConfirmPasswordError('');
    }

    if (
      fullNameEmpty || usernameEmpty || passwordEmpty || confirmPasswordEmpty ||
      !doPasswordsMatch(password, confirmPassword)
    ) return;

    await register(fullName, username, fullName + '@example.com', password);
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
        <Text style={styles.headingLine1}>Create</Text>
        <Text style={styles.headingLine2}>your account</Text>

        <View style={styles.form}>
          <UnderlineInput
            placeholder="Enter your name"
            value={fullName}
            onChangeText={(t: string) => { setFullName(t); if (fullNameError) setFullNameError(''); }}
            autoCapitalize="words"
            errorMessage={fullNameError}
          />
          <UnderlineInput
            placeholder="Email address"
            value={username}
            onChangeText={(t: string) => { setUsername(t); if (usernameError) setUsernameError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMessage={usernameError}
          />
          <UnderlineInput
            placeholder="Password"
            value={password}
            onChangeText={(t: string) => {
              setPassword(t);
              if (passwordError) setPasswordError('');
              if (confirmPassword && !isEmptyOrWhitespace(confirmPassword)) {
                setConfirmPasswordError(
                  doPasswordsMatch(t, confirmPassword) ? '' : 'Passwords do not match.',
                );
              }
            }}
            secureTextEntry
            autoCapitalize="none"
            errorMessage={passwordError}
          />
          <UnderlineInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={(t: string) => {
              setConfirmPassword(t);
              if (!isEmptyOrWhitespace(t)) {
                setConfirmPasswordError(
                  doPasswordsMatch(password, t) ? '' : 'Passwords do not match.',
                );
              } else {
                setConfirmPasswordError('');
              }
            }}
            secureTextEntry
            autoCapitalize="none"
            errorMessage={confirmPasswordError}
          />

          {state.error ? (
            <Text style={styles.authError} accessibilityRole="alert">
              {state.error}
            </Text>
          ) : null}

          <View style={styles.buttonWrapper}>
            <PrimaryButton
              label="SIGN UP"
              onPress={handleSignUp}
              loading={state.isLoading}
              disabled={state.isLoading}
            />
          </View>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="link"
          >
            <Text style={styles.loginLink}>Login</Text>
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
  authError: {
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  buttonWrapper: {
    marginTop: Spacing.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  loginText: {
    fontSize: Typography.fontSize.base,
    color: Colors.gray600,
  },
  loginLink: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.black,
    textDecorationLine: 'underline',
  },
});

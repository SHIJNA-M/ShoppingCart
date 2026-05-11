import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import SocialAuthButton from '../../components/SocialAuthButton';
import UnderlineInput from '../../components/UnderlineInput';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../theme/tokens';
import { ms } from '../../utils/scale';
import { doPasswordsMatch, isEmptyOrWhitespace } from '../../utils/validation';
import type { RootStackParamList } from '../../types/index';

type Props = StackScreenProps<RootStackParamList, 'Registration'>;

export default function RegistrationScreen({ navigation }: Props) {
  const { state, register, clearError } = useAuth();
  const { width: W, height: H } = useWindowDimensions();

  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameErr, setNameErr]       = useState('');
  const [emailErr, setEmailErr]     = useState('');
  const [passErr, setPassErr]       = useState('');
  const [confirmErr, setConfirmErr] = useState('');

  const handleSignUp = async () => {
    const nE = isEmptyOrWhitespace(fullName);
    const eE = isEmptyOrWhitespace(email);
    const pE = isEmptyOrWhitespace(password);
    const cE = isEmptyOrWhitespace(confirmPassword);
    const pShort = !pE && password.length < 8;

    setNameErr(nE ? 'Name is required.' : '');
    setEmailErr(eE ? 'Email is required.' : '');
    setPassErr(
      pE ? 'Password is required.'
        : pShort ? 'Password must be at least 8 characters.'
        : '',
    );
    setConfirmErr(
      cE ? 'Please confirm your password.'
        : !doPasswordsMatch(password, confirmPassword) ? 'Passwords do not match.'
        : '',
    );

    if (nE || eE || pE || pShort || cE || !doPasswordsMatch(password, confirmPassword)) return;
    await register(fullName, email, password);
  };

  const topPad   = H * 0.07;
  const headGap  = H * 0.04;
  const btnGap   = H * 0.025;
  const orGap    = H * 0.02;
  const socialGap = H * 0.022;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingHorizontal: W * 0.07, paddingTop: topPad }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Text style={styles.h1}>Create</Text>
        <Text style={[styles.h2, { marginBottom: headGap }]}>your account</Text>

        {/* Inputs */}
        <UnderlineInput
          placeholder="Enter your name"
          value={fullName}
          onChangeText={(t) => { setFullName(t); if (nameErr) setNameErr(''); if (state.error) clearError(); }}
          autoCapitalize="words"
          errorMessage={nameErr}
        />
        <UnderlineInput
          placeholder="Email address"
          value={email}
          onChangeText={(t) => { setEmail(t); if (emailErr) setEmailErr(''); if (state.error) clearError(); }}
          keyboardType="email-address"
          autoCapitalize="none"
          errorMessage={emailErr}
        />
        <UnderlineInput
          placeholder="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (passErr) setPassErr('');
            if (state.error) clearError();
            if (confirmPassword) setConfirmErr(doPasswordsMatch(t, confirmPassword) ? '' : 'Passwords do not match.');
          }}
          secureTextEntry
          autoCapitalize="none"
          errorMessage={passErr}
        />
        <UnderlineInput
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            setConfirmErr(t ? (doPasswordsMatch(password, t) ? '' : 'Passwords do not match.') : '');
            if (state.error) clearError();
          }}
          secureTextEntry
          autoCapitalize="none"
          errorMessage={confirmErr}
        />

        {state.error ? (
          <Text style={[styles.error, { fontSize: ms(12), marginBottom: H * 0.015 }]}>{state.error}</Text>
        ) : null}

        {/* SIGN UP button */}
        <View style={[styles.btnRow, { marginTop: btnGap, marginBottom: orGap }]}>
          <TouchableOpacity
            style={[
              styles.btn,
              {
                borderRadius: W * 0.12,
                paddingVertical: H * 0.018,
                paddingHorizontal: W * 0.16,
              },
              state.isLoading && styles.btnDisabled,
            ]}
            onPress={handleSignUp}
            disabled={state.isLoading}
            activeOpacity={0.85}
          >
            {state.isLoading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={[styles.btnText, { fontSize: ms(14) }]}>SIGN UP</Text>}
          </TouchableOpacity>
        </View>

        {/* Or divider */}
        <Text style={styles.orText}>
          or sign up with
        </Text>

        {/* Social icons */}
        <View style={[styles.socialRow, { gap: W * 0.05, marginBottom: H * 0.035 }]}>
          <SocialAuthButton provider="Apple"    onPress={() => {}} />
          <SocialAuthButton provider="Google"   onPress={() => {}} />
          <SocialAuthButton provider="Facebook" onPress={() => {}} />
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Bottom nav */}
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Already have account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.bottomLink}>Log In</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:       { flex: 1, backgroundColor: Colors.white },
  container:  { flexGrow: 1, paddingBottom: 32 },

  // Heading: Product Sans Bold 24px, line-height 48
  h1: { fontWeight: '700', fontSize: 24, lineHeight: 48, color: Colors.black },
  h2: { fontWeight: '700', fontSize: 24, lineHeight: 48, color: Colors.black },

  error:      { color: '#D32F2F', textAlign: 'center', fontSize: ms(12) },

  btnRow:     { alignItems: 'center' },
  btn:        { backgroundColor: '#1C1C1C' },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: Colors.white, fontWeight: '700', letterSpacing: 1.5, fontSize: ms(14) },

  // "or sign up with": Product Sans Light 400, 12px, line-height 24, letter-spacing 2%
  orText: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0.24,   // 2% of 12px
    width: 235,
    height: 40,
    alignSelf: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  socialRow:  { flexDirection: 'row', justifyContent: 'center' },

  spacer:     { flex: 1, minHeight: 20 },

  bottomRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 8 },
  bottomText: { color: Colors.black, fontSize: 13, fontWeight: '300' },
  bottomLink: { color: Colors.black, textDecorationLine: 'underline', fontWeight: '600', fontSize: 13 },
});

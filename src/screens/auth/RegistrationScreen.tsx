import React, { useState } from 'react';
import {
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
  const { state, register } = useAuth();
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

    setNameErr(nE ? 'Name is required.' : '');
    setEmailErr(eE ? 'Email is required.' : '');
    setPassErr(pE ? 'Password is required.' : '');
    setConfirmErr(
      cE ? 'Please confirm your password.'
        : !doPasswordsMatch(password, confirmPassword) ? 'Passwords do not match.'
        : '',
    );

    if (nE || eE || pE || cE || !doPasswordsMatch(password, confirmPassword)) return;
    await register(fullName, email, email, password);
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
        <Text style={[styles.h1, { fontSize: ms(34) }]}>Create</Text>
        <Text style={[styles.h2, { fontSize: ms(34), marginBottom: headGap }]}>your account</Text>

        {/* Inputs */}
        <UnderlineInput
          placeholder="Enter your name"
          value={fullName}
          onChangeText={(t) => { setFullName(t); if (nameErr) setNameErr(''); }}
          autoCapitalize="words"
          errorMessage={nameErr}
        />
        <UnderlineInput
          placeholder="Email address"
          value={email}
          onChangeText={(t) => { setEmail(t); if (emailErr) setEmailErr(''); }}
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
            <Text style={[styles.btnText, { fontSize: ms(14) }]}>SIGN UP</Text>
          </TouchableOpacity>
        </View>

        {/* Or divider */}
        <Text style={[styles.orText, { fontSize: ms(12), marginBottom: socialGap }]}>
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
          <Text style={[styles.bottomText, { fontSize: ms(13) }]}>Already have account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.bottomLink, { fontSize: ms(13) }]}>Log In</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:       { flex: 1, backgroundColor: Colors.white },
  container:  { flexGrow: 1, paddingBottom: 32 },

  h1: { fontWeight: '700', color: Colors.black },
  h2: { fontWeight: '700', color: Colors.black },

  error:      { color: '#D32F2F', textAlign: 'center' },

  btnRow:     { alignItems: 'center' },
  btn:        { backgroundColor: '#1C1C1C' },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: Colors.white, fontWeight: '700', letterSpacing: 1.5 },

  orText:     { textAlign: 'center', color: '#AAAAAA' },
  socialRow:  { flexDirection: 'row', justifyContent: 'center' },

  spacer:     { flex: 1, minHeight: 20 },

  bottomRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 8 },
  bottomText: { color: Colors.black },
  bottomLink: { color: Colors.black, textDecorationLine: 'underline', fontWeight: '600' },
});

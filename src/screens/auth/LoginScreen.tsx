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
import { isEmptyOrWhitespace } from '../../utils/validation';
import type { RootStackParamList } from '../../types/index';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { state, login } = useAuth();
  const { width: W, height: H } = useWindowDimensions();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError]   = useState('');

  const handleLogin = async () => {
    const eEmpty = isEmptyOrWhitespace(email);
    const pEmpty = isEmptyOrWhitespace(password);
    setEmailError(eEmpty ? 'Email is required.' : '');
    setPassError(pEmpty ? 'Password is required.' : '');
    if (eEmpty || pEmpty) return;
    await login(email, password);
  };

  // Responsive spacing based on screen height
  const topPad    = H * 0.08;
  const headGap   = H * 0.045;   // gap between heading and inputs
  const inputGap  = H * 0.012;   // gap between inputs (handled by UnderlineInput marginBottom)
  const forgotGap = H * 0.018;
  const btnGap    = H * 0.03;
  const orGap     = H * 0.022;
  const socialGap = H * 0.025;

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
        <Text style={[styles.h1, { fontSize: ms(34) }]}>Log into</Text>
        <Text style={[styles.h2, { fontSize: ms(34), marginBottom: headGap }]}>your account</Text>

        {/* Inputs */}
        <UnderlineInput
          placeholder="Email address"
          value={email}
          onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
          errorMessage={emailError}
        />
        <UnderlineInput
          placeholder="Password"
          value={password}
          onChangeText={(t) => { setPassword(t); if (passError) setPassError(''); }}
          secureTextEntry
          autoCapitalize="none"
          errorMessage={passError}
        />

        {/* Forgot password */}
        <TouchableOpacity style={[styles.forgotRow, { marginTop: forgotGap, marginBottom: forgotGap }]}>
          <Text style={[styles.forgotText, { fontSize: ms(13) }]}>Forgot Password?</Text>
        </TouchableOpacity>

        {state.error ? (
          <Text style={[styles.error, { fontSize: ms(12), marginBottom: H * 0.015 }]}>{state.error}</Text>
        ) : null}

        {/* LOG IN button */}
        <View style={[styles.btnRow, { marginBottom: orGap }]}>
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
            onPress={handleLogin}
            disabled={state.isLoading}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnText, { fontSize: ms(14) }]}>LOG IN</Text>
          </TouchableOpacity>
        </View>

        {/* Or divider */}
        <Text style={[styles.orText, { fontSize: ms(12), marginBottom: socialGap }]}>
          or log in with
        </Text>

        {/* Social icons */}
        <View style={[styles.socialRow, { gap: W * 0.05, marginBottom: H * 0.04 }]}>
          <SocialAuthButton provider="Apple"    onPress={() => {}} />
          <SocialAuthButton provider="Google"   onPress={() => {}} />
          <SocialAuthButton provider="Facebook" onPress={() => {}} />
        </View>

        {/* Spacer pushes bottom link down */}
        <View style={styles.spacer} />

        {/* Bottom nav */}
        <View style={styles.bottomRow}>
          <Text style={[styles.bottomText, { fontSize: ms(13) }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
            <Text style={[styles.bottomLink, { fontSize: ms(13) }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:       { flex: 1, backgroundColor: Colors.white },
  container:  { flexGrow: 1, paddingBottom: 32 },

  h1: { fontWeight: '700', color: Colors.black, lineHeight: undefined },
  h2: { fontWeight: '700', color: Colors.black },

  forgotRow:  { alignSelf: 'flex-end' },
  forgotText: { color: '#666' },

  error:      { color: '#D32F2F', textAlign: 'center' },

  btnRow:     { alignItems: 'center' },
  btn:        { backgroundColor: '#1C1C1C' },
  btnDisabled:{ opacity: 0.5 },
  btnText:    { color: Colors.white, fontWeight: '700', letterSpacing: 1.5 },

  orText:     { textAlign: 'center', color: '#AAAAAA' },
  socialRow:  { flexDirection: 'row', justifyContent: 'center' },

  spacer:     { flex: 1, minHeight: 24 },

  bottomRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 8 },
  bottomText: { color: Colors.black },
  bottomLink: { color: Colors.black, textDecorationLine: 'underline', fontWeight: '600' },
});

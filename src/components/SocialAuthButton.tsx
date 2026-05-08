import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import GoogleSvg from '../assets/icons/google.svg';
import { Colors } from '../theme/tokens';
import { scale } from '../utils/scale';
import type { SocialProvider } from '../types';

interface SocialAuthButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const ICON_SIZE = scale(20);

const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({ provider, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.circle}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${provider}`}
    >
      {provider === 'Apple'    && <FontAwesome5 name="apple"      size={ICON_SIZE} color="#000000" brand />}
      {provider === 'Google'   && <GoogleSvg width={ICON_SIZE} height={ICON_SIZE} />}
      {provider === 'Facebook' && <FontAwesome5 name="facebook-f" size={ICON_SIZE} color="#1877F2" brand />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
});

export default SocialAuthButton;

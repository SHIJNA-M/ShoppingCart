import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/tokens';
import type { SocialProvider } from '../types';

interface SocialAuthButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

/** Returns a text/emoji icon for each social provider. */
const getProviderIcon = (provider: SocialProvider): string => {
  switch (provider) {
    case 'Apple':
      return '🍎';
    case 'Google':
      return 'G';
    case 'Facebook':
      return 'f';
  }
};

const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  onPress,
}) => {
  const icon = getProviderIcon(provider);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Continue with ${provider}`}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>Continue with {provider}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    width: '100%',
    backgroundColor: Colors.white,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 28,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  icon: {
    fontSize: Typography.fontSize.md,
    color: Colors.black,
    fontWeight: '700',
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
  },
});

export default SocialAuthButton;

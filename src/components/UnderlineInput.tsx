/**
 * UnderlineInput — Figma-style input with only a bottom border line.
 */
import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/tokens';

interface UnderlineInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  errorMessage?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const UnderlineInput: React.FC<UnderlineInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  errorMessage,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  const hasError = Boolean(errorMessage);

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray400}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={placeholder}
      />
      {hasError && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {errorMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray400,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.black,
    backgroundColor: 'transparent',
  },
  inputError: {
    borderBottomColor: Colors.error,
  },
  errorText: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
  },
});

export default UnderlineInput;

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
import { scale, vs, ms } from '../utils/scale';

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
    marginBottom: vs(16),
    width: '100%',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray400,
    paddingVertical: vs(8),
    fontSize: ms(14),
    color: '#332218',
    backgroundColor: 'transparent',
  },
  inputError: {
    borderBottomColor: Colors.error,
  },
  errorText: {
    marginTop: vs(4),
    fontSize: ms(11),
    color: Colors.error,
  },
});

export default UnderlineInput;

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../theme/tokens';

interface SizeOptionProps {
  size: string;
  selected: boolean;
  onPress: () => void;
}

const SizeOption: React.FC<SizeOptionProps> = ({ size, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Size ${size}${selected ? ', selected' : ''}`}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {size}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    backgroundColor: Colors.white,
  },
  containerSelected: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
    color: Colors.gray800,
  },
  labelSelected: {
    color: Colors.white,
  },
});

export default SizeOption;

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Spacing } from '../theme/tokens';

interface ColorSwatchProps {
  color: string; // hex value e.g. "#FF0000"
  selected: boolean;
  onPress: () => void;
}

const SWATCH_SIZE = 28;
const RING_SIZE = SWATCH_SIZE + 6; // ring is 3px larger on each side

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Color ${color}${selected ? ', selected' : ''}`}
      style={styles.touchable}
    >
      {/* Outer ring shown when selected */}
      <View
        style={[
          styles.ring,
          selected && { borderColor: color },
        ]}
      >
        {/* Inner swatch circle */}
        <View
          style={[
            styles.swatch,
            { backgroundColor: color },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginRight: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
});

export default ColorSwatch;

import React from 'react'; 
import { View, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Typography } from './Typography';
interface RangeSliderProps {
  min: number;
  max: number;
  values: [number, number];
  onValuesChange: (values: [number, number]) => void;
  step?: number;
  width?: number;
  formatValue?: (value: number) => string;
  label?: string;
}
export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  values,
  onValuesChange,
  step = 1,
  width = 300,
  formatValue = (val) => val.toString(),
  label,
}) => {
  const sliderWidth = width;
  const thumbSize = 20;
  const getPositionFromValue = (val: number) => {
    return ((val - min) / (max - min)) * sliderWidth;
  };
  const getValueFromPosition = (position: number) => {
    const percentage = position / sliderWidth;
    const rawValue = min + percentage * (max - min);
    return Math.round(rawValue / step) * step;
  };
  const leftPosition = getPositionFromValue(values[0]);
  const rightPosition = getPositionFromValue(values[1]);
  const createPanResponder = (isLeft: boolean) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const currentPosition = isLeft ? leftPosition : rightPosition;
        const newPosition = Math.max(0, Math.min(sliderWidth, currentPosition + gestureState.dx));
        const newValue = getValueFromPosition(newPosition);
        if (isLeft) {
          const clampedValue = Math.min(newValue, values[1] - step);
          if (clampedValue !== values[0]) {
            onValuesChange([Math.max(min, clampedValue), values[1]]);
          }
        } else {
          const clampedValue = Math.max(newValue, values[0] + step);
          if (clampedValue !== values[1]) {
            onValuesChange([values[0], Math.min(max, clampedValue)]);
          }
        }
      },
    });
  };
  const leftPanResponder = createPanResponder(true);
  const rightPanResponder = createPanResponder(false);
  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="h4" color="primary" style={styles.label}>
          {label}
        </Typography>
      )}
      <View style={styles.sliderContainer}>
        <View style={[styles.track, { width: sliderWidth }]}>
          <View
            style={[
              styles.activeTrack,
              {
                left: leftPosition + thumbSize / 2,
                width: rightPosition - leftPosition,
              },
            ]}
          />
          <View style={[styles.thumb, { left: leftPosition }]} {...leftPanResponder.panHandlers} />
          <View
            style={[styles.thumb, { left: rightPosition }]}
            {...rightPanResponder.panHandlers}
          />
        </View>
      </View>
      <View style={styles.valueContainer}>
        <Typography variant="caption" color="secondary">
          {formatValue(values[0])} - {formatValue(values[1])}
        </Typography>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
  },
  sliderContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  track: {
    height: 6,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  activeTrack: {
    height: 6,
    backgroundColor: colors.primary.gold,
    borderRadius: 3,
    position: 'absolute',
    top: -1,
    borderWidth: 1,
    borderColor: colors.primary.darkGold,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.gold,
    borderWidth: 3,
    borderColor: colors.neutral.white,
    position: 'absolute',
    top: -10,
    shadowColor: colors.primary.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  valueContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
});
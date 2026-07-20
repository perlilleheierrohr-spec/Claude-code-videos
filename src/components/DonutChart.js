import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, typography } from '../theme';

/**
 * A donut chart built from stroked circle arcs — no chart library needed.
 *
 * @param data  Array of { label, value, color }
 * @param total Sum of all values
 */
export default function DonutChart({
  data,
  total,
  size = 200,
  strokeWidth = 26,
  centerLabel,
  centerValue,
  centerSub,
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const gap = data.length > 1 ? 2 : 0; // degrees of visual gap between segments

  let offsetAngle = -90; // start at top

  const segments = data.map((d) => {
    const fraction = total > 0 ? d.value / total : 0;
    const sweep = fraction * 360;
    const arcLen = (Math.max(sweep - gap, 0) / 360) * circumference;
    const dashArray = `${arcLen} ${circumference - arcLen}`;
    const rotation = offsetAngle + gap / 2;
    offsetAngle += sweep;
    return { color: d.color, dashArray, rotation, key: d.label };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.surfaceHigh}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((s) => (
          <G key={s.key} rotation={s.rotation} origin={`${cx}, ${cy}`}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={s.dashArray}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        ))}
      </Svg>

      <View style={styles.center} pointerEvents="none">
        {!!centerLabel && <Text style={styles.centerLabel}>{centerLabel}</Text>}
        {!!centerValue && <Text style={styles.centerValue}>{centerValue}</Text>}
        {!!centerSub && <Text style={styles.centerSub}>{centerSub}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: { ...typography.caption, color: colors.textMuted },
  centerValue: { ...typography.heading, color: colors.textPrimary, marginTop: 2 },
  centerSub: { ...typography.caption, color: colors.gold, marginTop: 3, letterSpacing: 0.6 },
});

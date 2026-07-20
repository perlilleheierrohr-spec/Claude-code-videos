import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, typography, countryColors } from '../theme';
import { formatCurrency } from '../data/mockData';

/**
 * A donut chart built from stroked circle arcs — no chart library needed.
 *
 * @param data  Array of { country, value }
 * @param total Sum of all values (shown in the center)
 */
export default function DonutChart({ data, total, size = 200, strokeWidth = 26 }) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const gap = 2; // degrees of visual gap between segments

  let offsetAngle = -90; // start at top

  const segments = data.map((d) => {
    const fraction = d.value / total;
    const sweep = fraction * 360;
    const color = countryColors[d.country] || countryColors.Other;

    // Dash length for this segment (leaving a small gap).
    const arcLen = (Math.max(sweep - gap, 0) / 360) * circumference;
    const dashArray = `${arcLen} ${circumference - arcLen}`;
    // Rotate this segment to its start position.
    const rotation = offsetAngle + gap / 2;
    offsetAngle += sweep;

    return { color, dashArray, rotation, key: d.country };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Track */}
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

      {/* Center label */}
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.centerLabel}>TOTAL</Text>
        <Text style={styles.centerValue}>{formatCurrency(total)}</Text>
        <Text style={styles.centerSub}>{data.length} countries</Text>
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
  centerLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  centerValue: {
    ...typography.heading,
    color: colors.textPrimary,
    marginTop: 2,
  },
  centerSub: {
    ...typography.caption,
    color: colors.gold,
    marginTop: 3,
    letterSpacing: 0.6,
  },
});

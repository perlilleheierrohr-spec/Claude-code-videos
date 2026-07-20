import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Circle, G } from 'react-native-svg';
import { colors } from '../theme';

/**
 * A circular coin photo placeholder. Renders a milled-edge gold disc with a
 * subtle inner ring, standing in for a real coin photograph.
 */
export default function CoinAvatar({ size = 64, tint = '#2A2213', ringCount = 48 }) {
  const r = size / 2;
  const edgeR = r - 1;
  const faceR = r - size * 0.09;
  const innerR = r - size * 0.2;

  // Milled reeded edge — short ticks around the circumference.
  const ticks = [];
  for (let i = 0; i < ringCount; i++) {
    const a = (i / ringCount) * Math.PI * 2;
    const x1 = r + Math.cos(a) * (edgeR - 0.5);
    const y1 = r + Math.sin(a) * (edgeR - 0.5);
    const x2 = r + Math.cos(a) * (faceR + 0.5);
    const y2 = r + Math.sin(a) * (faceR + 0.5);
    ticks.push(
      <Circle key={i} cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={size * 0.012} fill={colors.goldDeep} opacity={0.5} />
    );
  }

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: r }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.goldBright} />
            <Stop offset="0.5" stopColor={colors.gold} />
            <Stop offset="1" stopColor={colors.goldDeep} />
          </LinearGradient>
          <RadialGradient id="face" cx="0.4" cy="0.35" r="0.75">
            <Stop offset="0" stopColor="#4A3C1C" />
            <Stop offset="0.7" stopColor={tint} />
            <Stop offset="1" stopColor="#0F0C05" />
          </RadialGradient>
        </Defs>

        {/* Outer gold rim */}
        <Circle cx={r} cy={r} r={edgeR} fill="url(#edge)" />
        <G>{ticks}</G>
        {/* Coin face */}
        <Circle cx={r} cy={r} r={faceR} fill="url(#face)" />
        {/* Inner engraved ring */}
        <Circle
          cx={r}
          cy={r}
          r={innerR}
          fill="none"
          stroke={colors.gold}
          strokeWidth={size * 0.014}
          opacity={0.45}
        />
        {/* Highlight glint */}
        <Circle cx={r * 0.7} cy={r * 0.6} r={faceR * 0.22} fill={colors.goldBright} opacity={0.12} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

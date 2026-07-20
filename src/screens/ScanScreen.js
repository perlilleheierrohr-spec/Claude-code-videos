import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../theme';
import { scannedCoin, formatCurrency } from '../data/mockData';
import RarityBadge from '../components/RarityBadge';
import CoinAvatar from '../components/CoinAvatar';

const { width } = Dimensions.get('window');
const VIEWFINDER = Math.min(width * 0.72, 300);

/** Faux camera feed — a dark radial gradient with grain-free vignette. */
function CameraBackdrop() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
      <Defs>
        <RadialGradient id="cam" cx="0.5" cy="0.42" r="0.75">
          <Stop offset="0" stopColor="#23232D" />
          <Stop offset="0.6" stopColor="#141419" />
          <Stop offset="1" stopColor="#050507" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#cam)" />
    </Svg>
  );
}

/** The circular viewfinder with animated-looking corner ticks. */
function Viewfinder() {
  const size = VIEWFINDER;
  const r = size / 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Outer glow ring */}
        <Circle cx={r} cy={r} r={r - 6} stroke={colors.goldBorder} strokeWidth={2} fill="none" />
        {/* Dashed inner ring */}
        <Circle
          cx={r}
          cy={r}
          r={r - 22}
          stroke={colors.gold}
          strokeWidth={2}
          strokeDasharray="3 12"
          fill="none"
          opacity={0.7}
        />
      </Svg>
      <Ionicons name="scan-outline" size={40} color={colors.gold} style={{ opacity: 0.35 }} />
      <Text style={styles.viewfinderHint}>Center the coin</Text>
    </View>
  );
}

export default function ScanScreen() {
  const [scanned, setScanned] = useState(false);

  return (
    <View style={styles.root}>
      <CameraBackdrop />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>AUREUS</Text>
            <Text style={styles.headerSub}>Identify a coin</Text>
          </View>
          <Pressable style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="flash-off-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Viewfinder */}
          <View style={styles.viewfinderWrap}>
            <Viewfinder />
          </View>

          {/* Results card OR prompt */}
          {scanned ? (
            <View style={styles.resultCard}>
              <View style={styles.resultHeaderRow}>
                <CoinAvatar size={72} tint="#3A2E12" />
                <View style={styles.resultHeaderText}>
                  <View style={styles.matchRow}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.positive} />
                    <Text style={styles.matchText}>
                      {Math.round(scannedCoin.confidence * 100)}% match
                    </Text>
                  </View>
                  <Text style={styles.coinName}>{scannedCoin.name}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="flag-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.metaText}>
                      {scannedCoin.country} · {scannedCoin.year}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Value + rarity */}
              <View style={styles.statsRow}>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>ESTIMATED VALUE</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(scannedCoin.valueLow)}
                    <Text style={styles.statValueDash}> – </Text>
                    {formatCurrency(scannedCoin.valueHigh)}
                  </Text>
                </View>
                <View style={styles.statBlockRight}>
                  <Text style={styles.statLabel}>RARITY</Text>
                  <View style={{ marginTop: 6 }}>
                    <RarityBadge rarity={scannedCoin.rarity} />
                  </View>
                </View>
              </View>

              {/* Attribute chips */}
              <View style={styles.chipRow}>
                <View style={styles.chip}>
                  <Ionicons name="diamond-outline" size={13} color={colors.gold} />
                  <Text style={styles.chipText}>{scannedCoin.metal}</Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons name="calendar-outline" size={13} color={colors.gold} />
                  <Text style={styles.chipText}>{scannedCoin.year}</Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons name="earth-outline" size={13} color={colors.gold} />
                  <Text style={styles.chipText}>{scannedCoin.country}</Text>
                </View>
              </View>

              <Pressable style={styles.addBtn}>
                <Ionicons name="add-circle" size={18} color={colors.background} />
                <Text style={styles.addBtnText}>Add to Collection</Text>
              </Pressable>
              <Pressable onPress={() => setScanned(false)} style={styles.rescanBtn}>
                <Text style={styles.rescanText}>Scan another</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.prompt}>
              Position the coin inside the ring and tap to identify it instantly.
            </Text>
          )}
        </ScrollView>

        {/* Capture button */}
        {!scanned && (
          <View style={styles.captureBar}>
            <Pressable
              style={({ pressed }) => [styles.captureOuter, pressed && { transform: [{ scale: 0.94 }] }]}
              onPress={() => setScanned(true)}
            >
              <View style={styles.captureInner}>
                <Ionicons name="camera" size={26} color={colors.background} />
              </View>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brand: {
    ...typography.heading,
    color: colors.gold,
    letterSpacing: 4,
  },
  headerSub: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  viewfinderWrap: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  viewfinderHint: {
    position: 'absolute',
    bottom: 34,
    ...typography.caption,
    color: colors.textMuted,
  },
  prompt: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },

  // Result card
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.xl,
    ...shadow.card,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  resultHeaderText: { flex: 1 },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  matchText: {
    ...typography.caption,
    color: colors.positive,
    letterSpacing: 0.6,
  },
  coinName: {
    ...typography.heading,
    color: colors.textPrimary,
    marginTop: 4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  metaText: { ...typography.label, color: colors.textSecondary },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statBlock: { flex: 1 },
  statBlockRight: { alignItems: 'flex-end' },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statValue: {
    ...typography.heading,
    color: colors.gold,
    marginTop: 6,
  },
  statValueDash: { color: colors.textMuted, fontWeight: '400' },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { ...typography.label, color: colors.textPrimary },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 15,
    marginTop: spacing.xl,
    ...shadow.gold,
  },
  addBtnText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  rescanBtn: { alignItems: 'center', paddingVertical: spacing.md, marginTop: 2 },
  rescanText: { ...typography.label, color: colors.textSecondary },

  // Capture bar
  captureBar: {
    alignItems: 'center',
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  captureOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.gold,
  },
});

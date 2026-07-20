import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow, countryColors } from '../theme';
import {
  totalValue,
  valueByCountry,
  topCoins,
  coins,
  formatCurrency,
} from '../data/mockData';
import DonutChart from '../components/DonutChart';
import CoinAvatar from '../components/CoinAvatar';

function LegendRow({ item, total }) {
  const color = countryColors[item.country] || countryColors.Other;
  const pct = Math.round((item.value / total) * 100);
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendLeft}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendCountry}>{item.country}</Text>
      </View>
      <View style={styles.legendRight}>
        <Text style={styles.legendValue}>{formatCurrency(item.value)}</Text>
        <Text style={styles.legendPct}>{pct}%</Text>
      </View>
    </View>
  );
}

function TopCoinRow({ coin, rank }) {
  return (
    <View style={styles.topRow}>
      <Text style={styles.rank}>{rank}</Text>
      <CoinAvatar size={44} tint={coin.tint} />
      <View style={styles.topInfo}>
        <Text style={styles.topName} numberOfLines={1}>
          {coin.name}
        </Text>
        <Text style={styles.topMeta}>
          {coin.country} · {coin.year}
        </Text>
      </View>
      <Text style={styles.topValue}>{formatCurrency(coin.value)}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your Vault</Text>
            <Text style={styles.subtitle}>Portfolio overview</Text>
          </View>
          <View style={styles.avatarBadge}>
            <Ionicons name="shield-checkmark" size={18} color={colors.gold} />
          </View>
        </View>

        {/* Hero total value */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL COLLECTION VALUE</Text>
          <Text style={styles.heroValue}>{formatCurrency(totalValue)}</Text>
          <View style={styles.heroTrendRow}>
            <View style={styles.heroTrend}>
              <Ionicons name="trending-up" size={14} color={colors.positive} />
              <Text style={styles.heroTrendText}>+$482 (4.2%)</Text>
            </View>
            <Text style={styles.heroTrendSub}>past 30 days</Text>
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{coins.length}</Text>
              <Text style={styles.heroStatLabel}>Coins</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{valueByCountry.length}</Text>
              <Text style={styles.heroStatLabel}>Countries</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {coins.filter((c) => c.rarity === 'legendary' || c.rarity === 'epic').length}
              </Text>
              <Text style={styles.heroStatLabel}>Rare+</Text>
            </View>
          </View>
        </View>

        {/* Donut breakdown by country */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>By Country</Text>
          <View style={styles.donutWrap}>
            <DonutChart data={valueByCountry} total={totalValue} size={200} />
          </View>
          <View style={styles.legend}>
            {valueByCountry.map((item) => (
              <LegendRow key={item.country} item={item} total={totalValue} />
            ))}
          </View>
        </View>

        {/* Top 5 most valuable */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Top 5 Most Valuable</Text>
            <Ionicons name="trophy-outline" size={18} color={colors.gold} />
          </View>
          <View style={{ marginTop: spacing.sm }}>
            {topCoins.map((coin, i) => (
              <TopCoinRow key={coin.id} coin={coin} rank={i + 1} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  greeting: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.label, color: colors.textSecondary, marginTop: 4 },
  avatarBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },

  // Hero
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    ...shadow.card,
  },
  heroLabel: { ...typography.caption, color: colors.textMuted },
  heroValue: {
    ...typography.hero,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  heroTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  heroTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.positive + '1F',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  heroTrendText: { ...typography.label, color: colors.positive },
  heroTrendSub: { ...typography.label, color: colors.textMuted },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatDivider: { width: 1, height: 34, backgroundColor: colors.border },
  heroStatValue: { ...typography.heading, color: colors.gold },
  heroStatLabel: { ...typography.caption, color: colors.textMuted, marginTop: 3 },

  // Section cards
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { ...typography.heading, color: colors.textPrimary },
  donutWrap: { alignItems: 'center', marginVertical: spacing.xl },
  legend: { gap: spacing.md },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendCountry: { ...typography.body, color: colors.textPrimary },
  legendRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  legendValue: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
  legendPct: {
    ...typography.label,
    color: colors.textMuted,
    width: 38,
    textAlign: 'right',
  },

  // Top coins
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rank: {
    ...typography.heading,
    color: colors.goldDeep,
    width: 22,
    textAlign: 'center',
  },
  topInfo: { flex: 1 },
  topName: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
  topMeta: { ...typography.label, color: colors.textSecondary, marginTop: 2 },
  topValue: { ...typography.heading, color: colors.gold, fontSize: 17 },
});

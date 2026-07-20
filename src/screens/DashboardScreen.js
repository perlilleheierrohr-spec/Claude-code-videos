import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow, colorForCountry } from '../theme';
import { formatCurrency } from '../lib/format';
import { useCoins } from '../context/CoinsContext';
import { useAuth } from '../context/AuthContext';
import DonutChart from '../components/DonutChart';
import CoinImage from '../components/CoinImage';

function LegendRow({ item, total }) {
  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendLeft}>
        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
        <Text style={styles.legendCountry}>{item.label}</Text>
      </View>
      <View style={styles.legendRight}>
        <Text style={styles.legendValue}>{formatCurrency(item.value, item.currency)}</Text>
        <Text style={styles.legendPct}>{pct}%</Text>
      </View>
    </View>
  );
}

function TopCoinRow({ coin, rank }) {
  return (
    <View style={styles.topRow}>
      <Text style={styles.rank}>{rank}</Text>
      <CoinImage uri={coin.photo_url} size={44} tint="#2A2213" />
      <View style={styles.topInfo}>
        <Text style={styles.topName} numberOfLines={1}>
          {coin.name}
        </Text>
        <Text style={styles.topMeta}>
          {[coin.country, coin.year].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <Text style={styles.topValue}>{formatCurrency(coin.value, coin.currency)}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { coins, loading, refresh } = useCoins();
  const { signOut } = useAuth();

  const currency = coins[0]?.currency || 'USD';
  const total = coins.reduce((sum, c) => sum + (Number(c.value) || 0), 0);

  // Value grouped by country → donut + legend.
  const grouped = Object.values(
    coins.reduce((acc, c) => {
      const key = c.country || 'Unknown';
      if (!acc[key]) acc[key] = { label: key, value: 0, count: 0 };
      acc[key].value += Number(c.value) || 0;
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

  const byCountry = grouped.map((g, i) => ({
    ...g,
    color: colorForCountry(g.label, i),
    currency,
  }));

  const topCoins = [...coins].sort((a, b) => b.value - a.value).slice(0, 5);
  const rarePlus = coins.filter(
    (c) => c.rarity === 'legendary' || c.rarity === 'epic'
  ).length;

  const empty = !loading && coins.length === 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.gold} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your Vault</Text>
            <Text style={styles.subtitle}>Portfolio overview</Text>
          </View>
          <Pressable style={styles.signOut} onPress={signOut} hitSlop={8}>
            <Ionicons name="log-out-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL COLLECTION VALUE</Text>
          <Text style={styles.heroValue}>{formatCurrency(total, currency)}</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{coins.length}</Text>
              <Text style={styles.heroStatLabel}>COINS</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{byCountry.length}</Text>
              <Text style={styles.heroStatLabel}>COUNTRIES</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{rarePlus}</Text>
              <Text style={styles.heroStatLabel}>RARE+</Text>
            </View>
          </View>
        </View>

        {empty ? (
          <View style={styles.emptyCard}>
            <Ionicons name="stats-chart-outline" size={28} color={colors.gold} />
            <Text style={styles.emptyTitle}>Nothing to chart yet</Text>
            <Text style={styles.emptyBody}>
              Scan your first coin and your portfolio breakdown will appear here.
            </Text>
          </View>
        ) : loading && coins.length === 0 ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>By Country</Text>
              <View style={styles.donutWrap}>
                <DonutChart
                  data={byCountry}
                  total={total}
                  size={200}
                  centerLabel="TOTAL"
                  centerValue={formatCurrency(total, currency)}
                  centerSub={`${byCountry.length} ${byCountry.length === 1 ? 'country' : 'countries'}`}
                />
              </View>
              <View style={styles.legend}>
                {byCountry.map((item) => (
                  <LegendRow key={item.label} item={item} total={total} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Top {Math.min(5, topCoins.length)} Most Valuable
                </Text>
                <Ionicons name="trophy-outline" size={18} color={colors.gold} />
              </View>
              <View style={{ marginTop: spacing.sm }}>
                {topCoins.map((coin, i) => (
                  <TopCoinRow key={coin.id} coin={coin} rank={i + 1} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  greeting: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.label, color: colors.textSecondary, marginTop: 4 },
  signOut: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    ...shadow.card,
  },
  heroLabel: { ...typography.caption, color: colors.textMuted },
  heroValue: { ...typography.hero, color: colors.textPrimary, marginTop: spacing.sm },
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

  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...typography.heading, color: colors.textPrimary },
  donutWrap: { alignItems: 'center', marginVertical: spacing.xl },
  legend: { gap: spacing.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legendLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendCountry: { ...typography.body, color: colors.textPrimary, flexShrink: 1 },
  legendRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  legendValue: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
  legendPct: { ...typography.label, color: colors.textMuted, width: 38, textAlign: 'right' },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rank: { ...typography.heading, color: colors.goldDeep, width: 22, textAlign: 'center' },
  topInfo: { flex: 1, minWidth: 0 },
  topName: { ...typography.body, color: colors.textPrimary, fontWeight: '700' },
  topMeta: { ...typography.label, color: colors.textSecondary, marginTop: 2 },
  topValue: { ...typography.heading, color: colors.gold, fontSize: 17 },

  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.heading, color: colors.textPrimary, marginTop: spacing.sm },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  loadingCard: { padding: spacing.xxl, alignItems: 'center', marginTop: spacing.lg },
});

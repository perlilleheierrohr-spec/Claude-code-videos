import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../theme';
import { coins, formatCurrency, totalValue } from '../data/mockData';
import CoinAvatar from '../components/CoinAvatar';
import RarityBadge from '../components/RarityBadge';

const { width } = Dimensions.get('window');
const GUTTER = spacing.lg;
const CARD_W = (width - GUTTER * 3) / 2;

function CoinCard({ coin }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width: CARD_W }, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.avatarWrap}>
        <CoinAvatar size={CARD_W * 0.52} tint={coin.tint} />
      </View>
      <View style={styles.badgeWrap}>
        <RarityBadge rarity={coin.rarity} size="sm" />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {coin.name}
      </Text>
      <Text style={styles.country}>
        {coin.country} · {coin.year}
      </Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{formatCurrency(coin.value)}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function CollectionScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={coins}
        keyExtractor={(c) => c.id}
        numColumns={2}
        renderItem={({ item }) => <CoinCard coin={item} />}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>Collection</Text>
                <Text style={styles.subtitle}>{coins.length} coins in your vault</Text>
              </View>
              <Pressable style={styles.iconBtn} hitSlop={8}>
                <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryLabel}>VAULT VALUE</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalValue)}</Text>
              </View>
              <View style={styles.summaryTrend}>
                <Ionicons name="trending-up" size={14} color={colors.positive} />
                <Text style={styles.summaryTrendText}>+4.2%</Text>
              </View>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: {
    paddingHorizontal: GUTTER,
    paddingBottom: spacing.xxl,
  },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.lg },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.label, color: colors.textSecondary, marginTop: 4 },
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  summaryLabel: { ...typography.caption, color: colors.textMuted },
  summaryValue: { ...typography.title, color: colors.gold, marginTop: 4 },
  summaryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.positive + '1F',
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  summaryTrendText: { ...typography.label, color: colors.positive },

  column: { justifyContent: 'space-between', marginBottom: GUTTER },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  avatarWrap: { alignItems: 'center', marginTop: spacing.xs, marginBottom: spacing.md },
  badgeWrap: { alignItems: 'center', marginBottom: spacing.md },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    minHeight: 40,
  },
  country: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: 3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  value: { ...typography.heading, color: colors.gold, fontSize: 18 },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../theme';
import { formatCurrency } from '../lib/format';
import { useCoins } from '../context/CoinsContext';
import CoinImage from '../components/CoinImage';
import RarityBadge from '../components/RarityBadge';

const { width } = Dimensions.get('window');
const GUTTER = spacing.lg;
const CARD_W = (width - GUTTER * 3) / 2;

function CoinCard({ coin, onLongPress }) {
  return (
    <Pressable
      onLongPress={() => onLongPress(coin)}
      delayLongPress={350}
      style={({ pressed }) => [styles.card, { width: CARD_W }, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.avatarWrap}>
        <CoinImage uri={coin.photo_url} size={CARD_W * 0.52} tint="#2A2213" />
      </View>
      <View style={styles.badgeWrap}>
        <RarityBadge rarity={coin.rarity} size="sm" />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {coin.name}
      </Text>
      <Text style={styles.country}>
        {[coin.country, coin.year].filter(Boolean).join(' · ')}
      </Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{formatCurrency(coin.value, coin.currency)}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function CollectionScreen() {
  const { coins, loading, refresh, removeCoin } = useCoins();

  const total = coins.reduce((sum, c) => sum + (Number(c.value) || 0), 0);
  const currency = coins[0]?.currency || 'USD';

  const confirmDelete = (coin) => {
    Alert.alert('Remove coin', `Remove "${coin.name}" from your collection?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeCoin(coin.id).catch((e) => Alert.alert('Error', e.message)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <FlatList
        data={coins}
        keyExtractor={(c) => c.id}
        numColumns={2}
        renderItem={({ item }) => <CoinCard coin={item} onLongPress={confirmDelete} />}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.gold} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.title}>Collection</Text>
                <Text style={styles.subtitle}>
                  {coins.length} {coins.length === 1 ? 'coin' : 'coins'} in your vault
                </Text>
              </View>
            </View>

            {coins.length > 0 && (
              <View style={styles.summaryCard}>
                <View>
                  <Text style={styles.summaryLabel}>VAULT VALUE</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(total, currency)}</Text>
                </View>
                <View style={styles.hint}>
                  <Ionicons name="information-circle-outline" size={13} color={colors.textMuted} />
                  <Text style={styles.hintText}>Hold a coin to remove</Text>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.gold} />
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="scan-outline" size={30} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>Your vault is empty</Text>
              <Text style={styles.emptyBody}>
                Head to the Scan tab, point your camera at a coin, and Aureus will
                identify it and add it here.
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: GUTTER, paddingBottom: spacing.xxl, flexGrow: 1 },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.lg },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.label, color: colors.textSecondary, marginTop: 4 },
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
  hint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hintText: { ...typography.caption, color: colors.textMuted, letterSpacing: 0.3 },

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
  name: { ...typography.body, color: colors.textPrimary, fontWeight: '700', minHeight: 40 },
  country: { ...typography.label, color: colors.textSecondary, marginTop: 3 },
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

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xxl * 2, paddingHorizontal: spacing.xl },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: { ...typography.heading, color: colors.textPrimary },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});

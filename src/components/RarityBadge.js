import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, typography } from '../theme';
import { RARITIES } from '../data/mockData';

const ICONS = {
  common: 'ellipse-outline',
  uncommon: 'ellipse',
  rare: 'diamond-outline',
  epic: 'diamond',
  legendary: 'star',
};

/** A small pill communicating a coin's rarity tier. */
export default function RarityBadge({ rarity, size = 'md' }) {
  const meta = RARITIES[rarity] || RARITIES.common;
  const small = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: meta.color + '66',
          backgroundColor: meta.color + '1F',
          paddingVertical: small ? 3 : 5,
          paddingHorizontal: small ? 8 : 11,
        },
      ]}
    >
      <Ionicons name={ICONS[rarity]} size={small ? 10 : 12} color={meta.color} />
      <Text
        style={[
          styles.text,
          { color: meta.color, fontSize: small ? 10 : 11 },
        ]}
      >
        {meta.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    gap: 5,
  },
  text: {
    ...typography.caption,
    letterSpacing: 1,
  },
});

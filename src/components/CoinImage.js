import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../theme';
import CoinAvatar from './CoinAvatar';

/**
 * Shows a real coin photo in a gold-rimmed circle when available, falling back
 * to the drawn CoinAvatar placeholder otherwise.
 */
export default function CoinImage({ uri, size = 64, tint = '#2A2213' }) {
  if (!uri) return <CoinAvatar size={size} tint={tint} />;

  return (
    <View
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.goldBorder,
    backgroundColor: colors.surfaceElevated,
  },
});

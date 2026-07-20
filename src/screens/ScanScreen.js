import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../theme';
import { formatCurrency } from '../lib/format';
import { scanCoin } from '../api/scan';
import { useCoins } from '../context/CoinsContext';
import RarityBadge from '../components/RarityBadge';

const { width } = Dimensions.get('window');
const VIEWFINDER = Math.min(width * 0.72, 300);

function ViewfinderOverlay() {
  const size = VIEWFINDER;
  const r = size / 2;
  return (
    <View pointerEvents="none" style={styles.viewfinderWrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={r} cy={r} r={r - 6} stroke={colors.goldBorder} strokeWidth={2} fill="none" />
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
      </View>
      <Text style={styles.viewfinderHint}>CENTER THE COIN</Text>
    </View>
  );
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const { addCoin } = useCoins();

  const [status, setStatus] = useState('camera'); // camera | analyzing | result | error
  const [photo, setPhoto] = useState(null); // { uri, base64 }
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const reset = () => {
    setStatus('camera');
    setPhoto(null);
    setResult(null);
    setMessage(null);
    setAdding(false);
    setAdded(false);
  };

  const capture = async () => {
    if (!cameraRef.current) return;
    try {
      setStatus('analyzing');
      const shot = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        skipProcessing: true,
      });
      const manip = await ImageManipulator.manipulateAsync(
        shot.uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.6, base64: true, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhoto({ uri: manip.uri, base64: manip.base64 });

      const res = await scanCoin(manip.base64);
      if (!res || !res.identified) {
        setMessage(
          res?.reasoning ||
            "Couldn't confidently identify a coin. Try better lighting and fill the ring."
        );
        setStatus('error');
        return;
      }
      setResult(res);
      setStatus('result');
    } catch (e) {
      setMessage(e.message || 'Scan failed. Check your connection and try again.');
      setStatus('error');
    }
  };

  const onAdd = async () => {
    if (!result) return;
    setAdding(true);
    try {
      await addCoin(result, photo?.base64);
      setAdded(true);
    } catch (e) {
      setMessage(e.message || 'Could not save to your collection.');
      setStatus('error');
    } finally {
      setAdding(false);
    }
  };

  // --- Permission gates -----------------------------------------------------
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={[styles.center, { paddingHorizontal: spacing.xl }]}>
          <View style={styles.permIcon}>
            <Ionicons name="camera-outline" size={34} color={colors.gold} />
          </View>
          <Text style={styles.permTitle}>Camera access</Text>
          <Text style={styles.permBody}>
            Aureus needs your camera to scan and identify coins. Your photos are only
            used to recognize the coin.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Enable Camera</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- Camera / analyzing ---------------------------------------------------
  if (status === 'camera' || status === 'analyzing') {
    return (
      <View style={styles.root}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        <View style={styles.cameraDim} pointerEvents="none" />
        <SafeAreaView style={styles.cameraUi} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <View>
              <Text style={styles.brand}>AUREUS</Text>
              <Text style={styles.headerSub}>Identify a coin</Text>
            </View>
          </View>

          <ViewfinderOverlay />

          <View style={styles.captureBar}>
            {status === 'analyzing' ? (
              <View style={styles.analyzing}>
                <ActivityIndicator color={colors.gold} />
                <Text style={styles.analyzingText}>Identifying…</Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.captureOuter,
                  pressed && { transform: [{ scale: 0.94 }] },
                ]}
                onPress={capture}
              >
                <View style={styles.captureInner}>
                  <Ionicons name="camera" size={26} color={colors.background} />
                </View>
              </Pressable>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // --- Result / error -------------------------------------------------------
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>AUREUS</Text>
            <Text style={styles.headerSub}>
              {status === 'result' ? 'Identification' : 'No match'}
            </Text>
          </View>
        </View>

        {status === 'error' ? (
          <View style={styles.errorCard}>
            <Ionicons name="scan-outline" size={40} color={colors.textMuted} />
            <Text style={styles.errorText}>{message}</Text>
            <Pressable style={styles.primaryBtn} onPress={reset}>
              <Text style={styles.primaryBtnText}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.resultCard}>
            <View style={styles.resultHeaderRow}>
              {photo?.uri ? (
                <Image source={{ uri: photo.uri }} style={styles.resultPhoto} />
              ) : null}
              <View style={styles.resultHeaderText}>
                {result.confidence != null && (
                  <View style={styles.matchRow}>
                    <Ionicons name="sparkles-outline" size={13} color={colors.positive} />
                    <Text style={styles.matchText}>
                      {Math.round(result.confidence * 100)}% confidence
                    </Text>
                  </View>
                )}
                <Text style={styles.coinName}>{result.name}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="earth-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.metaText}>
                    {[result.country, result.year].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>ESTIMATED VALUE</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(result.value_low, result.currency)}
                  <Text style={styles.statValueDash}> – </Text>
                  {formatCurrency(result.value_high, result.currency)}
                </Text>
              </View>
              <View style={styles.statBlockRight}>
                <Text style={styles.statLabel}>RARITY</Text>
                <View style={{ marginTop: 6 }}>
                  <RarityBadge rarity={result.rarity} />
                </View>
              </View>
            </View>

            <View style={styles.chipRow}>
              {!!result.metal && (
                <View style={styles.chip}>
                  <Ionicons name="diamond-outline" size={13} color={colors.gold} />
                  <Text style={styles.chipText}>{result.metal}</Text>
                </View>
              )}
              {!!result.year && (
                <View style={styles.chip}>
                  <Ionicons name="calendar-outline" size={13} color={colors.gold} />
                  <Text style={styles.chipText}>{result.year}</Text>
                </View>
              )}
              {!!result.country && (
                <View style={styles.chip}>
                  <Ionicons name="flag-outline" size={13} color={colors.gold} />
                  <Text style={styles.chipText}>{result.country}</Text>
                </View>
              )}
            </View>

            {!!result.reasoning && <Text style={styles.reasoning}>{result.reasoning}</Text>}
            <Text style={styles.disclaimer}>
              AI estimate — not a certified appraisal. Value depends on grade &amp; condition.
            </Text>

            {added ? (
              <View style={styles.addedRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.positive} />
                <Text style={styles.addedText}>Added to your collection</Text>
              </View>
            ) : (
              <Pressable
                style={[styles.addBtn, adding && { opacity: 0.6 }]}
                onPress={onAdd}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={18} color={colors.background} />
                    <Text style={styles.addBtnText}>Add to Collection</Text>
                  </>
                )}
              </Pressable>
            )}
            <Pressable onPress={reset} style={styles.rescanBtn}>
              <Text style={styles.rescanText}>Scan another</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cameraDim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,5,7,0.35)' },
  cameraUi: { flex: 1, justifyContent: 'space-between' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brand: { ...typography.heading, color: colors.gold, letterSpacing: 4 },
  headerSub: { ...typography.label, color: colors.textSecondary, marginTop: 2 },

  viewfinderWrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  viewfinderHint: {
    position: 'absolute',
    bottom: VIEWFINDER / 2 - 40,
    ...typography.caption,
    color: colors.textSecondary,
  },

  captureBar: { alignItems: 'center', paddingBottom: spacing.lg, paddingTop: spacing.sm },
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
  analyzing: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  analyzingText: { ...typography.label, color: colors.gold },

  // Permission screen
  permIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  permTitle: { ...typography.heading, color: colors.textPrimary },
  permBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    ...shadow.gold,
  },
  primaryBtnText: { ...typography.body, color: colors.background, fontWeight: '700', fontSize: 16 },

  scroll: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },

  errorCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.xl,
    ...shadow.card,
  },
  resultHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  resultPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.goldBorder,
  },
  resultHeaderText: { flex: 1 },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  matchText: { ...typography.caption, color: colors.positive, letterSpacing: 0.6 },
  coinName: { ...typography.heading, color: colors.textPrimary, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  metaText: { ...typography.label, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statBlock: { flex: 1 },
  statBlockRight: { alignItems: 'flex-end' },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statValue: { ...typography.heading, color: colors.gold, marginTop: 6 },
  statValueDash: { color: colors.textMuted, fontWeight: '400' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
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
  reasoning: {
    ...typography.label,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: spacing.lg,
  },
  disclaimer: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm, letterSpacing: 0.2 },
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
  addBtnText: { ...typography.body, color: colors.background, fontWeight: '700', fontSize: 16 },
  addedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.xl,
    paddingVertical: 14,
  },
  addedText: { ...typography.body, color: colors.positive, fontWeight: '700' },
  rescanBtn: { alignItems: 'center', paddingVertical: spacing.md, marginTop: 2 },
  rescanText: { ...typography.label, color: colors.textSecondary },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../theme';
import CoinAvatar from '../components/CoinAvatar';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp, configured } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const submit = async () => {
    setError(null);
    setNotice(null);
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      const fn = mode === 'signin' ? signIn : signUp;
      const { data, error: err } = await fn(email, password);
      if (err) {
        setError(err.message);
      } else if (mode === 'signup' && !data.session) {
        setNotice('Account created. Check your email to confirm, then sign in.');
        setMode('signin');
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandWrap}>
            <CoinAvatar size={84} tint="#3A2E12" />
            <Text style={styles.brand}>AUREUS</Text>
            <Text style={styles.tagline}>Your collector's vault</Text>
          </View>

          {!configured && (
            <View style={styles.warnCard}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.gold} />
              <Text style={styles.warnText}>
                Backend not configured yet. Add your Supabase URL and anon key to a
                {' '}
                <Text style={styles.mono}>.env</Text> file (see SETUP.md), then reload.
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <View style={styles.segment}>
              {['signin', 'signup'].map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[styles.segmentBtn, mode === m && styles.segmentActive]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      mode === m && styles.segmentTextActive,
                    ]}
                  >
                    {m === 'signin' ? 'Sign In' : 'Create Account'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              inputMode="email"
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
            />

            {!!error && <Text style={styles.error}>{error}</Text>}
            {!!notice && <Text style={styles.notice}>{notice}</Text>}

            <Pressable
              style={[styles.submit, (busy || !configured) && { opacity: 0.6 }]}
              onPress={submit}
              disabled={busy || !configured}
            >
              {busy ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.footer}>
            Sign {mode === 'signin' ? 'in' : 'up'} to sync your collection across devices.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  brandWrap: { alignItems: 'center', marginBottom: spacing.xxl },
  brand: {
    ...typography.title,
    color: colors.gold,
    letterSpacing: 6,
    marginTop: spacing.lg,
  },
  tagline: { ...typography.label, color: colors.textSecondary, marginTop: 6 },

  warnCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.goldSoft,
    borderColor: colors.goldBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  warnText: { flex: 1, ...typography.label, color: colors.textSecondary, lineHeight: 18 },
  mono: { color: colors.gold },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadow.card,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.xl,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  segmentActive: { backgroundColor: colors.gold },
  segmentText: { ...typography.label, color: colors.textSecondary },
  segmentTextActive: { color: colors.background, fontWeight: '700' },

  label: { ...typography.caption, color: colors.textMuted, marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  error: { ...typography.label, color: '#C6564F', marginBottom: spacing.md },
  notice: { ...typography.label, color: colors.positive, marginBottom: spacing.md },
  submit: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.xs,
    ...shadow.gold,
  },
  submitText: { ...typography.body, color: colors.background, fontWeight: '700', fontSize: 16 },
  footer: {
    ...typography.label,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

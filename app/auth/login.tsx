// app/auth/login.tsx
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useAuth } from '../../components/auth/AuthContext';

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Cross-platform success dialog
function showSuccess(title: string, message: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    // simple web fallback
    // eslint-disable-next-line no-alert
    alert(`${title}\n\n${message}`);
    onOk();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }], {
      cancelable: false,
    });
  }
}

export default function Login() {
  const { login, signup, resetPassword } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(
    () => isEmail(email.trim()) && pwd.length >= 6,
    [email, pwd]
  );

  async function onSubmit() {
    try {
      setErr('');
      setInfo('');
      setBusy(true);
      const e = email.trim();

      if (!isEmail(e)) throw new Error('Please enter a valid email.');
      if (pwd.length < 6)
        throw new Error('Password must be at least 6 characters.');

      if (mode === 'login') {
        await login(e, pwd);
        showSuccess('Signed in', 'Welcome back!', () =>
          router.replace('/(tabs)')
        );
      } else {
        // Firebase createUser already authenticates the user
        await signup(e, pwd);
        showSuccess('Account created', 'Your account is ready to use.', () =>
          router.replace('/(tabs)')
        );
      }
    } catch (e: any) {
      setErr(e?.message ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function onResetPassword() {
    try {
      setErr('');
      setInfo('');
      const e = email.trim();
      if (!isEmail(e))
        throw new Error('Enter your email to receive a reset link.');
      await resetPassword(e);
      setInfo('Password reset email sent. Check your inbox.');
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to send reset email.');
    }
  }

  return (
    <View style={s.wrap}>
      <Text style={s.title}>{mode === 'login' ? 'Login' : 'Sign up'}</Text>

      <Text style={s.label}>Email</Text>
      <TextInput
        style={s.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="you@example.com"
        inputMode="email"
      />

      <Text style={s.label}>Password</Text>
      <View style={s.row}>
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={pwd}
          onChangeText={setPwd}
          secureTextEntry={!showPwd}
          placeholder="Min 6 characters"
        />
        <Pressable onPress={() => setShowPwd((v) => !v)} style={s.toggle}>
          <Text style={s.link}>{showPwd ? 'HIDE' : 'SHOW'}</Text>
        </Pressable>
      </View>

      {err ? <Text style={s.err}>{err}</Text> : null}
      {info ? <Text style={s.info}>{info}</Text> : null}

      <Pressable
        onPress={onSubmit}
        disabled={!canSubmit || busy}
        style={[s.btn, (!canSubmit || busy) && s.btnDisabled]}
      >
        {busy ? (
          <ActivityIndicator />
        ) : (
          <Text style={s.btnText}>
            {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
        style={s.btnAlt}
      >
        <Text style={s.btnTextAlt}>
          {mode === 'login'
            ? 'NEED AN ACCOUNT? SIGN UP'
            : 'HAVE AN ACCOUNT? SIGN IN'}
        </Text>
      </Pressable>

      <Pressable onPress={onResetPassword} style={s.linkBtn}>
        <Text style={s.link}>Forgot password?</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, gap: 10 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggle: { paddingHorizontal: 8, paddingVertical: 6 },
  link: { color: '#3b82f6', fontWeight: '600' },
  err: { color: '#dc2626', marginTop: 6 },
  info: { color: '#16a34a', marginTop: 6 },
  btn: {
    marginTop: 14,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: 'white', fontWeight: '800', letterSpacing: 1 },
  btnAlt: {
    marginTop: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnTextAlt: { color: 'white', fontWeight: '800', letterSpacing: 1 },
  linkBtn: { alignItems: 'center', marginTop: 8 },
});
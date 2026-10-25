import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { CAMPUS } from '@/constants/colors';
import { useAuth, signIn, signOut } from '@/lib/auth';
import { getEventByCode, type CloudEvent } from '@/lib/events';
import { registerAttendance } from '@/lib/attendance';
import { validateEmail } from '@/lib/validation';

export default function AttendPage() {
  const params = useLocalSearchParams<{ event?: string | string[] }>();
  const eventCode = useMemo(() => {
    const value = Array.isArray(params.event) ? params.event[0] : params.event;
    return typeof value === 'string' && /^[A-Za-z0-9_-]{3,40}$/.test(value)
      ? value
      : '';
  }, [params.event]);

  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  const [event, setEvent] = useState<CloudEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // The database only lets SIGNED-IN users read events, so a visitor who is
  // not signed in yet can never load the event. We therefore wait until there
  // is a signed-in user before looking the event up (and look it up again if
  // the user changes). Showing the sign-in form must NOT depend on this lookup.
  useEffect(() => {
    let active = true;

    setEvent(null);

    if (!eventCode || !userId) {
      setEventLoading(false);
      return () => {
        active = false;
      };
    }

    setEventLoading(true);

    getEventByCode(eventCode)
      .then((result) => {
        if (active) setEvent(result);
      })
      .finally(() => {
        if (active) setEventLoading(false);
      });

    return () => {
      active = false;
    };
  }, [eventCode, userId]);

  const recordForUser = async (studentId: string) => {
    const result = await registerAttendance(
      JSON.stringify({ v: 1, event: eventCode }),
      studentId
    );

    setMessage(
      result.success && result.eventTitle
        ? `${result.message} (${result.eventTitle})`
        : result.message
    );
    setSuccess(result.success);
  };

  const handleSubmit = async () => {
    if (busy || success) return;
    setMessage(null);
    setSuccess(false);

    if (!eventCode) {
      setMessage(
        'This link is missing a valid event code. Ask your teacher for a current QR code.'
      );
      return;
    }

    setBusy(true);
    try {
      if (userId) {
        await recordForUser(userId);
        return;
      }

      const emailCheck = validateEmail(email);
      if (!emailCheck.ok) {
        setMessage(emailCheck.message);
        return;
      }
      if (!password) {
        setMessage('Enter your QR-ATT password.');
        return;
      }

      const { data, error } = await signIn(emailCheck.value, password);
      if (error || !data.session?.user?.id) {
        setMessage(error?.message ?? 'Sign-in failed. Please try again.');
        return;
      }

      await recordForUser(data.session.user.id);
    } catch (error: any) {
      setMessage(error?.message ?? 'Unable to record attendance. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Attendance is saved for whoever is signed in on this browser. On a shared
  // phone that may be someone else, so let the student switch accounts.
  const handleSwitchAccount = async () => {
    setMessage(null);
    setSuccess(false);
    setPassword('');
    setBusy(true);
    try {
      await signOut();
    } catch {
      // The local login is cleared even if the server call fails.
    } finally {
      setBusy(false);
    }
  };

  const eventDate = event?.start_time
    ? new Date(event.start_time).toLocaleString()
    : 'Time not specified';

  const closed = event?.status === 'closed';
  const eventMissing = Boolean(userId) && !eventLoading && !event;
  const canSubmit = !closed && !eventMissing && !eventLoading;

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandIcon}>
            <Ionicons name="qr-code-outline" size={34} color={CAMPUS.accent} />
          </View>
          <Text style={styles.eyebrow}>QR-ATT • SCHOOL ATTENDANCE</Text>
          <Text style={styles.heading}>Event check-in</Text>
          <Text style={styles.intro}>
            Sign in with your QR-ATT student account, confirm the event, then record your attendance.
          </Text>

          <View style={styles.card}>
            {authLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={CAMPUS.accent} />
                <Text style={styles.muted}>Loading...</Text>
              </View>
            ) : !eventCode ? (
              <Text style={styles.errorText}>
                This QR code does not contain a valid attendance link. Ask your teacher to generate a new QR code.
              </Text>
            ) : (
              <>
                <View style={styles.eventLabel}>
                  <Ionicons name="calendar-outline" size={16} color={CAMPUS.accent} />
                  <Text style={styles.eventLabelText}>EVENT DETAILS</Text>
                </View>

                {!userId ? (
                  <>
                    <Text style={styles.eventMeta}>Code: {eventCode}</Text>
                    <Text style={styles.eventMeta}>
                      The event name and time appear after you sign in.
                    </Text>
                  </>
                ) : eventLoading ? (
                  <View style={styles.loading}>
                    <ActivityIndicator color={CAMPUS.accent} />
                    <Text style={styles.muted}>Loading event...</Text>
                  </View>
                ) : event ? (
                  <>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventMeta}>Code: {event.event_code}</Text>
                    <Text style={styles.eventMeta}>{eventDate}</Text>
                    {event.venue ? (
                      <Text style={styles.eventMeta}>Venue: {event.venue}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.errorText}>
                    Event not found. It may have been removed, or the QR code may be outdated.
                  </Text>
                )}

                {closed ? (
                  <Text style={styles.errorText}>
                    This event is closed. Attendance cannot be recorded.
                  </Text>
                ) : null}

                {userId ? (
                  <View style={styles.signedIn}>
                    <Ionicons name="person-circle-outline" size={20} color={CAMPUS.mint} />
                    <View style={styles.flex}>
                      <Text style={styles.signedInText}>
                        Signed in as {user?.email ?? 'your QR-ATT account'}
                      </Text>
                      <Pressable
                        onPress={handleSwitchAccount}
                        disabled={busy}
                        hitSlop={12}
                        accessibilityRole="button"
                      >
                        <Text style={styles.switchText}>Use a different account</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Your QR-ATT email"
                      placeholderTextColor={CAMPUS.textFaint}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoComplete="email"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      style={styles.input}
                      editable={!busy}
                    />
                    <Text style={styles.label}>PASSWORD</Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Your QR-ATT password"
                      placeholderTextColor={CAMPUS.textFaint}
                      secureTextEntry
                      textContentType="password"
                      autoComplete="current-password"
                      returnKeyType="go"
                      onSubmitEditing={handleSubmit}
                      ref={passwordRef}
                      style={styles.input}
                      editable={!busy}
                    />
                  </>
                )}

                {message ? (
                  <View style={[styles.messageBox, success ? styles.successBox : styles.errorBox]}>
                    <Ionicons
                      name={success ? 'checkmark-circle' : 'alert-circle'}
                      size={20}
                      color={success ? CAMPUS.mint : CAMPUS.danger}
                    />
                    <Text style={[styles.messageText, success ? styles.successText : styles.errorText]}>
                      {message}
                    </Text>
                  </View>
                ) : null}

                {canSubmit ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      pressed && styles.buttonPressed,
                      busy && styles.buttonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={busy || success}
                  >
                    {busy ? (
                      <ActivityIndicator color="#111A24" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>
                          {success
                            ? 'Attendance Recorded'
                            : userId
                              ? 'Record Attendance'
                              : 'Sign In & Record Attendance'}
                        </Text>
                        <Ionicons name="arrow-forward" size={19} color="#111A24" />
                      </>
                    )}
                  </Pressable>
                ) : null}

                {!userId ? (
                  <View style={styles.createRow}>
                    <Text style={styles.createText}>No account yet?</Text>
                    <Link
                      href={{ pathname: '/register', params: { event: eventCode } }}
                      asChild
                    >
                      <Pressable hitSlop={16} accessibilityRole="link">
                        <Text style={styles.switchText}>Create one</Text>
                      </Pressable>
                    </Link>
                  </View>
                ) : null}

                <Text style={styles.footnote}>
                  Attendance is linked to the account you sign in with. Duplicate check-ins are rejected.
                </Text>
              </>
            )}
          </View>
          <Text style={styles.footer}>QR-ATT • Attendance management</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: CAMPUS.bg },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingTop: 32,
    paddingBottom: 40,
  },
  brandIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(239,197,171,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,197,171,0.35)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    textAlign: 'center',
    fontFamily: CAMPUS.mono,
    color: CAMPUS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  heading: {
    color: CAMPUS.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  intro: {
    color: CAMPUS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  card: {
    backgroundColor: CAMPUS.surface,
    borderColor: CAMPUS.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
  },
  loading: { minHeight: 150, alignItems: 'center', justifyContent: 'center', gap: 12 },
  muted: { color: CAMPUS.textMuted },
  eventLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  eventLabelText: { color: CAMPUS.accent, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  eventTitle: { color: CAMPUS.text, fontSize: 22, fontWeight: '800', marginBottom: 8 },
  eventMeta: { color: CAMPUS.textMuted, fontSize: 13, lineHeight: 20 },
  signedIn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, marginBottom: 8 },
  signedInText: { color: CAMPUS.mint, fontSize: 13, flexShrink: 1 },
  label: { color: CAMPUS.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 18, marginBottom: 7 },
  input: {
    color: CAMPUS.text,
    backgroundColor: CAMPUS.inputBg,
    borderColor: CAMPUS.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16, // 16px or more stops iPhones zooming the page when a field is tapped
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 50,
    borderRadius: 22,
    backgroundColor: CAMPUS.accent,
    paddingHorizontal: 16,
    marginTop: 22,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: '#111A24', fontSize: 14, fontWeight: '800', textAlign: 'center', flexShrink: 1 },
  messageBox: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 12, marginTop: 16 },
  successBox: { borderColor: 'rgba(87,227,162,0.4)', backgroundColor: 'rgba(87,227,162,0.1)' },
  errorBox: { borderColor: CAMPUS.dangerBorder, backgroundColor: CAMPUS.dangerBg },
  messageText: { flex: 1, fontSize: 13, lineHeight: 19 },
  successText: { color: CAMPUS.mint },
  errorText: { color: CAMPUS.danger, fontSize: 13, lineHeight: 20 },
  footnote: { color: CAMPUS.textFaint, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 14 },
  createRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 },
  createText: { color: CAMPUS.textMuted, fontSize: 14 },
  switchText: { color: CAMPUS.accent, fontSize: 14, fontWeight: '700', marginTop: 4, paddingVertical: 4 },
  footer: { color: CAMPUS.textFaint, fontSize: 11, textAlign: 'center', marginTop: 20 },
});
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CampusBackground from '@/components/CampusBackground';
import { CAMPUS } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

type EventRow = { id: string; title: string; venue?: string | null; status?: string | null; start_time?: string | null; end_time?: string | null };
type AttRow = { id: string; event_id: string; scanned_at: string };

function dateLabel(value?: string | null) {
  if (!value) return 'Time not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Time not set' : date.toLocaleString();
}

export default function InsightsScreen() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [attendance, setAttendance] = useState<AttRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('Upcoming events are shown here. Browser reminders are available while this page is open.');

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError('');
    const [ev, att] = await Promise.all([
      supabase.from('events').select('id,title,venue,status,start_time,end_time').order('start_time', { ascending: true }),
      supabase.from('attendance').select('id,event_id,scanned_at').order('scanned_at', { ascending: false }).limit(5000),
    ]);
    if (ev.error || att.error) {
      setError(ev.error?.message || att.error?.message || 'Could not load attendance insights.');
    } else {
      const allEvents = (ev.data || []) as EventRow[];
      setEvents(allEvents.filter(event => event.status !== 'closed' && (!event.start_time || new Date(event.start_time).getTime() >= Date.now() - 86400000)));
      setAttendance((att.data || []) as AttRow[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const enableNotifications = async () => {
    if (Platform.OS !== 'web') {
      setNotice('Browser notifications are only available on the web version. Upcoming events remain visible here.');
      return;
    }
    const browser = globalThis as any;
    if (!browser.Notification) { setNotice('This browser does not support notifications.'); return; }
    try {
      const permission = await browser.Notification.requestPermission();
      if (permission === 'granted') {
        setNotice('Browser notifications enabled while this page is open.');
        const upcoming = events.find(event => event.start_time && new Date(event.start_time).getTime() > Date.now());
        if (upcoming) new browser.Notification('QR-ATT event reminder', { body: `${upcoming.title} — ${dateLabel(upcoming.start_time)}` });
      } else setNotice('Notifications were not enabled. You can still view upcoming events here.');
    } catch { setNotice('Could not enable browser notifications in this environment.'); }
  };

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayCount = attendance.filter(item => new Date(item.scanned_at).getTime() >= dayStart).length;
  const eventCounts = events.map(event => ({ ...event, count: attendance.filter(item => item.event_id === event.id).length })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(1, ...eventCounts.map(event => event.count));

  return <View style={styles.root}>
    <CampusBackground />
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing || (loading && !refreshing)} onRefresh={() => load(true)} tintColor={CAMPUS.accent} />}>
      <Text style={styles.eyebrow}>YOUR CAMPUS AT A GLANCE</Text>
      <Text style={styles.title}>Insights & Reminders</Text>
      <Text style={styles.subtitle}>Attendance summaries and upcoming campus events in one place.</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? <ActivityIndicator color={CAMPUS.accent} size="large" style={{ marginTop: 24 }} /> : <>
        <View style={styles.grid}>
          <Metric icon="calendar-outline" label="UPCOMING EVENTS" value={events.length} />
          <Metric icon="people-outline" label="TOTAL CHECK-INS" value={attendance.length} />
          <Metric icon="today-outline" label="CHECK-INS TODAY" value={todayCount} />
          <Metric icon="radio-button-on-outline" label="OPEN EVENTS" value={events.filter(event => event.status !== 'closed').length} />
        </View>

        <View style={styles.sectionHeader}><Ionicons name="stats-chart-outline" size={20} color={CAMPUS.accent} /><Text style={styles.section}>Participation by event</Text></View>
        {eventCounts.length === 0 ? <Text style={styles.muted}>No event records are available yet.</Text> : eventCounts.slice(0, 10).map(event => <View key={event.id} style={styles.card}>
          <View style={styles.eventRow}><Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text><Text style={styles.count}>{event.count}</Text></View>
          <View style={styles.track}><View style={[styles.fill, { width: `${(event.count / maxCount) * 100}%` as any }]} /></View>
        </View>)}
        <Text style={styles.note}>Insights reflect records visible under your Supabase Row Level Security policies, so totals may be partial.</Text>

        <View style={[styles.sectionHeader, { marginTop: 28 }]}><Ionicons name="notifications-outline" size={20} color={CAMPUS.accent} /><Text style={styles.section}>Event reminders</Text></View>
        <TouchableOpacity style={styles.button} onPress={enableNotifications} accessibilityRole="button"><Ionicons name="notifications-outline" size={18} color={CAMPUS.bg} /><Text style={styles.buttonText}>Enable browser notifications</Text></TouchableOpacity>
        <Text style={styles.notice}>{notice}</Text>
        {events.length === 0 ? <View style={styles.card}><Ionicons name="calendar-clear-outline" size={28} color={CAMPUS.accent} /><Text style={styles.eventTitle}>No upcoming events</Text><Text style={styles.muted}>New events will appear here when published.</Text></View> : events.map(event => {
          const ms = event.start_time ? new Date(event.start_time).getTime() - Date.now() : null;
          const countdown = ms === null ? 'Date to be announced' : ms <= 0 ? 'Started recently' : ms < 86400000 ? `Starts in ${Math.max(1, Math.ceil(ms / 3600000))} hour(s)` : `Starts in ${Math.ceil(ms / 86400000)} day(s)`;
          return <View key={event.id} style={styles.card}>
            <View style={styles.eventRow}><Ionicons name="calendar-outline" size={20} color={CAMPUS.accent} /><Text style={[styles.eventTitle, { flex: 1 }]}>{event.title}</Text></View>
            <Text style={styles.date}>{dateLabel(event.start_time)}</Text>
            {event.end_time ? <Text style={styles.muted}>Ends: {dateLabel(event.end_time)}</Text> : null}
            {event.venue ? <Text style={styles.muted}>Venue: {event.venue}</Text> : null}
            <Text style={styles.countdown}>{countdown}</Text>
          </View>;
        })}
      </>}
    </ScrollView>
  </View>;
}

function Metric({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number }) {
  return <View style={styles.metric}><Ionicons name={icon} size={22} color={CAMPUS.accent} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CAMPUS.bg }, content: { padding: 22, paddingBottom: 112, maxWidth: 820, width: '100%', alignSelf: 'center' },
  eyebrow: { color: CAMPUS.accent, fontSize: 11, fontWeight: '800', letterSpacing: 2, marginTop: 12 }, title: { color: CAMPUS.text, fontSize: 30, fontWeight: '900', marginTop: 7 },
  subtitle: { color: CAMPUS.textMuted, fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 18 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metric: { width: '48%', flexGrow: 1, minWidth: 135, backgroundColor: CAMPUS.surface, borderColor: CAMPUS.border, borderWidth: 1, borderRadius: 16, padding: 16 }, metricValue: { color: CAMPUS.text, fontSize: 28, fontWeight: '900', marginTop: 10 }, metricLabel: { color: CAMPUS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 25, marginBottom: 8 }, section: { color: CAMPUS.text, fontSize: 18, fontWeight: '900' },
  card: { backgroundColor: CAMPUS.surface, borderColor: CAMPUS.border, borderWidth: 1, borderRadius: 22, padding: 14, marginTop: 10 }, eventRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, eventTitle: { color: CAMPUS.text, fontSize: 14, fontWeight: '700' }, count: { color: CAMPUS.accent, fontSize: 16, fontWeight: '900' },
  track: { height: 6, backgroundColor: CAMPUS.surfaceStrong, borderRadius: 9, overflow: 'hidden', marginTop: 12 }, fill: { height: '100%', backgroundColor: CAMPUS.primary, borderRadius: 9 }, muted: { color: CAMPUS.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  note: { color: CAMPUS.textFaint, fontSize: 11, lineHeight: 17, marginTop: 18 }, button: { backgroundColor: CAMPUS.accent, borderRadius: 16, padding: 13, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, buttonText: { color: CAMPUS.bg, fontWeight: '800' }, notice: { color: CAMPUS.textMuted, fontSize: 12, lineHeight: 18, marginTop: 12, marginBottom: 4 }, date: { color: CAMPUS.text, fontSize: 13, fontWeight: '700', marginTop: 12 }, countdown: { color: CAMPUS.mint, fontWeight: '800', marginTop: 12 }, error: { color: CAMPUS.danger, marginTop: 14 },
});

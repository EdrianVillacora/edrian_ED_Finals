import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CampusBackground from '@/components/CampusBackground';
import { CAMPUS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type EventRow = { id: string; title: string; venue?: string | null; start_time: string | null; end_time: string | null; status?: string | null };

function dateLabel(value: string | null) {
  if (!value) return 'Time not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Time not set' : date.toLocaleString();
}

export default function RemindersScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState('Upcoming events are shown here. Keep this page open to see in-app reminders.');
  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    const { data, error } = await supabase.from('events').select('id,title,venue,start_time,end_time,status').order('start_time', { ascending: true });
    if (!error && data) setEvents(data.filter((event: EventRow) => event.status !== 'closed' && (!event.start_time || new Date(event.start_time).getTime() >= Date.now() - 86400000)));
    else setNotice(error?.message ?? 'Could not load events. Check your Supabase permissions.');
    setLoading(false); setRefreshing(false);
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
        const upcoming = events.find(e => e.start_time && new Date(e.start_time).getTime() > Date.now());
        if (upcoming) new browser.Notification('QR-ATT event reminder', { body: `${upcoming.title} — ${dateLabel(upcoming.start_time)}` });
      } else setNotice('Notifications were not enabled. You can still view upcoming events here.');
    } catch { setNotice('Could not enable browser notifications in this environment.'); }
  };

  return <View style={styles.root}><CampusBackground/><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={CAMPUS.accent}/>}>
    <Text style={styles.eyebrow}>STAY ON SCHEDULE</Text><Text style={styles.title}>Event Reminders</Text>
    <Text style={styles.subtitle}>Upcoming campus activities and event times from Supabase.</Text>
    <TouchableOpacity style={styles.button} onPress={enableNotifications}><Ionicons name="notifications-outline" size={18} color={CAMPUS.bg}/><Text style={styles.buttonText}>Enable browser notifications</Text></TouchableOpacity>
    <Text style={styles.notice}>{notice}</Text>
    {loading ? <ActivityIndicator color={CAMPUS.accent} size="large" style={{marginTop:28}}/> : events.length === 0 ? <View style={styles.card}><Ionicons name="calendar-clear-outline" size={28} color={CAMPUS.accent}/><Text style={styles.cardTitle}>No upcoming events</Text><Text style={styles.muted}>New events will appear here when they are published.</Text></View> : events.map(event => {
      const ms = event.start_time ? new Date(event.start_time).getTime() - Date.now() : null;
      const countdown = ms === null ? 'Date to be announced' : ms <= 0 ? 'Started recently' : ms < 86400000 ? `Starts in ${Math.max(1, Math.ceil(ms / 3600000))} hour(s)` : `Starts in ${Math.ceil(ms / 86400000)} day(s)`;
      return <View key={event.id} style={styles.card}><View style={styles.row}><Ionicons name="calendar-outline" size={21} color={CAMPUS.accent}/><Text style={styles.cardTitle}>{event.title}</Text></View><Text style={styles.date}>{dateLabel(event.start_time)}</Text>{event.end_time ? <Text style={styles.muted}>Ends: {dateLabel(event.end_time)}</Text> : null}{event.venue ? <Text style={styles.muted}>Venue: {event.venue}</Text> : null}<Text style={styles.countdown}>{countdown}</Text></View>;
    })}
  </ScrollView></View>;
}
const styles = StyleSheet.create({root:{flex:1,backgroundColor:CAMPUS.bg},content:{padding:22,paddingBottom:125,maxWidth:760,width:'100%',alignSelf:'center'},eyebrow:{color:CAMPUS.accent,fontSize:11,fontWeight:'800',letterSpacing:2,marginTop:12},title:{color:CAMPUS.text,fontSize:30,fontWeight:'900',marginTop:7},subtitle:{color:CAMPUS.textMuted,fontSize:14,lineHeight:21,marginTop:7,marginBottom:18},button:{backgroundColor:CAMPUS.accent,borderRadius: 16,padding:13,flexDirection:'row',gap:8,alignItems:'center',justifyContent:'center'},buttonText:{color:CAMPUS.bg,fontWeight:'800'},notice:{color:CAMPUS.textMuted,fontSize:12,lineHeight:18,marginTop:12,marginBottom:8},card:{backgroundColor:CAMPUS.surface,borderColor:CAMPUS.border,borderWidth:1,borderRadius:16,padding:16,marginTop:12},row:{flexDirection:'row',alignItems:'center',gap:9},cardTitle:{color:CAMPUS.text,fontSize:16,fontWeight:'800',flexShrink:1},date:{color:CAMPUS.text,fontSize:13,fontWeight:'700',marginTop:12},muted:{color:CAMPUS.textMuted,fontSize:12,marginTop:6,lineHeight:18},countdown:{color:CAMPUS.mint,fontWeight:'800',marginTop:12}});

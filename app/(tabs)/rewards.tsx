import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CampusBackground from '@/components/CampusBackground';
import { CAMPUS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { getAttendanceHistory } from '@/lib/attendance';

const milestones = [
  { count: 1, title: 'First Check-in', description: 'Your first recorded attendance.', icon: 'flag-outline' as const },
  { count: 5, title: 'Regular Attendee', description: 'Attend five events.', icon: 'ribbon-outline' as const },
  { count: 10, title: 'Campus Regular', description: 'Attend ten events.', icon: 'medal-outline' as const },
  { count: 25, title: 'Attendance Champion', description: 'Attend twenty-five events.', icon: 'trophy-outline' as const },
];

export default function RewardsScreen() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    if (user?.id) {
      const history = await getAttendanceHistory(user.id);
      setCount(history.length);
    } else setCount(0);
    setLoading(false);
  }, [user?.id]);
  useEffect(() => { load(); }, [load]);
  const next = milestones.find(m => count < m.count);
  const progress = next ? Math.min(100, (count / next.count) * 100) : 100;
  return <View style={styles.root}><CampusBackground/><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={CAMPUS.accent}/>}>
    <Text style={styles.eyebrow}>YOUR ATTENDANCE JOURNEY</Text><Text style={styles.title}>Achievements & Rewards</Text><Text style={styles.subtitle}>Milestones are calculated from your recorded attendance history.</Text>
    <View style={styles.hero}><Ionicons name="trophy" size={34} color={CAMPUS.accent}/><Text style={styles.big}>{loading ? '—' : count}</Text><Text style={styles.heroLabel}>TOTAL CHECK-INS</Text><Text style={styles.muted}>{next ? `${next.count - count} more attendance record(s) to unlock ${next.title}.` : 'All current milestones unlocked. Amazing work!'}</Text><View style={styles.track}><View style={[styles.fill,{width:`${progress}%` as any}]}/></View></View>
    {loading ? <ActivityIndicator color={CAMPUS.accent} style={{marginTop:24}}/> : milestones.map(m => { const unlocked = count >= m.count; return <View key={m.count} style={[styles.card, unlocked && styles.unlocked]}><View style={[styles.icon,{backgroundColor:unlocked?'rgba(87,227,162,0.15)':CAMPUS.surfaceStrong}]}><Ionicons name={m.icon} size={24} color={unlocked?CAMPUS.mint:CAMPUS.textMuted}/></View><View style={styles.info}><Text style={styles.cardTitle}>{m.title}</Text><Text style={styles.muted}>{m.description}</Text><Text style={[styles.status,{color:unlocked?CAMPUS.mint:CAMPUS.textMuted}]}>{unlocked?'UNLOCKED':`${m.count} attendance records required`}</Text></View></View>; })}
  </ScrollView></View>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:CAMPUS.bg},content:{padding:22,paddingBottom:125,maxWidth:760,width:'100%',alignSelf:'center'},eyebrow:{color:CAMPUS.accent,fontSize:11,fontWeight:'800',letterSpacing:2,marginTop:12},title:{color:CAMPUS.text,fontSize:28,fontWeight:'900',marginTop:7},subtitle:{color:CAMPUS.textMuted,fontSize:14,lineHeight:21,marginTop:7,marginBottom:16},hero:{backgroundColor:CAMPUS.surface,borderColor:CAMPUS.border,borderWidth:1,borderRadius:18,padding:20,alignItems:'center'},big:{fontSize:46,color:CAMPUS.text,fontWeight:'900',marginTop:8},heroLabel:{fontSize:11,color:CAMPUS.accent,fontWeight:'900',letterSpacing:2},muted:{fontSize:12,color:CAMPUS.textMuted,lineHeight:18,marginTop:7,textAlign:'center'},track:{height:7,width:'100%',backgroundColor:CAMPUS.surfaceStrong,borderRadius:9,overflow:'hidden',marginTop:16},fill:{height:'100%',backgroundColor:CAMPUS.mint,borderRadius:9},card:{flexDirection:'row',alignItems:'center',gap:14,backgroundColor:CAMPUS.surface,borderColor:CAMPUS.border,borderWidth:1,borderRadius:16,padding:15,marginTop:12},unlocked:{borderColor:'rgba(87,227,162,0.45)'},icon:{width:48,height:48,borderRadius: 22,alignItems:'center',justifyContent:'center'},info:{flex:1},cardTitle:{color:CAMPUS.text,fontSize:15,fontWeight:'800'},status:{fontSize:10,fontWeight:'900',letterSpacing:1,marginTop:8}});

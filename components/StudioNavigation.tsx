import React from 'react';
import { ScrollView, Pressable, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CAMPUS } from '@/constants/colors';

type IconName = keyof typeof Ionicons.glyphMap;
type Role = 'student' | 'teacher' | 'admin' | null;
const ROUTES: { route: string; label: string; icon: IconName; roles?: ('teacher'|'admin')[] }[] = [
  { route: '/(tabs)', label: 'Home', icon: 'home-outline' },
  { route: '/(tabs)/scan', label: 'Scan', icon: 'scan-outline' },
  { route: '/(tabs)/history', label: 'History', icon: 'time-outline' },
  { route: '/(tabs)/insights', label: 'Insights', icon: 'stats-chart-outline' },
  { route: '/(tabs)/live-monitor', label: 'Live', icon: 'pulse-outline', roles: ['teacher','admin'] },
  { route: '/(tabs)/teacher', label: 'Events', icon: 'calendar-outline', roles: ['teacher','admin'] },
  { route: '/(tabs)/admin', label: 'Admin', icon: 'shield-checkmark-outline', roles: ['admin'] },
  { route: '/(tabs)/profile', label: 'Profile', icon: 'person-circle-outline' },
];
export default function StudioNavigation({role}: {role: Role}) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const visible = ROUTES.filter(item => !item.roles || (role != null && item.roles.includes(role as 'teacher'|'admin')));
  const wide = width >= 750;
  return <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 7) + 5 }]}>
    <View style={styles.inner}>
      {wide && <View style={styles.identity}><View style={styles.logo}><Ionicons name="layers-outline" size={19} color={CAMPUS.bg}/></View><Text style={styles.wordmark}>ATELIER<Text style={{ color:CAMPUS.accent }}> / </Text>PRESENCE</Text></View>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.links, !wide && { flexGrow: 1, justifyContent: 'space-between' }]}>
        {visible.map(item => {
          const active = pathname === item.route || (item.route === '/(tabs)' && (pathname === '/' || pathname === '/(tabs)'));
          return <Pressable key={item.route} onPress={()=>router.push(item.route as any)} accessibilityRole="button" accessibilityState={{selected:active}} style={({pressed})=>[styles.link, active && styles.selected, pressed && {opacity:0.65}]}>
            <Ionicons name={item.icon} size={20} color={active ? CAMPUS.bg : CAMPUS.textMuted}/>
            <Text style={[styles.linkLabel, active && styles.selectedText]}>{item.label}</Text>
          </Pressable>;
        })}
      </ScrollView>
    </View>
  </View>;
}
const styles=StyleSheet.create({
 root:{position:'absolute',left:0,right:0,bottom:0,zIndex:20,paddingTop:9,paddingHorizontal:12,backgroundColor:'#121B26',borderTopWidth:1,borderTopColor:'#34404A',shadowColor:'#000',shadowOpacity:0.24,shadowRadius:18,elevation:16},
 inner:{maxWidth:1260,width:'100%',alignSelf:'center',flexDirection:'row',alignItems:'center',gap:24},
 identity:{flexDirection:'row',alignItems:'center',gap:10},logo:{backgroundColor:'#EFC5AB',width:36,height:36,borderRadius:12,alignItems:'center',justifyContent:'center'},wordmark:{color:'#FCF6EC',fontWeight:'900',letterSpacing:1.1,fontSize:13},
 links:{alignItems:'center',gap:4,paddingRight:8},link:{minWidth:60,paddingVertical:9,paddingHorizontal:11,alignItems:'center',justifyContent:'center',gap:4,borderRadius:16},selected:{backgroundColor:'#EFC5AB'},linkLabel:{color:'#BBC6CC',fontSize:10,fontWeight:'800'},selectedText:{color:'#121B26'},
});

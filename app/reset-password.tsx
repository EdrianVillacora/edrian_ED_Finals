import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CAMPUS } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true); setChecking(false); setError('');
      }
    });
    // Supabase processes the URL tokens asynchronously on first load.
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      if (data.session) setReady(true);
      setChecking(false);
    }).catch(() => { if (active) setChecking(false); });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  const submit = async () => {
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true); setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      await supabase.auth.signOut();
    } catch (e: any) { setError(e?.message || 'Unable to update password. Request a new recovery link.'); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.icon}><Ionicons name="lock-closed-outline" size={34} color={CAMPUS.accent}/></View>
      <Text style={styles.title}>{done ? 'Password updated!' : 'Create a new password'}</Text>
      {done ? <>
        <Text style={styles.sub}>Your password has been changed. You can sign in with your new password.</Text>
        <Pressable onPress={() => router.replace('/login')} style={styles.button}><Text style={styles.buttonLabel}>Go to Sign In</Text></Pressable>
      </> : checking ? <ActivityIndicator style={{marginTop:30}} color={CAMPUS.accent}/> : !ready ? <>
        <Text style={styles.sub}>Your recovery link is invalid or expired. Request a new link to continue.</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Link href="/forgot-password" asChild><Pressable style={styles.button}><Text style={styles.buttonLabel}>Request a new link</Text></Pressable></Link>
      </> : <>
        <Text style={styles.sub}>Choose a new password for your QR Attendance account.</Text>
        <Text style={styles.label}>NEW PASSWORD</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor={CAMPUS.textFaint} secureTextEntry autoCapitalize="none" autoComplete="new-password" editable={!busy}/>
        <Text style={[styles.label,{marginTop:20}]}>CONFIRM NEW PASSWORD</Text>
        <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} placeholder="Repeat your new password" placeholderTextColor={CAMPUS.textFaint} secureTextEntry autoCapitalize="none" autoComplete="new-password" editable={!busy}/>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable onPress={submit} disabled={busy} style={styles.button}>{busy ? <ActivityIndicator color="white"/> : <Text style={styles.buttonLabel}>Update Password</Text>}</Pressable>
      </>}
      {!done && <Link href="/login" asChild><Pressable style={styles.back}><Text style={styles.backText}>Back to Sign In</Text></Pressable></Link>}
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:CAMPUS.bg},content:{flexGrow:1,justifyContent:'center',width:'100%',maxWidth:440,alignSelf:'center',padding:26},
  icon:{alignSelf:'center',borderWidth:1,borderColor:CAMPUS.border,padding:18,borderRadius: 24,marginBottom:24},
  title:{fontSize:27,fontWeight:'800',color:CAMPUS.text,textAlign:'center'},sub:{color:CAMPUS.textMuted,textAlign:'center',lineHeight:22,marginTop:10,marginBottom:30},
  label:{fontSize:12,fontWeight:'700',color:CAMPUS.textMuted,letterSpacing:1,marginBottom:10},
  input:{backgroundColor:CAMPUS.inputBg,borderColor:CAMPUS.border,borderWidth:1,borderRadius: 16,padding:16,color:CAMPUS.text,fontSize:16},
  button:{backgroundColor:CAMPUS.primary,borderRadius: 16,padding:17,alignItems:'center',marginTop:18},buttonLabel:{color:'white',fontWeight:'700',fontSize:16},
  back:{padding:18,alignItems:'center'},backText:{color:CAMPUS.accent,fontWeight:'600'},error:{color:CAMPUS.danger,marginTop:12}
});

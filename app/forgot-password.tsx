import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CAMPUS } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { validateEmail } from '@/lib/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async () => {
    const checked = validateEmail(email);
    if (!checked.ok) { setError(checked.message); return; }
    setError(''); setBusy(true);
    try {
      // The web deployment is the destination, not localhost or an Expo deep link.
      const redirectTo = Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'https://qr-attendance-ten-jade.vercel.app/reset-password';
      const { error: err } = await supabase.auth.resetPasswordForEmail(checked.value, { redirectTo });
      if (err) throw err;
      setSent(true);
    } catch (e: any) { setError(e?.message ?? 'Unable to send recovery email.'); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.icon}><Ionicons name="key-outline" size={34} color={CAMPUS.accent}/></View>
      <Text style={styles.title}>Reset your password</Text>
      <Text style={styles.sub}>Enter your account email and we’ll send you a secure password recovery link.</Text>
      {sent ? <Text style={styles.success}>If this email has an account, you'll receive a recovery link. Check your inbox and spam folder.</Text> : <>
        <Text style={styles.label}>EMAIL</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your.email@school.edu" placeholderTextColor={CAMPUS.textFaint} autoCapitalize="none" keyboardType="email-address" autoComplete="email" editable={!busy}/>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Pressable onPress={submit} disabled={busy} style={styles.button}>{busy ? <ActivityIndicator color="white"/> : <Text style={styles.buttonLabel}>Send recovery link</Text>}</Pressable>
      </>}
      <Link href="/login" asChild><Pressable style={styles.back}><Text style={styles.backText}>Back to Sign In</Text></Pressable></Link>
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
  back:{padding:18,alignItems:'center'},backText:{color:CAMPUS.accent,fontWeight:'600'},
  error:{color:CAMPUS.danger,marginTop:12},success:{color:CAMPUS.mint,textAlign:'center',lineHeight:23,marginBottom:15}
});

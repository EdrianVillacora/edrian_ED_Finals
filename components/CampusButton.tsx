import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { CAMPUS } from '@/constants/colors';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export default function CampusButton({
  title,
  icon,
  onPress,
  variant = 'secondary',
  disabled = false,
}: Props) {
  if (variant === 'primary') {
    return (
      <Pressable
        style={({ pressed }) => [styles.primaryShell, pressed && styles.pressed, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="campusButtonGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#CFF589" />
                <Stop offset="0.5" stopColor="#C8E783" />
                <Stop offset="1" stopColor="#A5C8BE" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#campusButtonGrad)" />
          </Svg>
        </View>

        <View style={styles.primaryHalo} />
        <View style={styles.primaryTile}>
          <Ionicons name={icon} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.primaryTextWrap}>
          <Text style={styles.primaryLabel}>Primary Action</Text>
          <Text style={styles.primaryTitle}>{title}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </Pressable>
    );
  }

  const isDanger = variant === 'danger';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.secondary,
        isDanger && styles.secondaryDanger,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      <View style={[styles.secondaryGlow, isDanger && styles.secondaryGlowDanger]} />
      <View style={[styles.iconTile, isDanger && styles.iconTileDanger]}>
        <Ionicons name={icon} size={20} color={isDanger ? CAMPUS.danger : CAMPUS.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.secondaryOverline}>{isDanger ? 'SECURE ACTION' : 'QUICK ACCESS'}</Text>
        <Text style={[styles.secondaryText, isDanger && styles.dangerText]}>{title}</Text>
      </View>
      <Ionicons name="arrow-forward-circle-outline" size={21} color={isDanger ? CAMPUS.danger : CAMPUS.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  primaryShell: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 16,
    overflow: 'hidden',
    shadowColor: '#C1E46E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryHalo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -40,
    top: -32,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  primaryTile: {
    width: 52,
    height: 52,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTextWrap: {
    flex: 1,
  },
  primaryLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  primaryTitle: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  secondary: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 15,
  },
  secondaryDanger: {
    backgroundColor: CAMPUS.dangerBg,
    borderColor: CAMPUS.dangerBorder,
  },
  secondaryGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    right: -24,
    top: -30,
    backgroundColor: 'rgba(239,197,171,0.10)',
  },
  secondaryGlowDanger: {
    backgroundColor: 'rgba(255,158,146,0.10)',
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(239,197,171,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,197,171,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileDanger: {
    backgroundColor: 'rgba(255,107,122,0.14)',
    borderColor: CAMPUS.dangerBorder,
  },
  secondaryOverline: {
    color: CAMPUS.textFaint,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: CAMPUS.text,
  },
  dangerText: {
    color: CAMPUS.danger,
  },
});

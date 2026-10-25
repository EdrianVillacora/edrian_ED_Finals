import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { CAMPUS } from '@/constants/colors';

type IconName = keyof typeof Ionicons.glyphMap;
type DrawerItem = {
  label: string;
  route: string;
  icon: IconName;
  description: string;
  roles?: ('teacher' | 'admin')[];
};

const ITEMS: DrawerItem[] = [
  {
    label: 'Home',
    route: '/(tabs)',
    icon: 'home-outline',
    description: 'Overview, shortcuts and latest campus activity.',
  },
  {
    label: 'Scan QR',
    route: '/(tabs)/scan',
    icon: 'qr-code-outline',
    description: 'Open the scanner and record attendance quickly.',
  },
  {
    label: 'Attendance History',
    route: '/(tabs)/history',
    icon: 'time-outline',
    description: 'Review past check-ins and attendance records.',
  },
  {
    label: 'Insights',
    route: '/(tabs)/insights',
    icon: 'stats-chart-outline',
    description: 'Track your trends, reminders, and performance.',
  },
  {
    label: 'Live Monitor',
    route: '/(tabs)/live-monitor',
    icon: 'pulse-outline',
    description: 'Watch event activity and check-ins in real time.',
    roles: ['teacher', 'admin'],
  },
  {
    label: 'Profile',
    route: '/(tabs)/profile',
    icon: 'person-outline',
    description: 'Manage your account details and sign out securely.',
  },
  {
    label: 'Teacher Console',
    route: '/(tabs)/teacher',
    icon: 'school-outline',
    description: 'Create events and manage attendance workflows.',
    roles: ['teacher', 'admin'],
  },
  {
    label: 'Admin Console',
    route: '/(tabs)/admin',
    icon: 'shield-checkmark-outline',
    description: 'Access privileged controls and system oversight.',
    roles: ['admin'],
  },
];

const QUICK_ROUTES = ['/(tabs)', '/(tabs)/scan', '/(tabs)/history', '/(tabs)/profile'];

function routeIsActive(pathname: string, route: string) {
  return pathname === route || (route === '/(tabs)' && (pathname === '/' || pathname === '/(tabs)'));
}

export default function AppDrawer({ role }: { role: 'student' | 'teacher' | 'admin' | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState(Dimensions.get('window'));

  const visibleItems = useMemo(
    () => ITEMS.filter(item => !item.roles || (!!role && item.roles.includes(role as 'teacher' | 'admin'))),
    [role]
  );

  const quickItems = useMemo(() => {
    const picked = QUICK_ROUTES
      .map(route => visibleItems.find(item => item.route === route))
      .filter(Boolean) as DrawerItem[];

    return picked.slice(0, 4);
  }, [visibleItems]);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayTranslate = useRef(new Animated.Value(26)).current;
  const dockScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreen(window);
    });
    return () => subscription.remove();
  }, []);

  const show = () => {
    setOpen(true);
    overlayOpacity.setValue(0);
    overlayTranslate.setValue(26);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(overlayTranslate, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(dockScale, {
        toValue: 0.96,
        damping: 18,
        stiffness: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hide = (done?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(overlayTranslate, {
        toValue: 18,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(dockScale, {
        toValue: 1,
        damping: 18,
        stiffness: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setOpen(false);
        done?.();
      }
    });
  };

  const navigateTo = (route: string) => hide(() => router.push(route as any));

  const width = screen.width;
  const isTiny = width < 345;
  const isCompact = width < 390;
  const shortScreen = screen.height < 690;
  const cardsPerRow = width >= 1120 ? 3 : width >= 720 ? 2 : 1;
  const cardWidth = cardsPerRow === 3 ? '31.5%' : cardsPerRow === 2 ? '48.2%' : '100%';
  const roleLabel = role ? role.toUpperCase() : 'GUEST';

  return (
    <>
      <Animated.View style={[styles.dockWrap, { left: isTiny ? 5 : 12, right: isTiny ? 5 : 12, bottom: Math.max(insets.bottom, 6) + 5, transform: [{ scale: dockScale }] }]}>
        <View style={styles.dockShadow} />
        <View style={[styles.dock, isCompact && { paddingLeft: 4, paddingRight: 5, gap: 2, minHeight: 69, paddingVertical: 6 }]}>
          <View style={styles.dockGlowLeft} />
          <View style={styles.dockGlowRight} />
          {quickItems.map(item => {
            const active = routeIsActive(pathname, item.route);
            return (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route as any)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [styles.dockItem, isCompact && { paddingHorizontal: 0, gap: 3 }, active && styles.dockItemActive, pressed && styles.pressed]}
              >
                <View style={[styles.dockItemIcon, isCompact && { width: 30, height: 30, borderRadius: 11 }, active && styles.dockItemIconActive]}>
                  <Ionicons name={item.icon} size={isTiny ? 16 : 18} color={active ? '#15201B' : CAMPUS.textMuted} />
                </View>
                <Text style={[styles.dockItemLabel, isCompact && { fontSize: isTiny ? 8 : 9 }, active && styles.dockItemLabelActive]} numberOfLines={1}>
                  {item.label.replace('Attendance ', '')}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            onPress={show}
            accessibilityRole="button"
            accessibilityLabel="Open workspace navigator"
            style={({ pressed }) => [styles.launcherWrap, isCompact && { marginLeft: 0 }, pressed && styles.pressed]}
          >
            <View style={[styles.launcherOuter, isCompact && { width: isTiny ? 48 : 53, height: isTiny ? 48 : 53, borderRadius: 27 }]}>
              <Svg width="100%" height="100%" viewBox="0 0 74 74" style={StyleSheet.absoluteFillObject}>
                <Defs>
                  <LinearGradient id="launcherGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#D9FC79" />
                    <Stop offset="0.55" stopColor="#AEDF9F" />
                    <Stop offset="1" stopColor="#7DCABB" />
                  </LinearGradient>
                </Defs>
                <Circle cx="37" cy="37" r="37" fill="url(#launcherGrad)" />
              </Svg>
              <View style={styles.launcherInner}>
                <Ionicons name="grid" size={24} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.launcherText, isCompact && { fontSize: 9 }]}>Space</Text>
          </Pressable>
        </View>
      </Animated.View>

      {open ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]} />
          <Pressable onPress={() => hide()} style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Close workspace navigator" />

          <Animated.View
            style={[
              styles.overlay,
              {
                top: Math.max(insets.top, 6) + (shortScreen ? 2 : 8),
                bottom: Math.max(insets.bottom, 6) + (isCompact ? 77 : 95),
                left: isCompact ? 6 : 14,
                right: isCompact ? 6 : 14,
                transform: [{ translateY: overlayTranslate }],
                opacity: overlayOpacity,
              },
            ]}
          >
            <View style={styles.overlayAuraOne} />
            <View style={styles.overlayAuraTwo} />

            <View style={[styles.overlayHeader, isCompact && { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 8 }]}>
              <View style={styles.overlayBrandWrap}>
                <View style={styles.overlayBrandIcon}>
                  <Ionicons name="sparkles" size={18} color={CAMPUS.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.overlayEyebrow}>WORKSPACE / INDEX</Text>
                  <Text style={[styles.overlayTitle, isCompact && { fontSize: 19, lineHeight: 24 }]}>Every tool. One beautiful space.</Text>
                  <Text style={[styles.overlaySubtitle, isCompact && { fontSize: 11, lineHeight: 16, marginTop: 4 }]}>
                    Move between attendance, analytics, event control and your account without losing your flow.
                  </Text>
                </View>
              </View>

              <View style={styles.overlayMetaRow}>
                <View style={styles.metaPill}>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaPillText}>LIVE SESSION</Text>
                </View>
                <View style={styles.metaPill}>
                  <Ionicons name="shield-checkmark-outline" size={13} color={CAMPUS.mint} />
                  <Text style={styles.metaPillText}>{roleLabel}</Text>
                </View>
                <Pressable onPress={() => hide()} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                  <Ionicons name="close" size={20} color={CAMPUS.textMuted} />
                </Pressable>
              </View>
            </View>

            {!shortScreen && <View style={[styles.featureStrip, isCompact && { paddingHorizontal: 12, paddingTop: 8, gap: 6 }]}>
              <View style={styles.featureCardLarge}>
                <Text style={styles.featureEyebrow}>EXPLORE FAST</Text>
                <Text style={styles.featureTitle}>Your essentials, in one place.</Text>
                <Text style={styles.featureText}>Built around your day. Designed for total clarity.</Text>
              </View>
              <View style={styles.featureCardMini}>
                <Text style={styles.featureMetric}>{visibleItems.length}</Text>
                <Text style={styles.featureCaption}>Active modules</Text>
              </View>
              <View style={styles.featureCardMini}>
                <Text style={styles.featureMetric}>{quickItems.length}</Text>
                <Text style={styles.featureCaption}>Quick tools</Text>
              </View>
            </View>}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.overlayScroll, isCompact && { paddingHorizontal: 12, paddingTop: 10 }]}>
              <View style={styles.cardGrid}>
                {visibleItems.map((item, index) => {
                  const active = routeIsActive(pathname, item.route);
                  return (
                    <Pressable
                      key={item.route}
                      onPress={() => navigateTo(item.route)}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: active }}
                      style={({ pressed }) => [
                        styles.navCard,
                        { width: cardWidth },
                        isCompact && { minHeight: 130, padding: 12, borderRadius: 18 },
                        active && styles.navCardActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={[styles.cardTopRow, isCompact && { marginBottom: 6 }]}>
                        <View style={[styles.cardIconWrap, active && styles.cardIconWrapActive]}>
                          <Ionicons name={item.icon} size={22} color={active ? '#15201B' : CAMPUS.accent} />
                        </View>
                        <View style={styles.cardBadge}>
                          <Text style={styles.cardBadgeText}>{String(index + 1).padStart(2, '0')}</Text>
                        </View>
                      </View>

                      <View>
                        <Text style={[styles.cardLabel, isCompact && { fontSize: 16 }, active && styles.cardLabelActive]}>{item.label}</Text>
                        <Text style={[styles.cardDescription, isCompact && { fontSize: 11, lineHeight: 16, marginTop: 4 }]}>{item.description}</Text>
                      </View>

                      <View style={styles.cardFooter}>
                        <Text style={styles.cardFooterText}>{active ? 'CURRENT VIEW' : 'OPEN MODULE'}</Text>
                        <Ionicons name="arrow-forward" size={15} color={active ? CAMPUS.accent : CAMPUS.textFaint} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.93,
    transform: [{ scale: 0.985 }],
  },
  dockWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 22,
  },
  dockShadow: {
    position: 'absolute',
    top: 6,
    left: 16,
    right: 16,
    bottom: -6,
    borderRadius: 34,
    backgroundColor: 'rgba(0,0,0,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 26,
    elevation: 18,
  },
  dock: {
    overflow: 'visible',
    minHeight: 82,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(10,15,30,0.94)',
    paddingLeft: 10,
    paddingRight: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dockGlowLeft: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(110, 89, 255, 0.20)',
    left: -18,
    top: -42,
  },
  dockGlowRight: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(216,252,121,0.15)',
    right: -16,
    bottom: -38,
  },
  dockItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  dockItemActive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
  },
  dockItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockItemIconActive: {
    backgroundColor: CAMPUS.accent,
  },
  dockItemLabel: {
    color: CAMPUS.textFaint,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dockItemLabelActive: {
    color: CAMPUS.text,
  },
  launcherWrap: {
    alignItems: 'center',
    marginLeft: 3,
  },
  launcherOuter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 4,
    shadowColor: '#C1E46E',
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 12,
  },
  launcherInner: {
    flex: 1,
    borderRadius: 29,
    backgroundColor: 'rgba(8,10,20,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  launcherText: {
    marginTop: 4,
    color: CAMPUS.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,8,18,0.72)',
  },
  overlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#10191B',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 26,
  },
  overlayAuraOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(216, 252, 121, 0.24)',
    right: -90,
    top: -70,
  },
  overlayAuraTwo: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(216,252,121,0.14)',
    left: -100,
    bottom: -120,
  },
  overlayHeader: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  overlayBrandWrap: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  overlayBrandIcon: {
    width: 50,
    height: 50,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayEyebrow: {
    color: CAMPUS.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.9,
    marginBottom: 5,
  },
  overlayTitle: {
    color: CAMPUS.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  overlaySubtitle: {
    color: CAMPUS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 560,
  },
  overlayMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
  },
  metaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CAMPUS.mint,
  },
  metaPillText: {
    color: CAMPUS.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeButton: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  featureStrip: {
    paddingHorizontal: 22,
    paddingTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCardLarge: {
    flexGrow: 1,
    minWidth: 230,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 16,
  },
  featureCardMini: {
    minWidth: 108,
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 16,
    justifyContent: 'center',
  },
  featureEyebrow: {
    color: CAMPUS.textFaint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  featureTitle: {
    color: CAMPUS.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginTop: 8,
  },
  featureText: {
    color: CAMPUS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  featureMetric: {
    color: CAMPUS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  featureCaption: {
    color: CAMPUS.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  overlayScroll: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: Platform.select({ web: 28, default: 16 }),
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  navCard: {
    minHeight: 184,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 28,
    padding: 18,
    justifyContent: 'space-between',
  },
  navCardActive: {
    backgroundColor: 'rgba(216, 252, 121, 0.20)',
    borderColor: 'rgba(128, 205, 255, 0.35)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconWrapActive: {
    backgroundColor: CAMPUS.accent,
  },
  cardBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardBadgeText: {
    color: CAMPUS.textFaint,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  cardLabel: {
    color: CAMPUS.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  cardLabelActive: {
    color: '#FFFFFF',
  },
  cardDescription: {
    color: CAMPUS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cardFooterText: {
    color: CAMPUS.textFaint,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

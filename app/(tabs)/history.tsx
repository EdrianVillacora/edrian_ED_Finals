import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CampusBackground from '@/components/CampusBackground';
import { CAMPUS } from '@/constants/colors';
// import { STUDENT_ID } from '@/constants/student';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';
import {
  getAttendanceHistory,
  getTeacherEventAttendance,
  type AttendanceRecord,
  type TeacherEventAttendance,
} from '@/lib/attendance';

export default function HistoryScreen() {
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [teacherEvents, setTeacherEvents] = useState<
    TeacherEventAttendance[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const profile = await getProfile(user.id);
    const currentRole = profile?.role ?? 'student';

    setRole(currentRole);

    if (currentRole === 'teacher') {
      const events = await getTeacherEventAttendance(user.id);

      setTeacherEvents(events);
      setRecords([]);
    } else {
      // getAttendanceHistory(STUDENT_ID).then((rows) => {
      const studentId = user.id;
      const rows = await getAttendanceHistory(studentId);

      setRecords(rows);
      setTeacherEvents([]);
    }

    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={CAMPUS.accent}
      colors={[CAMPUS.accent]}
      progressBackgroundColor={CAMPUS.bgDeep}
    />
  );

  if (loading) {
    return (
      <Screen>
        <PageHeader eyebrow="ATTENDANCE LOG" title="Attendance History" />

        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={CAMPUS.accent} />
          <Text style={styles.stateText}>Loading records...</Text>
        </View>
      </Screen>
    );
  }

  if (role === 'teacher') {
    return (
      <Screen>
        <PageHeader
          eyebrow="ATTENDANCE LOG"
          title="Attendance History"
          subtitle="Events you created and their attendance"
          count={teacherEvents.length}
          countLabel={teacherEvents.length === 1 ? 'event' : 'events'}
        />

        {teacherEvents.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            text="No events yet. Create an event from the Teacher tab to see attendance here."
          />
        ) : (
          <FlatList
            data={teacherEvents}
            keyExtractor={(item) => item.eventId}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.eventHeader}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>
                      {item.title}
                    </Text>

                    <View style={styles.codeChip}>
                      <Text style={styles.codeText}>
                        {item.eventCode}
                      </Text>
                    </View>

                    <View style={styles.metaRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={CAMPUS.textMuted}
                      />
                      <Text style={styles.eventMeta}>
                        {formatDate(item.startTime)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.countBadge}>
                    <Text style={styles.countNumber}>
                      {item.attendeeCount}
                    </Text>

                    <Text style={styles.countLabel}>
                      {item.attendeeCount === 1
                        ? 'attendee'
                        : 'attendees'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.attendeesTitle}>
                  STUDENTS
                </Text>

                {item.attendees.length === 0 ? (
                  <View style={styles.noAttendeesRow}>
                    <Ionicons
                      name="scan-outline"
                      size={16}
                      color={CAMPUS.textFaint}
                    />
                    <Text style={styles.noAttendees}>
                      No students have scanned this QR code yet.
                    </Text>
                  </View>
                ) : (
                  item.attendees.map((attendee) => (
                    <View
                      key={`${item.eventId}-${attendee.studentId}-${attendee.scannedAt}`}
                      style={styles.attendeeRow}
                    >
                      <View style={styles.avatar}>
                        <Ionicons
                          name="person"
                          size={14}
                          color={CAMPUS.accent}
                        />
                      </View>

                      <Text style={styles.studentId}>
                        {shortId(attendee.studentId)}
                      </Text>

                      <Text style={styles.attendeeTime}>
                        {formatDate(attendee.scannedAt)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          />
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        eyebrow="ATTENDANCE LOG"
        title="Attendance History"
        count={records.length}
        countLabel={records.length === 1 ? 'check-in' : 'check-ins'}
      />

      {records.length === 0 ? (
        <EmptyState
          icon="qr-code-outline"
          text="No records yet. Scan a QR code to register your attendance."
        />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          renderItem={({ item }) => (
            <View style={[styles.card, styles.recordCard]}>
              <View style={styles.checkTile}>
                <Ionicons
                  name="checkmark-circle"
                  size={26}
                  color={CAMPUS.mint}
                />
              </View>

              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>
                  {item.eventTitle}
                </Text>

                <View style={styles.codeChip}>
                  <Text style={styles.codeText}>
                    {item.eventId}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={CAMPUS.textMuted}
                  />
                  <Text style={styles.eventMeta}>
                    {formatDate(item.scannedAt)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

/* ------------------------- Look-only pieces ------------------------- */

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <CampusBackground />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
  count,
  countLabel,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.teacherSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      {count !== undefined && (
        <View style={styles.countPill}>
          <Text style={styles.countPillNumber}>{count}</Text>
          <Text style={styles.countPillLabel}>{countLabel}</Text>
        </View>
      )}
    </View>
  );
}

function EmptyState({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.stateBox}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={CAMPUS.accent} />
      </View>
      <Text style={styles.subtitle}>{text}</Text>
    </View>
  );
}

function shortId(id: string) {
  return id ? `…${id.slice(-8)}` : 'unknown';
}

function formatDate(iso: string | null) {
  if (!iso) {
    return 'No date set';
  }

  return new Date(iso).toLocaleString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS.bg,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: CAMPUS.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: CAMPUS.accent,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: CAMPUS.text,
  },
  subtitle: {
    fontSize: 14,
    color: CAMPUS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 16,
  },
  teacherSubtitle: {
    fontSize: 14,
    color: CAMPUS.textMuted,
    marginTop: 4,
  },
  countPill: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: CAMPUS.surface,
    borderWidth: 1,
    borderColor: CAMPUS.border,
  },
  countPillNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: CAMPUS.text,
  },
  countPillLabel: {
    fontFamily: CAMPUS.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: CAMPUS.textMuted,
    textTransform: 'uppercase',
  },

  /* Loading / empty */
  stateBox: {
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 12,
  },
  stateText: {
    fontSize: 14,
    color: CAMPUS.textMuted,
    marginTop: 14,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(239,197,171,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,197,171,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Cards */
  list: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: CAMPUS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CAMPUS.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  checkTile: {
    width: 46,
    height: 46,
    borderRadius: 24,
    backgroundColor: 'rgba(87,227,162,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(87,227,162,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
    paddingRight: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: CAMPUS.text,
    marginBottom: 8,
  },
  codeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(121,90,245,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(121,90,245,0.35)',
    marginBottom: 8,
  },
  codeText: {
    fontFamily: CAMPUS.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    color: '#D7ECA7',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventMeta: {
    fontSize: 13,
    color: CAMPUS.textMuted,
  },

  /* Teacher count badge */
  countBadge: {
    backgroundColor: 'rgba(239,197,171,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,197,171,0.4)',
    borderRadius: 22,
    minWidth: 68,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  countNumber: {
    color: CAMPUS.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  countLabel: {
    color: CAMPUS.accent,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  divider: {
    height: 1,
    backgroundColor: CAMPUS.border,
    marginVertical: 14,
  },
  attendeesTitle: {
    fontFamily: CAMPUS.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: CAMPUS.textMuted,
    marginBottom: 6,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 22,
    backgroundColor: 'rgba(239,197,171,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentId: {
    flex: 1,
    fontFamily: CAMPUS.mono,
    fontSize: 13,
    fontWeight: '600',
    color: CAMPUS.text,
  },
  attendeeTime: {
    fontSize: 12,
    color: CAMPUS.textMuted,
  },
  noAttendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  noAttendees: {
    flex: 1,
    fontSize: 13,
    color: CAMPUS.textFaint,
    fontStyle: 'italic',
  },
});
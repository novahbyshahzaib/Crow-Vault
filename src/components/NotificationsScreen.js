import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { formatCurrency, formatDate, computeAttendanceStats, calculateAttendancePercent } from '../utils/helpers';

export default function NotificationsScreen({ notifications, markNotifRead, clearAll }) {
  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptyDesc}>
          You'll be notified here when a student's course is completed.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {notifications.map(notif => (
          <NotifCard key={notif.id} notif={notif} onRead={() => markNotifRead(notif.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

function NotifCard({ notif, onRead }) {
  const student = notif.studentSnapshot;
  const isRead = notif.read;

  const stats = student?.attendance && typeof student.attendance === 'object'
    ? computeAttendanceStats(student.attendance)
    : { totalDays: student?.totalDays || 0, attendedDays: student?.attendedDays || 0 };

  const pct = calculateAttendancePercent(stats.attendedDays, stats.totalDays);
  const feeStatus = student?.feeStatus || 'pending';
  const feeStatusColor = feeStatus === 'paid' ? '#10b981' : feeStatus === 'free' ? '#6366f1' : '#f59e0b';

  const notifDate = notif.date ? new Date(notif.date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '';

  return (
    <TouchableOpacity
      style={[styles.card, !isRead && styles.cardUnread]}
      onPress={onRead}
      activeOpacity={0.8}
    >
      {!isRead && <View style={styles.unreadDot} />}

      {/* Notification header */}
      <View style={styles.notifHeader}>
        <Text style={styles.notifIcon}>🎓</Text>
        <View style={styles.notifMeta}>
          <Text style={styles.notifTitle}>Course Completed</Text>
          <Text style={styles.notifDate}>{notifDate}</Text>
        </View>
      </View>

      <Text style={styles.notifMessage}>{notif.message}</Text>

      {/* Student details card */}
      {student && (
        <View style={styles.studentCard}>
          <View style={styles.studentHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{student.name?.charAt(0)?.toUpperCase()}</Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentGrade}>{student.grade || 'No Grade'}</Text>
            </View>
            <View style={[styles.feeStatusPill, { backgroundColor: feeStatusColor + '22', borderColor: feeStatusColor }]}>
              <Text style={[styles.feeStatusText, { color: feeStatusColor }]}>{feeStatus}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <DetailItem label="Phone" value={student.phone || 'N/A'} />
            <DetailItem label="Grade" value={student.grade || 'N/A'} />
            <DetailItem label="Join Date" value={formatDate(student.joinDate)} />
            <DetailItem label="Course" value={`${student.coursePeriod || 1} Month${(student.coursePeriod || 1) > 1 ? 's' : ''}`} />
            <DetailItem label="Fee" value={formatCurrency(student.feeAmount)} />
            <DetailItem label="Attendance" value={`${pct}% (${stats.attendedDays}/${stats.totalDays}d)`} />
          </View>

          {student.notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{student.notes}</Text>
            </View>
          ) : null}
        </View>
      )}

      {!isRead && (
        <Text style={styles.tapToRead}>Tap to mark as read</Text>
      )}
    </TouchableOpacity>
  );
}

function DetailItem({ label, value }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  emptyContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  emptyDesc: { color: '#64748b', textAlign: 'center', fontSize: 14, lineHeight: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  clearBtn: { backgroundColor: '#1e293b', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  clearBtnText: { color: '#ef4444', fontSize: 13, fontWeight: 'bold' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#0f172a', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', padding: 16, marginBottom: 16, overflow: 'hidden' },
  cardUnread: { borderColor: '#3b82f6', backgroundColor: '#0f172a' },
  unreadDot: { position: 'absolute', top: 14, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  notifIcon: { fontSize: 24, marginRight: 10 },
  notifMeta: { flex: 1 },
  notifTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  notifDate: { color: '#64748b', fontSize: 11, marginTop: 2 },
  notifMessage: { color: '#94a3b8', fontSize: 13, marginBottom: 14, lineHeight: 18 },
  studentCard: { backgroundColor: '#1e293b', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#334155' },
  studentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  studentInfo: { flex: 1 },
  studentName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  studentGrade: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  feeStatusPill: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  feeStatusText: { fontSize: 11, fontWeight: 'bold', textTransform: 'capitalize' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  detailItem: { width: '50%', marginBottom: 10, paddingRight: 8 },
  detailLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  detailValue: { color: '#e2e8f0', fontSize: 13, fontWeight: '500' },
  notesBox: { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 8, marginTop: 4 },
  notesLabel: { color: '#64748b', fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  notesText: { color: '#cbd5e1', fontSize: 13, lineHeight: 18 },
  tapToRead: { textAlign: 'center', color: '#3b82f6', fontSize: 11, marginTop: 10, fontStyle: 'italic' },
});

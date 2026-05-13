import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  formatCurrency, calculateAverageAttendance,
  getDaysUntilEnd, isCourseComplete, formatDate, computeAttendanceStats, calculateAttendancePercent
} from '../utils/helpers';

export default function Dashboard({ students, setActiveTab, notifications }) {
  const totalStudents = students.length;
  const avgAttendance = calculateAverageAttendance(students);

  // Total revenue from all non-free students
  const totalRevenue = students
    .filter(s => s.feeStatus !== 'free')
    .reduce((sum, s) => sum + Number(s.feeAmount || 0), 0);

  // Fee status breakdown
  const paid = students.filter(s => (s.feeStatus || 'pending') === 'paid').length;
  const pending = students.filter(s => (s.feeStatus || 'pending') === 'pending').length;
  const free = students.filter(s => (s.feeStatus || 'pending') === 'free').length;

  // Courses expiring within 7 days (not yet complete)
  const expiringSoon = students.filter(s => {
    const d = getDaysUntilEnd(s);
    return d !== null && d >= 0 && d <= 7 && !isCourseComplete(s);
  });

  // Completed courses
  const completedCourses = students.filter(s => isCourseComplete(s));

  const unreadNotifs = notifications ? notifications.filter(n => !n.read).length : 0;
  const recentStudents = [...students].reverse().slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.pageTitle}>Overview</Text>
          <Text style={styles.pageSub}>Welcome back to Crow Vault.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setActiveTab('students')}>
          <Text style={styles.addBtnText}>+ Add Student</Text>
        </TouchableOpacity>
      </View>

      {/* Notification banner */}
      {unreadNotifs > 0 && (
        <TouchableOpacity style={styles.notifBanner} onPress={() => setActiveTab('notifications')}>
          <Text style={styles.notifBannerIcon}>🔔</Text>
          <Text style={styles.notifBannerText}>
            {unreadNotifs} unread notification{unreadNotifs > 1 ? 's' : ''} — tap to view
          </Text>
        </TouchableOpacity>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard title="Total Students" value={totalStudents} icon="👥" />
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon="💰" />
        <StatCard title="Avg Attendance" value={`${avgAttendance}%`} icon="✅" />
        <StatCard title="Completed" value={completedCourses.length} icon="🎓" />
      </View>

      {/* Fee Status Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fee Status</Text>
        <View style={styles.feeStatusRow}>
          <FeeStatusCard label="Paid" count={paid} color="#10b981" icon="✅" />
          <FeeStatusCard label="Pending" count={pending} color="#f59e0b" icon="⏳" />
          <FeeStatusCard label="Free" count={free} color="#6366f1" icon="🎁" />
        </View>
      </View>

      {/* Expiring Soon — Extra Feature */}
      {expiringSoon.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>⚠️ Expiring Soon</Text>
          {expiringSoon.map(s => {
            const daysLeft = getDaysUntilEnd(s);
            return (
              <TouchableOpacity
                key={s.id}
                style={styles.expiringCard}
                onPress={() => setActiveTab('students')}
              >
                <View style={styles.expiringAvatar}>
                  <Text style={styles.expiringAvatarText}>{s.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.expiringInfo}>
                  <Text style={styles.expiringName}>{s.name}</Text>
                  <Text style={styles.expiringDetail}>{s.coursePeriod}mo course · {formatDate(s.joinDate)}</Text>
                </View>
                <View style={styles.expiringDays}>
                  <Text style={styles.expiringDaysNum}>{daysLeft}</Text>
                  <Text style={styles.expiringDaysLabel}>days left</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Recently Added */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Added</Text>
        {recentStudents.length === 0 ? (
          <Text style={styles.emptyText}>No students added yet.</Text>
        ) : (
          recentStudents.map(s => {
            const hasNewAttendance = s.attendance && typeof s.attendance === 'object';
            const stats = hasNewAttendance
              ? computeAttendanceStats(s.attendance)
              : { totalDays: s.totalDays || 0, attendedDays: s.attendedDays || 0 };
            const pct = calculateAttendancePercent(stats.attendedDays, stats.totalDays);
            const feeStatus = s.feeStatus || 'pending';
            const statusColor = feeStatus === 'paid' ? '#10b981' : feeStatus === 'free' ? '#6366f1' : '#f59e0b';

            return (
              <View key={s.id} style={styles.recentCard}>
                <View>
                  <Text style={styles.recentName}>{s.name}</Text>
                  <Text style={styles.recentGrade}>{s.grade || 'No Grade'} · {s.coursePeriod || 1}mo</Text>
                </View>
                <View style={styles.recentRight}>
                  <Text style={styles.recentFee}>{formatCurrency(s.feeAmount)}</Text>
                  <Text style={[styles.recentStatus, { color: statusColor }]}>{feeStatus} · {pct}% att</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function FeeStatusCard({ label, count, color, icon }) {
  return (
    <View style={[styles.feeCard, { borderColor: color + '55' }]}>
      <Text style={styles.feeCardIcon}>{icon}</Text>
      <Text style={[styles.feeCardCount, { color }]}>{count}</Text>
      <Text style={styles.feeCardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 40 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  pageSub: { color: '#64748b', fontSize: 13, marginTop: 2 },
  addBtn: { backgroundColor: '#3b82f6', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  notifBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e3a5f', borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#3b82f6' },
  notifBannerIcon: { fontSize: 18, marginRight: 10 },
  notifBannerText: { color: '#93c5fd', fontSize: 13, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { width: '48%', backgroundColor: '#0f172a', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', marginBottom: 12 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  statTitle: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  statIcon: { fontSize: 16 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  section: { backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  // Fee status
  feeStatusRow: { flexDirection: 'row', padding: 12, justifyContent: 'space-between' },
  feeCard: { flex: 1, marginHorizontal: 4, backgroundColor: '#1e293b', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1 },
  feeCardIcon: { fontSize: 20, marginBottom: 4 },
  feeCardCount: { fontSize: 22, fontWeight: 'bold' },
  feeCardLabel: { color: '#94a3b8', fontSize: 11, marginTop: 2, fontWeight: '600' },
  // Expiring soon
  expiringCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  expiringAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  expiringAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  expiringInfo: { flex: 1 },
  expiringName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  expiringDetail: { color: '#64748b', fontSize: 12, marginTop: 2 },
  expiringDays: { alignItems: 'center', backgroundColor: '#451a03', borderRadius: 8, padding: 8, minWidth: 52 },
  expiringDaysNum: { color: '#f59e0b', fontSize: 18, fontWeight: 'bold' },
  expiringDaysLabel: { color: '#92400e', fontSize: 9, fontWeight: '600' },
  // Recent
  emptyText: { color: '#64748b', padding: 24, textAlign: 'center' },
  recentCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  recentName: { color: '#e2e8f0', fontWeight: 'bold', fontSize: 15 },
  recentGrade: { color: '#64748b', fontSize: 12, marginTop: 2 },
  recentRight: { alignItems: 'flex-end' },
  recentFee: { color: '#34d399', fontWeight: 'bold', fontSize: 14 },
  recentStatus: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
});

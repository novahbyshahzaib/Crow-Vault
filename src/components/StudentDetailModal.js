import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { formatCurrency, computeAttendanceStats, calculateAttendancePercent, calculateEndDate, getDaysUntilEnd, isCourseComplete, formatDate } from '../utils/helpers';
import AttendanceCalendar from './AttendanceCalendar';

const FEE_STATUSES = [
  { value: 'paid', label: 'Paid', color: '#10b981' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'free', label: 'Free', color: '#6366f1' },
];

export default function StudentDetailModal({ visible, student, onClose, onUpdate }) {
  const [tab, setTab] = useState('info');

  if (!student) return null;

  // Attendance: new model (object) or old model (numbers)
  const attendance = student.attendance || {};
  const hasCalendarAttendance = student.attendance && typeof student.attendance === 'object';
  const stats = hasCalendarAttendance
    ? computeAttendanceStats(attendance)
    : { totalDays: student.totalDays || 0, attendedDays: student.attendedDays || 0 };

  const attendancePct = calculateAttendancePercent(stats.attendedDays, stats.totalDays);
  const barColor = attendancePct >= 75 ? '#10b981' : attendancePct >= 50 ? '#f59e0b' : '#ef4444';

  const endDate = calculateEndDate(student.joinDate, student.coursePeriod);
  const daysLeft = getDaysUntilEnd(student);
  const courseComplete = isCourseComplete(student);
  const feeStatus = FEE_STATUSES.find(s => s.value === (student.feeStatus || 'pending'));

  const handleUpdateAttendance = (newAttendance) => {
    onUpdate({ ...student, attendance: newAttendance });
  };

  const handleFeeStatusChange = (newStatus) => {
    onUpdate({ ...student, feeStatus: newStatus });
  };

  const confirmDelete = () => {
    Alert.alert('Warning', `Change fee status for ${student.name}?`, [
      { text: 'Paid', onPress: () => handleFeeStatusChange('paid') },
      { text: 'Pending', onPress: () => handleFeeStatusChange('pending') },
      { text: 'Free', onPress: () => handleFeeStatusChange('free') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Avatar Header */}
          <View style={styles.headerBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.grade}>{student.grade || 'No Grade'}</Text>

            {/* Fee Status Badge */}
            <TouchableOpacity
              style={[styles.feeStatusBadge, { backgroundColor: (feeStatus?.color || '#f59e0b') + '25', borderColor: feeStatus?.color || '#f59e0b' }]}
              onPress={confirmDelete}
            >
              <Text style={[styles.feeStatusBadgeText, { color: feeStatus?.color || '#f59e0b' }]}>
                {feeStatus?.label || 'Pending'} · Tap to change
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {['info', 'attendance', 'course'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {tab === 'info' && (
              <View>
                <View style={styles.infoGrid}>
                  <InfoBox label="Fee Amount" value={formatCurrency(student.feeAmount)} />
                  <InfoBox label="Join Date" value={formatDate(student.joinDate)} />
                </View>
                <View style={styles.infoGrid}>
                  <InfoBox label="Course" value={`${student.coursePeriod || 1} Month${(student.coursePeriod || 1) > 1 ? 's' : ''}`} />
                  <InfoBox
                    label="Status"
                    value={courseComplete ? '✅ Completed' : `${daysLeft ?? '?'} days left`}
                    valueColor={courseComplete ? '#10b981' : daysLeft !== null && daysLeft <= 7 ? '#f59e0b' : '#fff'}
                  />
                </View>
                <View style={styles.contactBox}>
                  <Text style={styles.contactLine}>📞 {student.phone || 'N/A'}</Text>
                  <Text style={styles.contactLine}>✉️ {student.email || 'N/A'}</Text>
                </View>
                {/* Attendance summary */}
                <View style={styles.attBox}>
                  <View style={styles.attHeader}>
                    <Text style={styles.attLabel}>Attendance</Text>
                    <Text style={styles.attPct}>{attendancePct}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${attendancePct}%`, backgroundColor: barColor }]} />
                  </View>
                  <Text style={styles.attDays}>{stats.attendedDays} / {stats.totalDays} days</Text>
                </View>
                {student.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.infoLabel}>Notes</Text>
                    <Text style={styles.notesText}>{student.notes}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {tab === 'attendance' && (
              <View>
                {hasCalendarAttendance ? (
                  <AttendanceCalendar
                    attendance={attendance}
                    joinDate={student.joinDate || new Date().toISOString().split('T')[0]}
                    onUpdateAttendance={handleUpdateAttendance}
                  />
                ) : (
                  <View style={styles.legacyAtt}>
                    <Text style={styles.legacyTitle}>⚠️ Legacy Attendance Data</Text>
                    <Text style={styles.legacyText}>
                      This student was added before the calendar system.
                      Attendance: {stats.attendedDays} / {stats.totalDays} days ({attendancePct}%)
                    </Text>
                    <Text style={styles.legacyHint}>Edit the student to migrate to the new calendar system.</Text>
                  </View>
                )}
              </View>
            )}

            {tab === 'course' && (
              <View>
                <View style={[styles.courseCard, courseComplete && styles.courseCardComplete]}>
                  <Text style={styles.courseCardIcon}>{courseComplete ? '🎓' : '📚'}</Text>
                  <Text style={styles.courseCardTitle}>
                    {courseComplete ? 'Course Completed!' : 'Course Active'}
                  </Text>
                  {!courseComplete && daysLeft !== null && (
                    <Text style={[styles.courseCardDays, daysLeft <= 7 && { color: '#f59e0b' }]}>
                      {daysLeft} days remaining
                    </Text>
                  )}
                </View>
                <View style={styles.infoGrid}>
                  <InfoBox label="Started" value={formatDate(student.joinDate)} />
                  <InfoBox label="Ends" value={endDate ? formatDate(endDate.toISOString().split('T')[0]) : 'N/A'} />
                </View>
                <InfoBox label="Duration" value={`${student.coursePeriod || 1} Month${(student.coursePeriod || 1) > 1 ? 's' : ''}`} />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoBox({ label, value, valueColor = '#fff' }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#0f172a', borderRadius: 20, maxHeight: '88%', borderWidth: 1, borderColor: '#1e293b' },
  closeBtn: { position: 'absolute', top: 14, right: 14, zIndex: 10, width: 30, height: 30, backgroundColor: '#1e293b', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#fff', fontWeight: 'bold' },
  headerBox: { alignItems: 'center', padding: 20, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  grade: { color: '#94a3b8', fontSize: 13, marginTop: 2, marginBottom: 8 },
  feeStatusBadge: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4 },
  feeStatusBadgeText: { fontSize: 12, fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  tabBtn: { flex: 1, padding: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
  tabText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#3b82f6' },
  content: { padding: 16 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  infoBox: { flex: 1, backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginHorizontal: 4 },
  infoLabel: { color: '#64748b', fontSize: 10, textTransform: 'uppercase', marginBottom: 4, fontWeight: '600' },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  contactBox: { backgroundColor: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 12 },
  contactLine: { color: '#cbd5e1', fontSize: 14, marginBottom: 6 },
  attBox: { backgroundColor: '#020617', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#1e293b', marginBottom: 12 },
  attHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  attLabel: { color: '#fff', fontWeight: 'bold' },
  attPct: { color: '#3b82f6', fontWeight: 'bold', fontSize: 16 },
  barBg: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginBottom: 6 },
  barFill: { height: 6, borderRadius: 3 },
  attDays: { color: '#64748b', fontSize: 11, textAlign: 'right' },
  notesBox: { backgroundColor: '#1e293b', padding: 14, borderRadius: 8, marginBottom: 12 },
  notesText: { color: '#fff', fontSize: 14, marginTop: 6, lineHeight: 20 },
  legacyAtt: { backgroundColor: '#1e293b', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#f59e0b' },
  legacyTitle: { color: '#f59e0b', fontWeight: 'bold', marginBottom: 8 },
  legacyText: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },
  legacyHint: { color: '#64748b', fontSize: 12, marginTop: 8 },
  courseCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  courseCardComplete: { borderColor: '#10b981', backgroundColor: '#064e3b' },
  courseCardIcon: { fontSize: 36, marginBottom: 8 },
  courseCardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  courseCardDays: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
});

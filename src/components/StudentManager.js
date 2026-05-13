import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import StudentFormModal from './StudentFormModal';
import StudentDetailModal from './StudentDetailModal';
import { formatCurrency, computeAttendanceStats, calculateAttendancePercent, getDaysUntilEnd, isCourseComplete } from '../utils/helpers';

const FEE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: '✅ Paid' },
  { key: 'pending', label: '⏳ Pending' },
  { key: 'free', label: '🎁 Free' },
];

const STATUS_COLORS = { paid: '#10b981', pending: '#f59e0b', free: '#6366f1' };

export default function StudentManager({ students, onAdd, onUpdate, onDelete }) {
  const [search, setSearch] = useState('');
  const [feeFilter, setFeeFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
    const matchesFee = feeFilter === 'all' || (s.feeStatus || 'pending') === feeFilter;
    return matchesSearch && matchesFee;
  });

  const openAdd = () => { setEditingStudent(null); setIsFormOpen(true); };
  const openEdit = (student) => { setEditingStudent(student); setIsFormOpen(true); };

  const confirmDelete = (student) => {
    Alert.alert(
      'Delete Student',
      `Remove ${student.name} from the system? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(student.id) }
      ]
    );
  };

  // Count per status for filter badges
  const counts = students.reduce((acc, s) => {
    const st = s.feeStatus || 'pending';
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Students</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Fee status filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {FEE_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, feeFilter === f.key && styles.filterTabActive]}
            onPress={() => setFeeFilter(f.key)}
          >
            <Text style={[styles.filterTabText, feeFilter === f.key && styles.filterTabTextActive]}>
              {f.label}
              {f.key !== 'all' && counts[f.key] ? ` (${counts[f.key]})` : f.key === 'all' ? ` (${students.length})` : ' (0)'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No students found</Text>
            <Text style={styles.emptyDesc}>
              {students.length === 0
                ? 'Tap + Add to register your first student.'
                : 'Try a different search or filter.'}
            </Text>
          </View>
        ) : (
          filtered.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              onView={() => setViewingStudent(student)}
              onEdit={() => openEdit(student)}
              onDelete={() => confirmDelete(student)}
            />
          ))
        )}
      </ScrollView>

      <StudentFormModal
        visible={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={editingStudent ? onUpdate : onAdd}
        initialData={editingStudent}
      />

      {viewingStudent && (
        <StudentDetailModal
          visible={!!viewingStudent}
          student={students.find(s => s.id === viewingStudent.id) || viewingStudent}
          onClose={() => setViewingStudent(null)}
          onUpdate={(updated) => {
            onUpdate(updated);
            setViewingStudent(updated);
          }}
        />
      )}
    </View>
  );
}

function StudentCard({ student, onView, onEdit, onDelete }) {
  const hasNewAttendance = student.attendance && typeof student.attendance === 'object';
  const stats = hasNewAttendance
    ? computeAttendanceStats(student.attendance)
    : { totalDays: student.totalDays || 0, attendedDays: student.attendedDays || 0 };

  const pct = calculateAttendancePercent(stats.attendedDays, stats.totalDays);
  const barColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const feeStatus = student.feeStatus || 'pending';
  const statusColor = STATUS_COLORS[feeStatus] || '#f59e0b';
  const daysLeft = getDaysUntilEnd(student);
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
  const isComplete = isCourseComplete(student);

  return (
    <View style={[styles.card, isExpiringSoon && !isComplete && styles.cardWarning]}>
      <View style={styles.cardHeader}>
        <View style={styles.nameCol}>
          <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
          <Text style={styles.studentGrade}>{student.grade || 'No Grade'}</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.feeAmount}>{formatCurrency(student.feeAmount)}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>{feeStatus}</Text>
          </View>
        </View>
      </View>

      {/* Course info */}
      {student.coursePeriod && (
        <View style={styles.courseRow}>
          <Text style={styles.courseText}>
            {student.coursePeriod}mo course
          </Text>
          {isComplete ? (
            <Text style={styles.completedTag}>✅ Completed</Text>
          ) : isExpiringSoon ? (
            <Text style={styles.expiringTag}>⚠️ {daysLeft}d left</Text>
          ) : daysLeft !== null ? (
            <Text style={styles.courseText}>{daysLeft}d left</Text>
          ) : null}
        </View>
      )}

      {/* Attendance */}
      <View style={styles.attBox}>
        <View style={styles.attRow}>
          <Text style={styles.attLabel}>Attendance</Text>
          <Text style={styles.attPct}>{pct}%</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={styles.attDays}>{stats.attendedDays} / {stats.totalDays} days</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onView}>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Text style={[styles.actionText, { color: '#3b82f6' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
          <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: '#3b82f6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 10 },
  searchInput: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 12, color: '#fff' },
  filterScroll: { paddingHorizontal: 12, marginBottom: 10 },
  filterTab: { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  filterTabActive: { backgroundColor: '#1d4ed8', borderColor: '#3b82f6' },
  filterTabText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingTop: 4, paddingBottom: 40 },
  empty: { alignItems: 'center', padding: 40, backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyDesc: { color: '#64748b', textAlign: 'center', fontSize: 14 },
  card: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 14, marginBottom: 14 },
  cardWarning: { borderColor: '#f59e0b' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  nameCol: { flex: 1, marginRight: 10 },
  studentName: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  studentGrade: { color: '#64748b', fontSize: 12, marginTop: 2 },
  rightCol: { alignItems: 'flex-end' },
  feeAmount: { color: '#8b5cf6', fontSize: 15, fontWeight: 'bold' },
  statusPill: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  statusPillText: { fontSize: 11, fontWeight: 'bold', textTransform: 'capitalize' },
  courseRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  courseText: { color: '#64748b', fontSize: 12 },
  completedTag: { color: '#10b981', fontSize: 12, fontWeight: 'bold' },
  expiringTag: { color: '#f59e0b', fontSize: 12, fontWeight: 'bold' },
  attBox: { backgroundColor: '#1e293b', padding: 10, borderRadius: 8, marginBottom: 12 },
  attRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  attLabel: { color: '#94a3b8', fontSize: 12 },
  attPct: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold' },
  barBg: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginBottom: 6 },
  barFill: { height: 6, borderRadius: 3 },
  attDays: { color: '#64748b', fontSize: 10, textAlign: 'right' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 10, justifyContent: 'space-between' },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  actionText: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 13 },
});

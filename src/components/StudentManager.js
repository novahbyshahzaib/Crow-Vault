import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import StudentFormModal from './StudentFormModal';
import StudentDetailModal from './StudentDetailModal';
import { formatCurrency, calculateAttendancePercent } from '../utils/helpers';

export default function StudentManager({ students, onAdd, onUpdate, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.phone && student.phone.includes(searchTerm))
  );

  const openAddModal = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Student Directory</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name or phone..."
          placeholderTextColor="#64748b"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No students found</Text>
            <Text style={styles.emptyDesc}>Click the Add button to register your first student.</Text>
          </View>
        ) : (
          filteredStudents.map(student => (
            <StudentCard 
              key={student.id} 
              student={student} 
              onEdit={() => openEditModal(student)}
              onView={() => setViewingStudent(student)}
              onDelete={() => onDelete(student.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Modals */}
      <StudentFormModal 
        visible={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={editingStudent ? onUpdate : onAdd}
        initialData={editingStudent}
      />

      {viewingStudent && (
        <StudentDetailModal 
          visible={!!viewingStudent}
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
          onUpdate={onUpdate}
        />
      )}
    </View>
  );
}

function StudentCard({ student, onEdit, onView, onDelete }) {
  const attendancePct = calculateAttendancePercent(student.attendedDays, student.totalDays);
  const barColor = attendancePct >= 75 ? '#10b981' : attendancePct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameContainer}>
          <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
          <Text style={styles.studentGrade}>{student.grade || 'No Grade'}</Text>
        </View>
        <View style={styles.feeContainer}>
          <Text style={styles.feeAmount}>{formatCurrency(student.feeAmount)}</Text>
          <Text style={styles.feeType}>{student.feeType === 'monthly' ? 'PER MONTH' : 'PER YEAR'}</Text>
        </View>
      </View>

      <View style={styles.attendanceBox}>
        <View style={styles.attHeader}>
          <Text style={styles.attLabel}>Attendance</Text>
          <Text style={styles.attPercent}>{attendancePct}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${attendancePct}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={styles.attDays}>{student.attendedDays || 0} / {student.totalDays || 0} days</Text>
      </View>

      <View style={styles.cardActions}>
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
  addButton: { backgroundColor: '#3b82f6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  searchInput: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 12, color: '#fff' },
  listContainer: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40 },
  emptyState: { alignItems: 'center', padding: 40, backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyDesc: { color: '#64748b', textAlign: 'center' },
  card: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  nameContainer: { flex: 1, marginRight: 10 },
  studentName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  studentGrade: { color: '#64748b', fontSize: 12, marginTop: 2 },
  feeContainer: { alignItems: 'flex-end' },
  feeAmount: { color: '#8b5cf6', fontSize: 16, fontWeight: 'bold' },
  feeType: { color: '#64748b', fontSize: 10, marginTop: 2 },
  attendanceBox: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 16 },
  attHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  attLabel: { color: '#94a3b8', fontSize: 12 },
  attPercent: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginBottom: 6 },
  progressBarFill: { height: 6, borderRadius: 3 },
  attDays: { color: '#64748b', fontSize: 10, textAlign: 'right' },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, justifyContent: 'space-between' },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  actionText: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 13 }
});

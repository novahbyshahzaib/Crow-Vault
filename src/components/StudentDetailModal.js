import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { formatCurrency, calculateAttendancePercent } from '../utils/helpers';

export default function StudentDetailModal({ visible, student, onClose, onUpdate }) {
  const [attended, setAttended] = useState('');
  const [total, setTotal] = useState('');

  useEffect(() => {
    if (student) {
      setAttended(String(student.attendedDays));
      setTotal(String(student.totalDays));
    }
  }, [student]);

  if (!student) return null;

  const attendancePct = calculateAttendancePercent(attended, total);

  const handleUpdate = () => {
    onUpdate({
      ...student,
      attendedDays: Number(attended),
      totalDays: Number(total)
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{student.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.grade}>{student.grade || 'No Grade'}</Text>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Fee Amount</Text>
                <Text style={styles.infoValue}>{formatCurrency(student.feeAmount)}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Join Date</Text>
                <Text style={styles.infoValue}>{student.joinDate}</Text>
              </View>
            </View>

            <View style={styles.contactBox}>
              <Text style={styles.contactLine}>📞 {student.phone || 'N/A'}</Text>
              <Text style={styles.contactLine}>✉️ {student.email || 'N/A'}</Text>
            </View>

            <View style={styles.attManager}>
              <Text style={styles.attTitle}>Quick Update Attendance</Text>
              <Text style={styles.attPercent}>{attendancePct}%</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Attended</Text>
                  <TextInput style={styles.input} value={attended} onChangeText={setAttended} keyboardType="numeric" />
                </View>
                <Text style={styles.slash}>/</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Total</Text>
                  <TextInput style={styles.input} value={total} onChangeText={setTotal} keyboardType="numeric" />
                </View>
              </View>
              
              <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
                <Text style={styles.updateText}>Save Attendance</Text>
              </TouchableOpacity>
            </View>

            {student.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.notesText}>{student.notes}</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#0f172a', borderRadius: 20, maxHeight: '85%', borderWidth: 1, borderColor: '#1e293b' },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, width: 30, height: 30, backgroundColor: '#1e293b', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#fff', fontWeight: 'bold' },
  headerBox: { alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  grade: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  content: { padding: 20 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  infoBox: { flex: 1, backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginHorizontal: 4 },
  infoLabel: { color: '#64748b', fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  contactBox: { marginBottom: 20 },
  contactLine: { color: '#cbd5e1', fontSize: 14, marginBottom: 8 },
  attManager: { backgroundColor: '#020617', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', marginBottom: 20 },
  attTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 4 },
  attPercent: { color: '#3b82f6', fontSize: 24, fontWeight: 'bold', position: 'absolute', top: 16, right: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  inputWrapper: { flex: 1 },
  label: { color: '#64748b', fontSize: 10, marginBottom: 4 },
  input: { backgroundColor: '#0f172a', color: '#fff', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#334155', textAlign: 'center' },
  slash: { color: '#64748b', fontSize: 20, marginHorizontal: 10, marginTop: 10 },
  updateBtn: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginTop: 16, alignItems: 'center' },
  updateText: { color: '#fff', fontWeight: 'bold' },
  notesBox: { backgroundColor: '#1e293b', padding: 16, borderRadius: 8 },
  notesText: { color: '#fff', fontSize: 14, marginTop: 8, lineHeight: 20 }
});

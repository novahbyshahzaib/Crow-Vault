import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { generateId, generateInitialAttendance } from '../utils/helpers';

const COURSE_PERIODS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const FEE_STATUSES = [
  { value: 'paid', label: 'Paid', color: '#10b981' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'free', label: 'Free', color: '#6366f1' },
];

const defaultForm = () => ({
  name: '', phone: '', email: '', grade: '',
  feeAmount: '', feeStatus: 'pending',
  coursePeriod: 1, notes: '',
  joinDate: new Date().toISOString().split('T')[0],
});

export default function StudentFormModal({ visible, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(defaultForm());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(initialData ? {
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        grade: initialData.grade || '',
        feeAmount: String(initialData.feeAmount || ''),
        feeStatus: initialData.feeStatus || 'pending',
        coursePeriod: initialData.coursePeriod || 1,
        notes: initialData.notes || '',
        joinDate: initialData.joinDate || new Date().toISOString().split('T')[0],
      } : defaultForm());
    }
  }, [visible, initialData]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name is required');
    if (!form.feeAmount && form.feeStatus !== 'free') return Alert.alert('Error', 'Fee amount is required');

    const joinDate = form.joinDate || new Date().toISOString().split('T')[0];
    // Keep existing attendance if editing; generate fresh if new student
    const attendance = initialData?.attendance || generateInitialAttendance(joinDate);

    onSubmit({
      ...form,
      id: initialData?.id || generateId(),
      feeAmount: Number(form.feeAmount) || 0,
      coursePeriod: Number(form.coursePeriod) || 1,
      joinDate,
      attendance,
      completionNotified: initialData?.completionNotified || false,
    });
    onClose();
  };

  const pickerDate = form.joinDate
    ? new Date(form.joinDate + 'T00:00:00')
    : new Date();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{initialData ? 'Edit Student' : 'Add Student'}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input} value={form.name}
              onChangeText={v => set('name', v)}
              placeholder="John Doe" placeholderTextColor="#475569"
            />

            {/* Phone & Grade */}
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Class/Grade</Text>
                <TextInput style={styles.input} value={form.grade} onChangeText={v => set('grade', v)} />
              </View>
            </View>

            {/* Joining Date */}
            <Text style={styles.label}>Joining Date *</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateValue}>{form.joinDate || 'Select date'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(event, date) => {
                  if (Platform.OS === 'android') setShowDatePicker(false);
                  if (date) set('joinDate', date.toISOString().split('T')[0]);
                }}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <TouchableOpacity style={styles.doneBtn} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            )}

            {/* Course Period */}
            <Text style={styles.label}>Course Period</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodScroll}>
              {COURSE_PERIODS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodChip, form.coursePeriod === p && styles.periodChipActive]}
                  onPress={() => set('coursePeriod', p)}
                >
                  <Text style={[styles.periodChipText, form.coursePeriod === p && styles.periodChipTextActive]}>
                    {p === 12 ? '12M / 1Y' : `${p} Mo`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Fee Amount */}
            <Text style={styles.label}>Fee Amount (₹) {form.feeStatus !== 'free' ? '*' : ''}</Text>
            <TextInput
              style={styles.input}
              value={form.feeAmount}
              onChangeText={v => set('feeAmount', v)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#475569"
              editable={form.feeStatus !== 'free'}
            />

            {/* Fee Status */}
            <Text style={styles.label}>Fee Status</Text>
            <View style={styles.feeRow}>
              {FEE_STATUSES.map(s => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.feeChip,
                    form.feeStatus === s.value && { backgroundColor: s.color + '25', borderColor: s.color }
                  ]}
                  onPress={() => {
                    set('feeStatus', s.value);
                    if (s.value === 'free') set('feeAmount', '0');
                  }}
                >
                  <Text style={[styles.feeChipText, form.feeStatus === s.value && { color: s.color }]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.notes}
              onChangeText={v => set('notes', v)}
              multiline numberOfLines={3}
              placeholderTextColor="#475569"
              placeholder="Optional notes..."
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={styles.saveText}>Save Student</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { color: '#94a3b8', fontSize: 22, padding: 4 },
  body: { padding: 20 },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 6, marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#1e293b', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: '#334155', fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  // Date picker
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 8, borderWidth: 1, borderColor: '#334155', padding: 12, marginBottom: 14 },
  dateIcon: { fontSize: 18, marginRight: 10 },
  dateValue: { color: '#fff', fontSize: 15 },
  doneBtn: { backgroundColor: '#3b82f6', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 14 },
  doneBtnText: { color: '#fff', fontWeight: 'bold' },
  // Course period
  periodScroll: { marginBottom: 14 },
  periodChip: { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#334155' },
  periodChipActive: { backgroundColor: '#1d4ed8', borderColor: '#3b82f6' },
  periodChipText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  periodChipTextActive: { color: '#fff' },
  // Fee status
  feeRow: { flexDirection: 'row', marginBottom: 14 },
  feeChip: { flex: 1, marginRight: 8, backgroundColor: '#1e293b', borderRadius: 8, borderWidth: 1, borderColor: '#334155', padding: 10, alignItems: 'center' },
  feeChipText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 13 },
  textArea: { height: 80, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#1e293b', justifyContent: 'flex-end' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, marginRight: 10 },
  cancelText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 15 },
  saveBtn: { backgroundColor: '#3b82f6', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

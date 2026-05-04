import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { generateId } from '../utils/helpers';

export default function StudentFormModal({ visible, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (visible) {
      setFormData(initialData || {
        name: '', phone: '', email: '', grade: '', feeAmount: '', 
        feeType: 'monthly', totalDays: '30', attendedDays: '0', notes: ''
      });
    }
  }, [visible, initialData]);

  const handleChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = () => {
    if (!formData.name.trim()) return Alert.alert('Error', 'Name is required');
    if (!formData.feeAmount) return Alert.alert('Error', 'Fee amount is required');

    const submitData = {
      ...formData,
      id: initialData?.id || generateId(),
      feeAmount: Number(formData.feeAmount),
      totalDays: Number(formData.totalDays) || 0,
      attendedDays: Number(formData.attendedDays) || 0,
      joinDate: initialData?.joinDate || new Date().toISOString().split('T')[0]
    };

    onSubmit(submitData);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{initialData ? 'Edit Student' : 'Add Student'}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContent}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} value={formData.name} onChangeText={(v) => handleChange('name', v)} placeholder="John Doe" placeholderTextColor="#475569" />

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <Text style={styles.label}>Phone</Text>
                <TextInput style={styles.input} value={formData.phone} onChangeText={(v) => handleChange('phone', v)} keyboardType="phone-pad" />
              </View>
              <View style={styles.flexHalf}>
                <Text style={styles.label}>Class/Grade</Text>
                <TextInput style={styles.input} value={formData.grade} onChangeText={(v) => handleChange('grade', v)} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flexHalf}>
                <Text style={styles.label}>Fee Amount (₹) *</Text>
                <TextInput style={styles.input} value={String(formData.feeAmount)} onChangeText={(v) => handleChange('feeAmount', v)} keyboardType="numeric" />
              </View>
              <View style={styles.flexHalf}>
                <Text style={styles.label}>Fee Type</Text>
                <TouchableOpacity 
                  style={styles.toggleBtn} 
                  onPress={() => handleChange('feeType', formData.feeType === 'monthly' ? 'yearly' : 'monthly')}
                >
                  <Text style={styles.toggleBtnText}>{formData.feeType === 'monthly' ? 'Monthly' : 'Yearly'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.attendanceBox}>
              <View style={styles.row}>
                <View style={styles.flexHalf}>
                  <Text style={styles.label}>Total Days</Text>
                  <TextInput style={styles.input} value={String(formData.totalDays)} onChangeText={(v) => handleChange('totalDays', v)} keyboardType="numeric" />
                </View>
                <View style={styles.flexHalf}>
                  <Text style={styles.label}>Attended</Text>
                  <TextInput style={styles.input} value={String(formData.attendedDays)} onChangeText={(v) => handleChange('attendedDays', v)} keyboardType="numeric" />
                </View>
              </View>
            </View>

            <Text style={styles.label}>Notes</Text>
            <TextInput style={[styles.input, styles.textArea]} value={formData.notes} onChangeText={(v) => handleChange('notes', v)} multiline numberOfLines={3} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { color: '#94a3b8', fontSize: 20 },
  formContent: { padding: 20 },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: '#1e293b', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flexHalf: { width: '48%' },
  toggleBtn: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  toggleBtnText: { color: '#fff', textTransform: 'capitalize' },
  attendanceBox: { backgroundColor: '#020617', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#1e293b' },
  textArea: { height: 80, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#1e293b', justifyContent: 'flex-end' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, marginRight: 10 },
  cancelText: { color: '#94a3b8', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#3b82f6', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  saveText: { color: '#fff', fontWeight: 'bold' }
});

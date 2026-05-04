import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { 
  formatCurrency, 
  calculateTotalMonthlyRevenue, 
  calculateTotalYearlyRevenue, 
  calculateAverageAttendance,
  calculateAttendancePercent
} from '../utils/helpers';

export default function Dashboard({ students, setActiveTab }) {
  const totalStudents = students.length;
  const monthlyRev = calculateTotalMonthlyRevenue(students);
  const yearlyRev = calculateTotalYearlyRevenue(students);
  const avgAttendance = calculateAverageAttendance(students);
  
  const recentStudents = [...students].reverse().slice(0, 5);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Overview</Text>
          <Text style={styles.pageSub}>Welcome back to Crow Vault.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setActiveTab('students')}>
          <Text style={styles.addButtonText}>+ Add Student</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="Total Students" value={totalStudents} icon="👥" />
        <StatCard title="Monthly Rev" value={formatCurrency(monthlyRev)} icon="📅" />
        <StatCard title="Yearly Rev" value={formatCurrency(yearlyRev)} icon="📆" />
        <StatCard title="Avg Attendance" value={`${avgAttendance}%`} icon="✅" />
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recently Added</Text>
        {recentStudents.length === 0 ? (
          <Text style={styles.emptyText}>No students added yet.</Text>
        ) : (
          recentStudents.map(student => (
            <View key={student.id} style={styles.recentCard}>
              <View>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentGrade}>Grade: {student.grade || 'N/A'}</Text>
              </View>
              <View style={styles.rightAlign}>
                <Text style={styles.feeText}>
                  {formatCurrency(student.feeAmount)}
                  <Text style={styles.feeSub}>/{student.feeType === 'monthly' ? 'mo' : 'yr'}</Text>
                </Text>
                <Text style={styles.attendanceText}>
                  Att: {calculateAttendancePercent(student.attendedDays, student.totalDays)}%
                </Text>
              </View>
            </View>
          ))
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  pageSub: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statTitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  recentSection: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  emptyText: {
    color: '#64748b',
    padding: 24,
    textAlign: 'center',
  },
  recentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  studentName: {
    color: '#e2e8f0',
    fontWeight: 'bold',
    fontSize: 15,
  },
  studentGrade: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  rightAlign: {
    alignItems: 'flex-end',
  },
  feeText: {
    color: '#34d399',
    fontWeight: 'bold',
    fontSize: 14,
  },
  feeSub: {
    color: '#64748b',
    fontSize: 10,
  },
  attendanceText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  }
});

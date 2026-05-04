import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dashboard from './src/components/Dashboard';
import StudentManager from './src/components/StudentManager';

export default function App() {
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Load Data natively from Android Storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@crowVaultStudents');
        if (savedData !== null) {
          setStudents(JSON.parse(savedData));
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save Data natively
  useEffect(() => {
    const saveData = async () => {
      if (!isLoading) {
        try {
          await AsyncStorage.setItem('@crowVaultStudents', JSON.stringify(students));
        } catch (e) {
          console.error("Failed to save data", e);
        }
      }
    };
    saveData();
  }, [students, isLoading]);

  const handleAddStudent = (newStudent) => setStudents([...students, newStudent]);
  const handleUpdateStudent = (updated) => setStudents(students.map(s => s.id === updated.id ? updated : s));
  const handleDeleteStudent = (id) => setStudents(students.filter(s => s.id !== id));

  if (isLoading) {
    return (
      <View style={styles.centerElement}>
        <Text style={styles.loadingText}>Loading Crow Vault...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>CV</Text>
        </View>
        <Text style={styles.headerTitle}>Crow Vault</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {activeTab === 'dashboard' ? (
          <Dashboard students={students} setActiveTab={setActiveTab} />
        ) : (
          <StudentManager 
            students={students} 
            onAdd={handleAddStudent}
            onUpdate={handleUpdateStudent}
            onDelete={handleDeleteStudent}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'students' && styles.navItemActive]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.navText, activeTab === 'students' && styles.navTextActive]}>Students</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  centerElement: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  loadingText: {
    color: '#3b82f6',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  logoContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
    paddingBottom: 10,
  },
  navItem: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#3b82f6',
  },
  navText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  navTextActive: {
    color: '#3b82f6',
  }
});

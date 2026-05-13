import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Dashboard from './src/components/Dashboard';
import StudentManager from './src/components/StudentManager';
import NotificationsScreen from './src/components/NotificationsScreen';
import { isCourseComplete, generateId } from './src/utils/helpers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const notifListener = useRef();
  const responseListener = useRef();

  // Request notification permissions
  useEffect(() => {
    const setup = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      notifListener.current = Notifications.addNotificationReceivedListener(() => {});
      responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
        setActiveTab('notifications');
      });
    };
    setup();
    return () => {
      if (notifListener.current) Notifications.removeNotificationSubscription(notifListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Load persisted data
  useEffect(() => {
    const load = async () => {
      try {
        const [s, n] = await Promise.all([
          AsyncStorage.getItem('@crowVaultStudents'),
          AsyncStorage.getItem('@crowVaultNotifications'),
        ]);
        if (s) setStudents(JSON.parse(s));
        if (n) setNotifications(JSON.parse(n));
      } catch (e) {
        console.error('Load failed', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Persist students
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('@crowVaultStudents', JSON.stringify(students)).catch(console.error);
    }
  }, [students, isLoading]);

  // Persist notifications
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem('@crowVaultNotifications', JSON.stringify(notifications)).catch(console.error);
    }
  }, [notifications, isLoading]);

  // Check course completions and fire notifications
  useEffect(() => {
    if (isLoading) return;
    let needsUpdate = false;
    const updatedStudents = students.map(student => {
      if (isCourseComplete(student) && !student.completionNotified) {
        const notif = {
          id: `completion_${student.id}_${Date.now()}`,
          studentId: student.id,
          type: 'course_complete',
          message: `${student.name}'s ${student.coursePeriod || 1}-month course is complete!`,
          date: new Date().toISOString(),
          read: false,
          studentSnapshot: { ...student },
        };
        setNotifications(prev => {
          const alreadyExists = prev.some(n => n.studentId === student.id && n.type === 'course_complete');
          if (alreadyExists) return prev;
          return [notif, ...prev];
        });
        Notifications.scheduleNotificationAsync({
          content: {
            title: '🎓 Course Completed!',
            body: notif.message,
            data: { studentId: student.id },
          },
          trigger: null,
        }).catch(console.error);
        needsUpdate = true;
        return { ...student, completionNotified: true };
      }
      return student;
    });
    if (needsUpdate) setStudents(updatedStudents);
  }, [isLoading]); // Only run once on load

  const handleAddStudent = (s) => setStudents(prev => [...prev, s]);
  const handleUpdateStudent = (updated) => setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
  const handleDeleteStudent = (id) => setStudents(prev => prev.filter(s => s.id !== id));
  const markNotifRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading Crow Vault...</Text>
      </View>
    );
  }

  const TABS = [
    { key: 'dashboard', label: 'Home', icon: '🏠' },
    { key: 'students', label: 'Students', icon: '👥' },
    { key: 'notifications', label: `Alerts${unreadCount > 0 ? ` (${unreadCount})` : ''}`, icon: '🔔' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      <View style={styles.header}>
        <View style={styles.logo}><Text style={styles.logoText}>CV</Text></View>
        <Text style={styles.headerTitle}>Crow Vault</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.bell} onPress={() => setActiveTab('notifications')}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount}</Text></View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <Dashboard students={students} setActiveTab={setActiveTab} notifications={notifications} />
        )}
        {activeTab === 'students' && (
          <StudentManager
            students={students}
            onAdd={handleAddStudent}
            onUpdate={handleUpdateStudent}
            onDelete={handleDeleteStudent}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationsScreen
            notifications={notifications}
            markNotifRead={markNotifRead}
            clearAll={clearNotifications}
          />
        )}
      </View>

      <View style={styles.navBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.navItem, activeTab === tab.key && styles.navItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.navIcon}>{tab.icon}</Text>
            <Text style={[styles.navText, activeTab === tab.key && styles.navTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  loadingText: { color: '#3b82f6', fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b', backgroundColor: '#0f172a' },
  logo: { width: 32, height: 32, backgroundColor: '#3b82f6', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoText: { color: '#fff', fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1 },
  bell: { position: 'relative', padding: 4 },
  bellIcon: { fontSize: 22 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  content: { flex: 1 },
  navBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1e293b', backgroundColor: '#0f172a', paddingBottom: 8 },
  navItem: { flex: 1, padding: 10, alignItems: 'center' },
  navItemActive: { borderTopWidth: 2, borderTopColor: '#3b82f6' },
  navIcon: { fontSize: 18, marginBottom: 2 },
  navText: { color: '#64748b', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  navTextActive: { color: '#3b82f6' },
});

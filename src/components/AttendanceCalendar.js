import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function AttendanceCalendar({ attendance = {}, joinDate, onUpdateAttendance }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const join = new Date(joinDate + 'T00:00:00');
  join.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const startPadding = monthStart.getDay();

  const cells = [];
  for (let i = 0; i < startPadding; i++) cells.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) cells.push(new Date(year, month, d));

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const isEarliestMonth = year === join.getFullYear() && month === join.getMonth();

  const goBack = () => {
    if (!isEarliestMonth) setViewDate(new Date(year, month - 1, 1));
  };
  const goForward = () => {
    if (!isCurrentMonth) setViewDate(new Date(year, month + 1, 1));
  };

  const toggleDay = (date) => {
    if (!date) return;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d < join || d > today) return;
    const key = d.toISOString().split('T')[0];
    const current = attendance[key] || 'absent';
    onUpdateAttendance({ ...attendance, [key]: current === 'present' ? 'absent' : 'present' });
  };

  // Stats for current view month
  const monthKeys = Object.keys(attendance).filter(k => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const presentCount = monthKeys.filter(k => attendance[k] === 'present').length;
  const absentCount = monthKeys.filter(k => attendance[k] === 'absent').length;

  return (
    <View style={styles.container}>
      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={goBack}
          style={[styles.navBtn, isEarliestMonth && styles.navBtnDisabled]}
          disabled={isEarliestMonth}
        >
          <Text style={[styles.navArrow, isEarliestMonth && styles.navArrowDisabled]}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={goForward}
          style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]}
          disabled={isCurrentMonth}
        >
          <Text style={[styles.navArrow, isCurrentMonth && styles.navArrowDisabled]}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Month stats */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Text style={styles.statDot}>🟢</Text>
          <Text style={styles.statText}>{presentCount} Present</Text>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statDot}>🔴</Text>
          <Text style={styles.statText}>{absentCount} Absent</Text>
        </View>
      </View>

      {/* Day headers */}
      <View style={styles.headerRow}>
        {DAY_HEADERS.map(d => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((date, i) => {
          if (!date) {
            return <View key={`pad-${i}`} style={styles.dayCell} />;
          }
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);
          const key = d.toISOString().split('T')[0];
          const isInRange = d >= join && d <= today;
          const isToday = d.getTime() === today.getTime();
          const status = attendance[key];

          let bg = '#111827';
          let textColor = '#334155';
          if (isInRange) {
            bg = status === 'present' ? '#065f46' : '#7f1d1d';
            textColor = status === 'present' ? '#6ee7b7' : '#fca5a5';
          }

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.dayCell,
                { backgroundColor: bg },
                isToday && styles.todayBorder,
              ]}
              onPress={() => toggleDay(date)}
              disabled={!isInRange}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayNum, { color: textColor }, isToday && styles.todayNum]}>
                {d.getDate()}
              </Text>
              {isInRange && (
                <View style={[styles.dot, { backgroundColor: status === 'present' ? '#34d399' : '#f87171' }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.hint}>Tap a day to toggle Present / Absent</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0f172a', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#1e293b' },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { padding: 8 },
  navBtnDisabled: { opacity: 0.3 },
  navArrow: { color: '#3b82f6', fontSize: 18, fontWeight: 'bold' },
  navArrowDisabled: { color: '#334155' },
  monthTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10, gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statDot: { fontSize: 10, marginRight: 4 },
  statText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  headerRow: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: { flex: 1, textAlign: 'center', color: '#475569', fontSize: 11, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    padding: 2,
    marginBottom: 2,
  },
  todayBorder: { borderWidth: 2, borderColor: '#3b82f6' },
  dayNum: { fontSize: 12, fontWeight: '600' },
  todayNum: { fontWeight: 'bold' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  hint: { textAlign: 'center', color: '#334155', fontSize: 10, marginTop: 8 },
});

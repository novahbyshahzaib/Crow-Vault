export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

export const calculateAttendancePercent = (attendedDays, totalDays) => {
  if (!totalDays || totalDays === 0) return 0;
  const percent = (Number(attendedDays) / Number(totalDays)) * 100;
  return Math.min(Math.max(Math.round(percent), 0), 100);
};

// --- NEW: Attendance as per-day object ---

export const generateInitialAttendance = (joinDate) => {
  const attendance = {};
  const start = new Date(joinDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const current = new Date(start);
  while (current <= today) {
    attendance[current.toISOString().split('T')[0]] = 'present';
    current.setDate(current.getDate() + 1);
  }
  return attendance;
};

export const computeAttendanceStats = (attendance) => {
  if (!attendance || typeof attendance !== 'object') {
    return { totalDays: 0, attendedDays: 0 };
  }
  const entries = Object.values(attendance);
  return {
    totalDays: entries.length,
    attendedDays: entries.filter(v => v === 'present').length,
  };
};

// --- NEW: Course period / date helpers ---

export const addMonthsToDate = (dateStr, months) => {
  const date = new Date(dateStr + 'T00:00:00');
  date.setMonth(date.getMonth() + Number(months));
  return date;
};

export const calculateEndDate = (joinDate, coursePeriod) => {
  if (!joinDate) return null;
  return addMonthsToDate(joinDate, coursePeriod || 1);
};

export const isCourseComplete = (student) => {
  if (!student.joinDate || !student.coursePeriod) return false;
  const endDate = calculateEndDate(student.joinDate, student.coursePeriod);
  return new Date() >= endDate;
};

export const getDaysUntilEnd = (student) => {
  if (!student.joinDate || !student.coursePeriod) return null;
  const endDate = calculateEndDate(student.joinDate, student.coursePeriod);
  const diff = endDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- Revenue helpers (updated for new model) ---

export const calculateTotalRevenue = (students) => {
  return students
    .filter(s => s.feeStatus !== 'free')
    .reduce((sum, s) => sum + Number(s.feeAmount || 0), 0);
};

export const calculateTotalMonthlyRevenue = (students) => {
  // Legacy compat: students with feeType=monthly OR new model (all non-free)
  return students
    .filter(s => s.feeType === 'monthly' || (!s.feeType && s.feeStatus !== 'free'))
    .reduce((sum, s) => sum + Number(s.feeAmount || 0), 0);
};

export const calculateTotalYearlyRevenue = (students) => {
  return students
    .filter(s => s.feeType === 'yearly')
    .reduce((sum, s) => sum + Number(s.feeAmount || 0), 0);
};

export const calculateAverageAttendance = (students) => {
  if (students.length === 0) return 0;
  const total = students.reduce((sum, s) => {
    const stats = s.attendance
      ? computeAttendanceStats(s.attendance)
      : { totalDays: s.totalDays || 0, attendedDays: s.attendedDays || 0 };
    return sum + calculateAttendancePercent(stats.attendedDays, stats.totalDays);
  }, 0);
  return Math.round(total / students.length);
};

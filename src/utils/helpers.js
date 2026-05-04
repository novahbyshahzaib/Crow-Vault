export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const calculateAttendancePercent = (attendedDays, totalDays) => {
  if (!totalDays || totalDays === 0) return 0;
  const percent = (Number(attendedDays) / Number(totalDays)) * 100;
  return Math.min(Math.max(Math.round(percent), 0), 100); 
};

export const calculateTotalMonthlyRevenue = (students) => {
  return students
    .filter(s => s.feeType === 'monthly')
    .reduce((sum, student) => sum + Number(student.feeAmount || 0), 0);
};

export const calculateTotalYearlyRevenue = (students) => {
  return students
    .filter(s => s.feeType === 'yearly')
    .reduce((sum, student) => sum + Number(student.feeAmount || 0), 0);
};

export const calculateAverageAttendance = (students) => {
  if (students.length === 0) return 0;
  const totalPercent = students.reduce((sum, s) => {
    return sum + calculateAttendancePercent(s.attendedDays, s.totalDays);
  }, 0);
  return Math.round(totalPercent / students.length);
};

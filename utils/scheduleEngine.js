function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.round(Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10;
}

// ================================================
// FOH PATTERNS
// ================================================

function fohQuiet(employees) {
  // Lunes/Martes — 2 FOH split shift
  const shifts = [];
  if (employees[0]) shifts.push({
    employeeId: employees[0]._id, employeeName: employees[0].name,
    contractType: employees[0].contractType, role: 'FOH',
    startTime: '10:30', endTime: '14:00',
    hoursWorked: calcHours('10:30','14:00'),
    note: 'Back 15:30', isSplit: true,
    splitReturn: '15:30', splitEnd: '22:00',
    splitHours: calcHours('15:30','22:00'),
  });
  if (employees[1]) shifts.push({
    employeeId: employees[1]._id, employeeName: employees[1].name,
    contractType: employees[1].contractType, role: 'FOH',
    startTime: '11:00', endTime: '15:30',
    hoursWorked: calcHours('11:00','15:30'),
    note: 'Back 17:00', isSplit: true,
    splitReturn: '17:00', splitEnd: '22:00',
    splitHours: calcHours('17:00','22:00'),
  });
  return shifts;
}

function fohMedium(employees) {
  // Miércoles/Jueves — 3 FOH
  const ft = employees.filter(e => e.contractType !== 'part-time');
  const pt = employees.filter(e => e.contractType === 'part-time');
  const sorted = [...ft, ...pt];
  const shifts = [];

  if (sorted[0]) shifts.push({
    employeeId: sorted[0]._id, employeeName: sorted[0].name,
    contractType: sorted[0].contractType, role: 'FOH',
    startTime: '10:30', endTime: '14:00',
    hoursWorked: calcHours('10:30','14:00'),
    note: 'Back 17:00', isSplit: true,
    splitReturn: '17:00', splitEnd: '22:00',
    splitHours: calcHours('17:00','22:00'),
  });
  if (sorted[1]) shifts.push({
    employeeId: sorted[1]._id, employeeName: sorted[1].name,
    contractType: sorted[1].contractType, role: 'FOH',
    startTime: '11:00', endTime: '15:00',
    hoursWorked: calcHours('11:00','15:00'),
    note: 'Back 17:30', isSplit: true,
    splitReturn: '17:30', splitEnd: '22:00',
    splitHours: calcHours('17:30','22:00'),
  });
  if (sorted[2]) shifts.push({
    employeeId: sorted[2]._id, employeeName: sorted[2].name,
    contractType: sorted[2].contractType, role: 'FOH',
    startTime: '12:00', endTime: '14:30',
    hoursWorked: calcHours('12:00','14:30'),
    note: sorted[2].contractType === 'part-time' ? 'Lunch only (PT)' : 'Back 17:00',
    isSplit: sorted[2].contractType !== 'part-time',
    splitReturn: sorted[2].contractType !== 'part-time' ? '17:00' : null,
    splitEnd: sorted[2].contractType !== 'part-time' ? '22:00' : null,
    splitHours: sorted[2].contractType !== 'part-time' ? calcHours('17:00','22:00') : 0,
  });
  return shifts;
}

function fohBusy(employees) {
  // Viernes/Sábado — 3 FOH lunch + mismos 3 dinner
  const ft = employees.filter(e => e.contractType !== 'part-time');
  const pt = employees.filter(e => e.contractType === 'part-time');
  const sorted = [...ft, ...pt];
  const shifts = [];

  if (sorted[0]) shifts.push({
    employeeId: sorted[0]._id, employeeName: sorted[0].name,
    contractType: sorted[0].contractType, role: 'FOH',
    startTime: '10:30', endTime: '14:30',
    hoursWorked: calcHours('10:30','14:30'),
    note: 'Back dinner 17:00', isSplit: true,
    splitReturn: '17:00', splitEnd: '22:00',
    splitHours: calcHours('17:00','22:00'),
  });
  if (sorted[1]) shifts.push({
    employeeId: sorted[1]._id, employeeName: sorted[1].name,
    contractType: sorted[1].contractType, role: 'FOH',
    startTime: '11:00', endTime: '14:30',
    hoursWorked: calcHours('11:00','14:30'),
    note: 'Back dinner 17:30', isSplit: true,
    splitReturn: '17:30', splitEnd: '22:00',
    splitHours: calcHours('17:30','22:00'),
  });
  if (sorted[2]) shifts.push({
    employeeId: sorted[2]._id, employeeName: sorted[2].name,
    contractType: sorted[2].contractType, role: 'FOH',
    startTime: '11:30', endTime: '14:30',
    hoursWorked: calcHours('11:30','14:30'),
    note: sorted[2].contractType === 'part-time' ? 'Lunch only (PT)' : 'Back dinner 17:00',
    isSplit: sorted[2].contractType !== 'part-time',
    splitReturn: sorted[2].contractType !== 'part-time' ? '17:00' : null,
    splitEnd: sorted[2].contractType !== 'part-time' ? '22:00' : null,
    splitHours: sorted[2].contractType !== 'part-time' ? calcHours('17:00','22:00') : 0,
  });
  // Más de 3 FOH — dinner extra
  sorted.slice(3).forEach(emp => {
    shifts.push({
      employeeId: emp._id, employeeName: emp.name,
      contractType: emp.contractType, role: 'FOH',
      startTime: '17:00', endTime: '22:00',
      hoursWorked: calcHours('17:00','22:00'),
      note: 'Dinner only',
    });
  });
  return shifts;
}

// ================================================
// BOH PATTERNS
// Pin y Antonio Taiwan rotan semana a semana
// Betty — apoyo, split shift jueves+
// ================================================

function bohQuiet(employees) {
  // Lunes/Martes — 2 BOH (Pin o Antonio Taiwan)
  // Uno mañana, uno tarde
  const shifts = [];
  if (employees[0]) shifts.push({
    employeeId: employees[0]._id, employeeName: employees[0].name,
    contractType: employees[0].contractType, role: 'BOH',
    startTime: '09:00', endTime: '15:30',
    hoursWorked: calcHours('09:00','15:30'),
    note: 'Break 12:00–12:30',
  });
  if (employees[1]) shifts.push({
    employeeId: employees[1]._id, employeeName: employees[1].name,
    contractType: employees[1].contractType, role: 'BOH',
    startTime: '14:00', endTime: '22:00',
    hoursWorked: calcHours('14:00','22:00'),
    note: 'Break 17:30–18:00',
  });
  return shifts;
}

function bohMedium(employees) {
  // Miércoles/Jueves — 3 BOH: Pin + Antonio Taiwan + Betty (split)
  const betty = employees.find(e => e.contractType === 'part-time') || null;
  const chefs = employees.filter(e => !betty || e._id.toString() !== betty._id.toString());
  const shifts = [];

  // Chef 1 — mañana
  if (chefs[0]) shifts.push({
    employeeId: chefs[0]._id, employeeName: chefs[0].name,
    contractType: chefs[0].contractType, role: 'BOH',
    startTime: '08:30', endTime: '16:00',
    hoursWorked: calcHours('08:30','16:00'),
    note: 'Break 12:00–12:30',
  });

  // Chef 2 — mañana/tarde
  if (chefs[1]) shifts.push({
    employeeId: chefs[1]._id, employeeName: chefs[1].name,
    contractType: chefs[1].contractType, role: 'BOH',
    startTime: '09:00', endTime: '17:00',
    hoursWorked: calcHours('09:00','17:00'),
    note: 'Break 12:30–13:00',
  });

  // Betty — split shift
  if (betty) shifts.push({
    employeeId: betty._id, employeeName: betty.name,
    contractType: betty.contractType, role: 'BOH',
    startTime: '11:20', endTime: '14:30',
    hoursWorked: calcHours('11:20','14:30'),
    note: 'Back 17:30 — split shift',
    isSplit: true,
    splitReturn: '17:30', splitEnd: '22:00',
    splitHours: calcHours('17:30','22:00'),
  });

  return shifts;
}

function bohBusy(employees) {
  // Viernes/Sábado — mismo que medium pero chefs más temprano
  return bohMedium(employees);
}

// ================================================
// MAIN SUGGEST FUNCTION
// ================================================
function suggestFOH(employees, day) {
  const busyDays   = ['Friday','Saturday','Viernes','Sábado'];
  const mediumDays = ['Wednesday','Thursday','Miércoles','Jueves'];

  if (busyDays.includes(day))   return fohBusy(employees);
  if (mediumDays.includes(day)) return fohMedium(employees);
  return fohQuiet(employees); // Lunes, Martes
}

function suggestBOH(employees, day) {
  const quietDays = ['Monday','Tuesday','Lunes','Martes'];
  if (quietDays.includes(day)) return bohQuiet(employees);
  return bohMedium(employees); // Miércoles en adelante
}

// ================================================
// WEEKLY HOURS CALCULATOR
// ================================================
function calculateWeeklyHours(allDayShifts) {
  const byEmployee = {};

  allDayShifts.forEach(shift => {
    const id = shift.employeeId?.toString();
    if (!id) return;
    if (!byEmployee[id]) {
      byEmployee[id] = {
        employeeId: id,
        employeeName: shift.employeeName,
        contractType: shift.contractType,
        maxHours: shift.contractType === 'part-time' ? 20 : 40,
        totalHours: 0,
        days: [],
      };
    }
    let hours = shift.hoursWorked || calcHours(shift.startTime, shift.endTime);
    if (shift.isSplit && shift.splitReturn && shift.splitEnd) {
      hours += calcHours(shift.splitReturn, shift.splitEnd);
    }
    byEmployee[id].totalHours = Math.round((byEmployee[id].totalHours + hours) * 10) / 10;
    byEmployee[id].days.push({ day: shift.day, startTime: shift.startTime, endTime: shift.endTime, hoursWorked: hours });
  });

  return Object.values(byEmployee).map(emp => ({
    ...emp,
    overLimit:  emp.totalHours > emp.maxHours,
    nearLimit:  emp.totalHours >= emp.maxHours * 0.9 && emp.totalHours <= emp.maxHours,
    remainingHours: Math.max(0, emp.maxHours - emp.totalHours),
  }));
}

module.exports = { suggestFOH, suggestBOH, calculateWeeklyHours, calcHours };

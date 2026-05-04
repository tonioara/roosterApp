function timeToMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minsToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function calcHours(start, end) {
  if (!start || !end) return 0;
  const diff = timeToMins(end) - timeToMins(start);
  return Math.round((diff < 0 ? 0 : diff) / 60 * 10) / 10;
}

// -----------------------------------------------
// FOH PATTERNS
// -----------------------------------------------
function suggestFOH(employees) {
  const count = employees.length;
  if (count === 0) return [];

  const ft = employees.filter(e => e.contractType !== 'part-time');
  const pt = employees.filter(e => e.contractType === 'part-time');

  if (count === 1) {
    return [{
      employeeId: employees[0]._id,
      employeeName: employees[0].name,
      contractType: employees[0].contractType,
      startTime: '10:30', endTime: '22:00',
      hoursWorked: calcHours('10:30', '22:00'),
      note: 'Full day — take break as needed',
      role: 'FOH',
    }];
  }

  if (count === 2) {
    return [
      { employeeId: employees[0]._id, employeeName: employees[0].name, contractType: employees[0].contractType, startTime: '10:30', endTime: '17:00', hoursWorked: calcHours('10:30','17:00'), note: 'Break 13:30–15:00', role: 'FOH' },
      { employeeId: employees[1]._id, employeeName: employees[1].name, contractType: employees[1].contractType, startTime: '15:00', endTime: '22:00', hoursWorked: calcHours('15:00','22:00'), note: 'Break 18:30–20:00', role: 'FOH' },
    ];
  }

  if (count === 3) {
    return [
      { employeeId: employees[0]._id, employeeName: employees[0].name, contractType: employees[0].contractType, startTime: '10:30', endTime: '16:00', hoursWorked: calcHours('10:30','16:00'), note: 'Break 13:00–14:00', role: 'FOH' },
      { employeeId: employees[1]._id, employeeName: employees[1].name, contractType: employees[1].contractType, startTime: '13:00', endTime: '19:00', hoursWorked: calcHours('13:00','19:00'), note: 'Break 15:30–16:30', role: 'FOH' },
      { employeeId: employees[2]._id, employeeName: employees[2].name, contractType: employees[2].contractType, startTime: '16:00', endTime: '22:00', hoursWorked: calcHours('16:00','22:00'), note: 'Break 19:00–20:00', role: 'FOH' },
    ];
  }

  if (count >= 4) {
    const sorted = [...pt, ...ft];
    const shifts = [];

    if (sorted[0]) shifts.push({ employeeId: sorted[0]._id, employeeName: sorted[0].name, contractType: sorted[0].contractType, startTime: '10:30', endTime: '14:00', hoursWorked: calcHours('10:30','14:00'), note: sorted[0].contractType === 'part-time' ? 'Lunch only (PT)' : 'Back 17:00', role: 'FOH' });
    if (sorted[1]) shifts.push({ employeeId: sorted[1]._id, employeeName: sorted[1].name, contractType: sorted[1].contractType, startTime: '11:00', endTime: '15:00', hoursWorked: calcHours('11:00','15:00'), note: 'Back 17:30', role: 'FOH' });
    if (sorted[2]) shifts.push({ employeeId: sorted[2]._id, employeeName: sorted[2].name, contractType: sorted[2].contractType, startTime: '12:00', endTime: '14:30', hoursWorked: calcHours('12:00','14:30'), note: sorted[2].contractType === 'part-time' ? 'Lunch only (PT)' : 'Back 17:00', role: 'FOH' });
    if (sorted[3]) shifts.push({ employeeId: sorted[3]._id, employeeName: sorted[3].name, contractType: sorted[3].contractType, startTime: '14:00', endTime: '22:00', hoursWorked: calcHours('14:00','22:00'), note: 'Break 17:00–17:30', role: 'FOH' });
    sorted.slice(4).forEach(emp => {
      shifts.push({ employeeId: emp._id, employeeName: emp.name, contractType: emp.contractType, startTime: '17:00', endTime: '22:00', hoursWorked: calcHours('17:00','22:00'), note: 'Dinner shift', role: 'FOH' });
    });

    return shifts;
  }

  return [];
}

// -----------------------------------------------
// BOH PATTERNS
// 1-2 personas: patrón normal (lunes a miércoles)
// 3+ personas (jueves en adelante): Betty split + 2 chefs temprano
// -----------------------------------------------
function suggestBOH(employees, day) {
  const count = employees.length;
  if (count === 0) return [];

  // Días con 3 BOH — jueves, viernes, sábado
  const busyDays = ['Thursday', 'Friday', 'Saturday', 'Jueves', 'Viernes', 'Sábado'];
  const isBusy = busyDays.includes(day);

  if (count === 1) {
    return [{
      employeeId: employees[0]._id, employeeName: employees[0].name,
      contractType: employees[0].contractType,
      startTime: '09:00', endTime: '21:00',
      hoursWorked: calcHours('09:00','21:00'),
      note: 'Break 12:00–13:00', role: 'BOH',
    }];
  }

  if (count === 2) {
    return [
      { employeeId: employees[0]._id, employeeName: employees[0].name, contractType: employees[0].contractType, startTime: '09:00', endTime: '15:30', hoursWorked: calcHours('09:00','15:30'), note: 'Break 12:00–12:30', role: 'BOH' },
      { employeeId: employees[1]._id, employeeName: employees[1].name, contractType: employees[1].contractType, startTime: '14:00', endTime: '21:00', hoursWorked: calcHours('14:00','21:00'), note: 'Break 17:00–17:30', role: 'BOH' },
    ];
  }

  if (count >= 3) {
    // ✅ Patrón jueves en adelante con 3 BOH
    // Betty — split shift (lunch + dinner)
    // Chef 1 — entra temprano mañana
    // Chef 2 — entra temprano mañana (turno completo)
    const betty = employees.find(e => e.contractType === 'part-time') || employees[0];
    const chefs = employees.filter(e => e._id.toString() !== betty._id.toString());

    const shifts = [];

    // Betty — split shift
    shifts.push({
      employeeId: betty._id, employeeName: betty.name,
      contractType: betty.contractType,
      startTime: '11:20', endTime: '14:30',
      hoursWorked: calcHours('11:20','14:30'),
      note: 'Back 17:30 — split shift',
      role: 'BOH',
      isSplit: true,
      splitReturn: '17:30',
      splitEnd: '22:00',
      splitHours: calcHours('17:30','22:00'),
    });

    // Chef 1 — mañana completo
    if (chefs[0]) shifts.push({
      employeeId: chefs[0]._id, employeeName: chefs[0].name,
      contractType: chefs[0].contractType,
      startTime: '08:30', endTime: '16:00',
      hoursWorked: calcHours('08:30','16:00'),
      note: 'Break 12:00–12:30',
      role: 'BOH',
    });

    // Chef 2 — tarde
    if (chefs[1]) shifts.push({
      employeeId: chefs[1]._id, employeeName: chefs[1].name,
      contractType: chefs[1].contractType,
      startTime: '09:00', endTime: '17:00',
      hoursWorked: calcHours('09:00','17:00'),
      note: 'Break 12:30–13:00',
      role: 'BOH',
    });

    // Si hay más BOH
    chefs.slice(2).forEach(emp => {
      shifts.push({
        employeeId: emp._id, employeeName: emp.name,
        contractType: emp.contractType,
        startTime: '14:00', endTime: '21:00',
        hoursWorked: calcHours('14:00','21:00'),
        note: 'Afternoon shift',
        role: 'BOH',
      });
    });

    return shifts;
  }

  return [];
}

// -----------------------------------------------
// WEEKLY HOURS CALCULATOR
// -----------------------------------------------
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

    // Si tiene split shift, sumar también el turno de vuelta
    if (shift.isSplit && shift.splitReturn && shift.splitEnd) {
      hours += calcHours(shift.splitReturn, shift.splitEnd);
    }

    byEmployee[id].totalHours += hours;
    byEmployee[id].totalHours = Math.round(byEmployee[id].totalHours * 10) / 10;
    byEmployee[id].days.push({ day: shift.day, startTime: shift.startTime, endTime: shift.endTime, hoursWorked: hours });
  });

  return Object.values(byEmployee).map(emp => ({
    ...emp,
    overLimit: emp.totalHours > emp.maxHours,
    nearLimit: emp.totalHours >= emp.maxHours * 0.9 && emp.totalHours <= emp.maxHours,
    remainingHours: Math.max(0, emp.maxHours - emp.totalHours),
  }));
}

module.exports = { suggestFOH, suggestBOH, calculateWeeklyHours, calcHours, timeToMins, minsToTime };

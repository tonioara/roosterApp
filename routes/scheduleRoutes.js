const express = require('express');
const router = express.Router();
const { protect, restrictToAdmin } = require('../middleware/auth');
const User = require('../models/User');
const { suggestFOH, suggestBOH, calculateWeeklyHours } = require('../utils/scheduleEngine');

router.post('/suggest', protect, restrictToAdmin, async (req, res) => {
  try {
    const { weekId, dailyStaff } = req.body;
    const restaurantId = req.user.restaurantId;
    if (!weekId || !dailyStaff) {
      return res.status(400).json({ message: 'weekId and dailyStaff required.' });
    }

    const suggestions = {};
    const allShiftsFlat = [];

    for (const [day, employeeIds] of Object.entries(dailyStaff)) {
      if (!employeeIds || employeeIds.length === 0) continue;

      const employees = await User.find({
        _id: { $in: employeeIds },
        role: { $in: ['FOH', 'BOH'] },
        restaurantId,
      }).select('name role contractType maxWeeklyHours');

      const foh = employees.filter(e => e.role === 'FOH');
      const boh = employees.filter(e => e.role === 'BOH');

      const fohShifts = suggestFOH(foh, day);
      const bohShifts = suggestBOH(boh, day);

      suggestions[day] = { FOH: fohShifts, BOH: bohShifts };
      [...fohShifts, ...bohShifts].forEach(s => allShiftsFlat.push({ ...s, day }));
    }

    const weeklyHours = calculateWeeklyHours(allShiftsFlat);
    const warnings = weeklyHours.filter(e => e.overLimit);

    res.status(200).json({ weekId, suggestions, weeklyHours, warnings, hasWarnings: warnings.length > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/confirm', protect, restrictToAdmin, async (req, res) => {
  try {
    const { weekId, confirmedShifts } = req.body;
    const restaurantId = req.user.restaurantId;
    if (!weekId || !confirmedShifts) {
      return res.status(400).json({ message: 'weekId and confirmedShifts required.' });
    }

    const Roster = require('../models/Roster');
    const { calculateWeeklyHours } = require('../utils/scheduleEngine');

    const shifts = confirmedShifts.map(s => ({
      day: s.day, role: s.role, employee: s.employeeId,
      startTime: s.startTime, endTime: s.endTime,
      shiftType: s.startTime < '14:00' ? 'Mañana' : 'Tarde',
      hoursWorked: s.hoursWorked, notes: s.note || '',
    }));

    const splitShifts = confirmedShifts
      .filter(s => s.isSplit && s.splitReturn && s.splitEnd)
      .map(s => ({
        day: s.day, role: s.role, employee: s.employeeId,
        startTime: s.splitReturn, endTime: s.splitEnd,
        shiftType: 'Tarde', hoursWorked: s.splitHours || 0,
        notes: 'Split shift — second part',
      }));

    let roster = await Roster.findOne({ weekId, restaurantId });
    if (roster) {
      roster.shifts = [...shifts, ...splitShifts];
      await roster.save();
    } else {
      roster = new Roster({ weekId, restaurantId, shifts: [...shifts, ...splitShifts] });
      await roster.save();
    }

    const populated = await Roster.findById(roster._id)
      .populate('shifts.employee', 'name role contractType');

    const weeklyHours = calculateWeeklyHours(confirmedShifts.map(s => ({ ...s, employeeId: s.employeeId })));

    res.status(200).json({ message: 'Schedule confirmed.', roster: populated, weeklyHours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

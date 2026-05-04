const Roster = require('../models/Roster');
const User = require('../models/User');
const Request = require('../models/Request');

exports.createRoster = async (req, res) => {
  try {
    const { weekId, shifts } = req.body;
    if (!weekId || !shifts || shifts.length === 0) {
      return res.status(400).json({ message: 'Se requiere weekId y shifts.' });
    }
    let roster = await Roster.findOne({ weekId });
    if (roster) {
      roster.shifts = shifts;
      await roster.save();
      return res.status(200).json({ message: 'Roster actualizado', roster });
    }
    roster = new Roster({ weekId, shifts });
    await roster.save();
    res.status(201).json({ message: 'Roster creado', roster });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRosterByWeek = async (req, res) => {
  try {
    const { weekId } = req.params;
    const roster = await Roster.findOne({ weekId })
      .populate('shifts.employee', 'name role skills');
    if (!roster) {
      return res.status(404).json({ message: 'Roster no encontrado para esta semana.' });
    }
    res.status(200).json(roster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateAutomaticRoster = async (req, res) => {
  try {
    const { weekId } = req.body;
    if (!weekId) {
      return res.status(400).json({ message: 'Se requiere weekId.' });
    }

    const users = await User.find({ role: { $in: ['FOH', 'BOH'] } });
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No hay empleados registrados.' });
    }

    // ✅ Obtener solicitudes APROBADAS de día libre para esta semana
    const approvedRequests = await Request.find({
      weekReference: weekId,
      status: 'Approved',
      type: 'dayOff',
    }).populate('userId', 'name _id');

    // Mapa: empleadoId -> [dias libres aprobados]
    const approvedDaysOff = {};
    approvedRequests.forEach(req => {
      const empId = req.userId?._id?.toString();
      if (!empId) return;
      if (!approvedDaysOff[empId]) approvedDaysOff[empId] = [];
      approvedDaysOff[empId].push(req.requestedDayOff);
    });

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const shiftsToGenerate = [];

    users.forEach((user, index) => {
      const empId = user._id.toString();
      const role = user.role === 'BOH' ? 'BOH' : 'FOH';
      const approvedOff = approvedDaysOff[empId] || [];

      // Día libre rotativo solo si no tiene solicitud aprobada
      const rotativeDayOff = days[index % days.length];

      days.forEach(day => {
        // Si tiene ese día aprobado como libre → saltar
        if (approvedOff.includes(day)) return;

        // Si no tiene ningún día aprobado → aplicar rotativo
        if (approvedOff.length === 0 && day === rotativeDayOff) return;

        shiftsToGenerate.push({ day, role, employee: user._id, shiftType: 'Mañana' });
        shiftsToGenerate.push({ day, role, employee: user._id, shiftType: 'Tarde' });
      });
    });

    let existingRoster = await Roster.findOne({ weekId });
    if (existingRoster) {
      existingRoster.shifts = shiftsToGenerate;
      await existingRoster.save();
      const populated = await Roster.findById(existingRoster._id)
        .populate('shifts.employee', 'name role skills');
      return res.status(200).json({
        message: 'Roster actualizado con días libres aprobados.',
        roster: populated,
        daysOffApplied: approvedDaysOff,
      });
    }

    const newRoster = new Roster({ weekId, shifts: shiftsToGenerate });
    await newRoster.save();
    const populated = await Roster.findById(newRoster._id)
      .populate('shifts.employee', 'name role skills');

    res.status(201).json({
      message: 'Roster generado con días libres aprobados.',
      roster: populated,
      daysOffApplied: approvedDaysOff,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTestUsers = async (req, res) => {
  try {
    const testUsers = [
      { name: 'Antonio', role: 'FOH', skills: ['bar', 'coffee', 'service'] },
      { name: 'PJ',      role: 'FOH', skills: ['bar', 'service'] },
      { name: 'Crystal', role: 'FOH', skills: ['service', 'management'] },
      { name: 'Jane',    role: 'FOH', skills: ['service'] },
      { name: 'Pin',     role: 'BOH', skills: ['cocina'] },
      { name: 'Betty',   role: 'BOH', skills: ['parrilla'] },
      { name: 'Amber',   role: 'admin', skills: ['management'] },
    ];
    for (const u of testUsers) {
      await User.updateOne({ name: u.name }, { $set: u }, { upsert: true });
    }
    res.status(201).json({ message: 'Staff creado', count: testUsers.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Roster = require('../models/Roster');
const User = require('../models/User');

// Crear o actualizar el Roster de la semana
exports.createRoster = async (req, res) => {
  try {
    const { weekId, shifts } = req.body;

    if (!weekId || !shifts || shifts.length === 0) {
      return res.status(400).json({ message: 'Se requiere el weekId y las asignaciones de turnos.' });
    }

    // --- REGLA 1: Control de turnos dobles en el mismo día según el rol ---
    const shiftTimings = {
      'FOH': {
        'Mañana': { start: 10.5, end: 15.0 }, // 10:30 a 15:00
        'Tarde': { start: 17.0, end: 22.0 },  // 17:00 a 22:00
      },
      'BOH': {
        'Mañana': { start: 9.0, end: 15.5 },  // 09:00 a 15:30
        'Tarde': { start: 17.0, end: 21.0 },  // 17:00 a 21:00
      }
    };

    // Contamos los trabajadores por día y rol para determinar el break dinámico
    const dayAndRoleCounts = new Map();
    for (const shift of shifts) {
      const countKey = `${shift.day}-${shift.role}`;
      dayAndRoleCounts.set(countKey, (dayAndRoleCounts.get(countKey) || 0) + 1);
    }

    const dailyShifts = new Map();

    for (const shift of shifts) {
      const key = `${shift.employee}-${shift.day}`;

      if (dailyShifts.has(key)) {
        const previousShift = dailyShifts.get(key);
        
        const time1 = shiftTimings[shift.role]?.[previousShift.shiftType];
        const time2 = shiftTimings[shift.role]?.[shift.shiftType];

        if (time1 && time2) {
          let breakDuration = 0;
          
          if (time1.end < time2.start) {
            breakDuration = time2.start - time1.end;
          } else if (time2.end < time1.start) {
            breakDuration = time1.start - time2.end;
          }

          // Determinamos el break mínimo de forma dinámica
          const countKey = `${shift.day}-${shift.role}`;
          const totalWorkers = dayAndRoleCounts.get(countKey) || 0;
          const minBreak = totalWorkers <= 2 ? 1.5 : 2.0;

          if (breakDuration < minBreak) {
            return res.status(400).json({ 
              message: `Error: El empleado ${shift.employee} tiene un descanso de ${breakDuration} horas. Con ${totalWorkers} trabajador(es) en el turno, se requieren mínimo ${minBreak} horas.` 
            });
          }
        }
      } else {
        dailyShifts.set(key, shift);
      }
    }

    // --- REGLA 2: Control de horas máximas (máximo 40 horas por semana) ---
    const employeeHours = {};
    for (const shift of shifts) {
      if (!employeeHours[shift.employee]) {
        employeeHours[shift.employee] = 0;
      }
      employeeHours[shift.employee] += 8; // Cada turno equivale a 8 horas para el cálculo

      if (employeeHours[shift.employee] > 40) {
        return res.status(400).json({
          message: `Error: El empleado con ID ${shift.employee} supera el límite de 40 horas semanales.`
        });
      }
    }

    // Guardado o actualización en la base de datos
    let roster = await Roster.findOne({ weekId });

    if (roster) {
      roster.shifts = shifts;
      await roster.save();
      return res.status(200).json({ message: 'Roster actualizado con éxito', roster });
    }

    roster = new Roster({
      weekId,
      shifts
    });

    await roster.save();
    res.status(201).json({ message: 'Roster creado con éxito', roster });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener el Roster de una semana específica
exports.getRosterByWeek = async (req, res) => {
  try {
    const { weekId } = req.params;
    
    const roster = await Roster.findOne({ weekId }).populate('shifts.employee', 'name role skills');
    
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
      return res.status(400).json({ message: 'Se requiere el parámetro weekId.' });
    }

    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No hay empleados registrados en el sistema.' });
    }

    // Excluimos el Domingo de la lista de días laborables
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const shiftsToGenerate = [];

    // Asignamos un día libre secuencial a cada empleado de la semana
    users.forEach((user, index) => {
      const dayOffIndex = index % days.length;
      const dayOff = days[dayOffIndex];
      const role = user.role === 'BOH' ? 'BOH' : 'FOH';

      days.forEach(day => {
        if (day !== dayOff) {
          // Turno de Mañana
          shiftsToGenerate.push({
            day: day,
            role: role,
            employee: user._id, // Guardamos el ID para la base de datos
            shiftType: 'Mañana'
          });

          // Turno de Tarde
          shiftsToGenerate.push({
            day: day,
            role: role,
            employee: user._id,
            shiftType: 'Tarde'
          });
        }
      });
    });

    let existingRoster = await Roster.findOne({ weekId });

    if (existingRoster) {
      existingRoster.shifts = shiftsToGenerate;
      await existingRoster.save();
      
      // Poblamos los datos para mostrar los nombres del staff en la respuesta
      const populatedRoster = await Roster.findById(existingRoster._id)
        .populate('shifts.employee', 'name role');

      return res.status(200).json({ 
        message: 'Roster existente actualizado con éxito', 
        roster: populatedRoster 
      });
    }

    const newRoster = new Roster({
      weekId,
      shifts: shiftsToGenerate
    });

    await newRoster.save();

    // Poblamos el nuevo Roster
    const populatedNewRoster = await Roster.findById(newRoster._id)
      .populate('shifts.employee', 'name role');

    res.status(201).json({ 
      message: 'Roster generado automáticamente con éxito', 
      roster: populatedNewRoster 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.createTestUsers = async (req, res) => {
  try {
    const testUsers = [
      {
        _id: "69f555f794b41001231a4c15",
        name: "Antonio Araujo",
        email: "antonio@rooster.com",
        role: "FOH"
      },
      {
        _id: "69f555f794b41001231a4c16",
        name: "PJ",
        email: "pj@rooster.com",
        role: "FOH"
      },
      {
        _id: "69f555f794b41001231a4c17",
        name: "Crystal",
        email: "crystal@rooster.com",
        role: "BOH"
      },
      {
        _id: "69f555f794b41001231a4c18",
        name: "Jane",
        email: "jane@rooster.com",
        role: "FOH"
      },
      {
        _id: "69f555f794b41001231a4c19",
        name: "Pin",
        email: "pin@rooster.com",
        role: "BOH"
      },
      {
        _id: "69f555f794b41001231a4c20",
        name: "Antonio Taiwan",
        email: "taiwan@rooster.com",
        role: "BOH"
      },
      {
        _id: "69f555f794b41001231a4c21",
        name: "Betty",
        email: "betty@rooster.com",
        role: "FOH"
      },
      {
        _id: "69f555f794b41001231a4c22",
        name: "Amber",
        email: "amber@rooster.com",
        role: "admin"
      }
    ];

    const User = require('../models/User');

    for (const user of testUsers) {
      // Buscamos si el usuario existe por su ID o email
      await User.updateOne(
        { 
          $or: [
            { _id: user._id },
            { email: user.email }
          ]
        }, 
        { $set: user }, 
        { upsert: true }
      );
    }

    res.status(201).json({ 
      message: 'Staff creado exitosamente con emails únicos y consistentes', 
      count: testUsers.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
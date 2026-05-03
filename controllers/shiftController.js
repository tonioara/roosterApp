const Shift = require('../models/Shift');
const User = require('../models/User');

exports.swapShifts = async (req, res) => {
  try {
    const { shiftId1, shiftId2 } = req.body;

    const shift1 = await Shift.findById(shiftId1).populate('userId');
    const shift2 = await Shift.findById(shiftId2).populate('userId');

    if (!shift1 || !shift2) {
      return res.status(404).json({ message: 'Uno o ambos turnos no fueron encontrados' });
    }

    if (shift1.userId.role !== shift2.userId.role) {
      return res.status(400).json({ message: 'No se puede realizar el cambio: los roles son distintos' });
    }

    const tempUserId = shift1.userId;
    shift1.userId = shift2.userId._id;
    shift2.userId = tempUserId._id;

    await shift1.save();
    await shift2.save();

    res.status(200).json({ message: 'Turnos intercambiados con éxito', shift1, shift2 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

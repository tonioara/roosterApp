const Roster = require('../models/Roster');
const User = require('../models/User');
const Request = require('../models/Request');

exports.createRoster = async (req, res) => {
  try {
    const { weekId, shifts } = req.body;
    const restaurantId = req.user.restaurantId;
    if (!weekId || !shifts) return res.status(400).json({ message: 'weekId and shifts required.' });

    let roster = await Roster.findOne({ weekId, restaurantId });
    if (roster) {
      roster.shifts = shifts;
      await roster.save();
      return res.status(200).json({ message: 'Roster updated.', roster });
    }
    roster = new Roster({ weekId, restaurantId, shifts });
    await roster.save();
    res.status(201).json({ message: 'Roster created.', roster });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRosterByWeek = async (req, res) => {
  try {
    const { weekId } = req.params;
    const restaurantId = req.user.restaurantId;
    const roster = await Roster.findOne({ weekId, restaurantId })
      .populate('shifts.employee', 'name role skills contractType');
    if (!roster) return res.status(404).json({ message: 'Roster not found.' });
    res.status(200).json(roster);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateAutomaticRoster = async (req, res) => {
  try {
    const { weekId } = req.body;
    const restaurantId = req.user.restaurantId;
    if (!weekId) return res.status(400).json({ message: 'weekId required.' });

    const users = await User.find({ role: { $in: ['FOH', 'BOH'] }, restaurantId });
    if (!users.length) return res.status(404).json({ message: 'No employees registered.' });

    const approvedRequests = await Request.find({
      weekReference: weekId, status: 'Approved', type: 'dayOff', restaurantId,
    });

    const approvedDaysOff = {};
    approvedRequests.forEach(r => {
      const id = r.userId?.toString();
      if (!id) return;
      if (!approvedDaysOff[id]) approvedDaysOff[id] = [];
      approvedDaysOff[id].push(r.requestedDayOff);
    });

    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const shifts = [];

    users.forEach((user, index) => {
      const id = user._id.toString();
      const off = approvedDaysOff[id] || [];
      const rotativeOff = days[index % days.length];
      days.forEach(day => {
        if (off.includes(day)) return;
        if (!off.length && day === rotativeOff) return;
        shifts.push({ day, role: user.role, employee: user._id, startTime: '10:30', endTime: '22:00', shiftType: 'Mañana', hoursWorked: 11.5 });
      });
    });

    let roster = await Roster.findOne({ weekId, restaurantId });
    if (roster) { roster.shifts = shifts; await roster.save(); }
    else roster = await Roster.create({ weekId, restaurantId, shifts });

    const populated = await Roster.findById(roster._id).populate('shifts.employee', 'name role skills');
    res.status(201).json({ message: 'Roster generated.', roster: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

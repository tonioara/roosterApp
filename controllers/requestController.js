const Request = require('../models/Request');
const User = require('../models/User');
const { sendPushNotification } = require('../utils/pushNotifications');

exports.createRequest = async (req, res) => {
  try {
    const { userId, weekReference, requestedDayOff, type, note } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newRequest = new Request({
      userId,
      restaurantId: user.restaurantId,
      weekReference, requestedDayOff,
      type: type || 'dayOff',
      note: note || '',
      status: 'Pending',
    });
    await newRequest.save();

    // Notificar admins del mismo restaurante
    const admins = await User.find({
      role: 'admin',
      restaurantId: user.restaurantId,
      pushSubscription: { $ne: null },
    });
    for (const admin of admins) {
      await sendPushNotification(admin.pushSubscription, {
        title: '🔔 New request',
        body: `${user.name} requested ${type === 'dayOff' ? 'a day off' : 'a schedule change'} for ${requestedDayOff}.`,
        icon: '/icon-192.png',
        url: '/admin-dashboard',
      });
    }

    res.status(201).json({ message: 'Request sent.', newRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    // ✅ Solo ve las solicitudes de su restaurante
    const filter = req.user.role === 'superadmin'
      ? {}
      : { restaurantId: req.user.restaurantId };
    const requests = await Request.find(filter).populate('userId', 'name role email');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    if (!['Approved','Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const updated = await Request.findByIdAndUpdate(requestId, { status }, { new: true }).populate('userId');
    if (!updated) return res.status(404).json({ message: 'Request not found.' });

    const employee = await User.findById(updated.userId._id || updated.userId);
    if (employee?.pushSubscription) {
      await sendPushNotification(employee.pushSubscription, {
        title: status === 'Approved' ? '✅ Request approved' : '❌ Request rejected',
        body: status === 'Approved'
          ? `Your day off on ${updated.requestedDayOff} was approved.`
          : `Your request for ${updated.requestedDayOff} was rejected.`,
        icon: '/icon-192.png',
        url: '/employee-dashboard',
      });
    }

    res.status(200).json({ message: `Request ${status}.`, updatedRequest: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

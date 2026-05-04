const Request = require('../models/Request');
const User = require('../models/User');
const { sendPushNotification } = require('../utils/pushNotifications');

exports.createRequest = async (req, res) => {
  try {
    const { userId, weekReference, requestedDayOff, type, note } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const newRequest = new Request({
      userId,
      weekReference,
      requestedDayOff,
      type: type || 'dayOff',
      note: note || '',
      status: 'Pending'
    });

    await newRequest.save();

    // Notificar a todos los admins
    const admins = await User.find({ role: 'admin', pushSubscription: { $ne: null } });
    for (const admin of admins) {
      await sendPushNotification(admin.pushSubscription, {
        title: '🔔 Nueva solicitud',
        body: `${user.name} pidió ${type === 'dayOff' ? 'un día libre' : 'un cambio de horario'} para el ${requestedDayOff}.`,
        icon: '/icon-192.png',
        url: '/admin-dashboard',
      });
    }

    res.status(201).json({ message: 'Solicitud enviada', newRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({}).populate('userId', 'name role email');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate('userId');

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    // Notificar al empleado
    const employee = await User.findById(updatedRequest.userId._id || updatedRequest.userId);
    if (employee?.pushSubscription) {
      await sendPushNotification(employee.pushSubscription, {
        title: status === 'Approved' ? '✅ Solicitud aprobada' : '❌ Solicitud rechazada',
        body: status === 'Approved'
          ? `Tu día libre del ${updatedRequest.requestedDayOff} fue aprobado.`
          : `Tu solicitud del ${updatedRequest.requestedDayOff} fue rechazada. Hablá con Amber.`,
        icon: '/icon-192.png',
        url: '/employee-dashboard',
      });
    }

    res.status(200).json({ message: `Solicitud ${status}`, updatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

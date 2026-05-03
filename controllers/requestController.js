const Request = require('../models/Request');
const User = require('../models/User');

// 1. Crear una solicitud de día libre (Simula el envío de la alerta del sábado)
exports.createRequest = async (req, res) => {
  try {
    const { userId, weekReference, requestedDayOff } = req.body;

    // Verificamos que el usuario exista
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const newRequest = new Request({
      userId,
      weekReference,
      requestedDayOff,
      status: 'Pending'
    });

    await newRequest.save();
    res.status(201).json({ message: 'Solicitud enviada correctamente', newRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Obtener todas las solicitudes pendientes para el manager
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'Pending' }).populate('userId', 'name role');
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Aprobar o rechazar una solicitud (Función de manager)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'Approved' o 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.status(200).json({ message: `Solicitud ${status.toLowerCase()}`, updatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
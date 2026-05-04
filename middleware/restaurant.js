// Inyecta req.restaurantId automáticamente desde el usuario logueado
exports.injectRestaurant = (req, res, next) => {
  if (req.user) {
    // Superadmin puede ver todos — no filtra
    if (req.user.role === 'superadmin') {
      req.restaurantId = req.query.restaurantId || null;
    } else {
      req.restaurantId = req.user.restaurantId;
    }
  }
  next();
};

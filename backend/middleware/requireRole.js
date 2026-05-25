/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * Enforces role-based access control by checking if the authenticated user's role
 * matches one of the allowed roles for a route.
 * 
 * This middleware must be used AFTER userAuth.js middleware, which sets req.user.role.
 * 
 * @param {...string} roles - One or more allowed roles (e.g., "admin", "customer", "hotelstaff")
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Single role
 * router.post('/api/hotels', userAuth, requireRole('admin'), createHotel);
 * 
 * @example
 * // Multiple roles
 * router.get('/api/bookings/:id', userAuth, requireRole('admin', 'customer'), getBooking);
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated (should be set by userAuth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    // Role check passed, proceed to next middleware/route handler
    next();
  };
};

export default requireRole;

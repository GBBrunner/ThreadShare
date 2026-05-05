const { isAdminRole } = require('../utils/roles');

/**
 * Middleware: requires the authenticated user to have an admin-capable role.
 * Must be used AFTER authenticateToken, which sets req.user.
 */
function requireAdmin(req, res, next) {
    if (!req.user || !isAdminRole(req.user.user_role)) {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
}

module.exports = requireAdmin;

/**
 * Middleware: requires the authenticated user to have the 'admin' role.
 * Must be used AFTER authenticateToken, which sets req.user.
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.user_role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
}

module.exports = requireAdmin;

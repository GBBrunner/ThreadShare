function normalizeRole(role) {
    return role?.toString().trim().toLowerCase().replace(/\s+/g, '-');
}

function isAdminRole(role) {
    return ['admin', 'demo-admin'].includes(normalizeRole(role));
}

module.exports = {
    normalizeRole,
    isAdminRole
};
const { Pool } = require('pg');
const dns = require('dns');

// Some environments (e.g. certain Render setups) can have issues with IPv6.
// Do NOT force IPv4 by default though, because some managed DB hosts may be IPv6-only.
const forceIpv4 = String(process.env.PG_FORCE_IPV4 || '').toLowerCase() === 'true';
if (forceIpv4) {
  dns.setDefaultResultOrder('ipv4first');
}

// Database connection configuration
const DB_URL = process.env.RAILWAY_DATABASE_PUBLIC_URL || process.env.RAILWAY_DB_URL || process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const poolConfig = {
  connectionString: DB_URL,
};

if (forceIpv4) {
  // Force IPv4 connection
  poolConfig.family = 4;
}

// Enable SSL for production environments (Railway, Render.com, or when DB_SSL is set)
if (DB_URL.includes('railway.app') || DB_URL.includes('rlwy.net') || DB_URL.includes('render.com') || process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// Create and export the connection pool
const pool = new Pool(poolConfig);

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;

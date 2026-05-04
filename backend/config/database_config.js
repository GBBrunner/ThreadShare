const { Pool } = require('pg');
const dns = require('dns');

// Force IPv4 DNS resolution to avoid IPv6 connection issues on Render
dns.setDefaultResultOrder('ipv4first');

// Database connection configuration
// Using Supabase as primary database
const DB_URL = process.env.SUPABASE_DB_URL || process.env.DB_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const poolConfig = {
  connectionString: DB_URL,
  // Force IPv4 connection
  family: 4,
};

// Enable SSL for production environments (Supabase, Render.com, or when DB_SSL is set)
if (DB_URL.includes('supabase.co') || DB_URL.includes('pooler.supabase.com') || DB_URL.includes('render.com') || process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// Create and export the connection pool
const pool = new Pool(poolConfig);

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;

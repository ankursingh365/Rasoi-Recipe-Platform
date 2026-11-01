// Reads settings from server/.env on your laptop, then checks them once at startup.
// In production there is no .env file: Render passes the same variables in directly.
try {
  process.loadEnvFile(new URL('../../.env', import.meta.url));
} catch (error) {
  if (error.code !== 'ENOENT') throw error; // ENOENT means "file not found", which is fine
}

const missing = ['MONGODB_URI'].filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(
    `Missing ${missing.join(', ')}. Copy server/.env.example to server/.env and fill it in.`,
  );
  process.exit(1);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4000,
  MONGODB_URI: process.env.MONGODB_URI,
  // Optional. Comma-separated DNS servers for the database lookup, e.g. "1.1.1.1,8.8.8.8".
  DNS_SERVERS: (process.env.DNS_SERVERS ?? '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean),
};
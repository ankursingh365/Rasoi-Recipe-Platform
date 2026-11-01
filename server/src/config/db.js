import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri) {
  // A "mongodb+srv://" address needs a special DNS lookup (an SRV record) to find the
  // cluster's servers. Some routers refuse it, so DNS_SERVERS lets you use public DNS instead.
  if (env.DNS_SERVERS.length > 0) dns.setServers(env.DNS_SERVERS);

  // Give up after 10 seconds instead of the default 30, so mistakes show up quickly.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  console.log(`MongoDB connected: database "${mongoose.connection.name}"`);

  // These run later if the connection drops and comes back (say your Wi-Fi blinks).
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconnected'));
}
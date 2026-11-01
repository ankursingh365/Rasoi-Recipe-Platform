import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

// Connect to the database first. If that fails, there's no point accepting requests.
try {
  await connectDB(env.MONGODB_URI);
} catch (error) {
  console.error('Could not connect to MongoDB:', error.message);
  process.exit(1);
}

app.listen(env.PORT, (error) => {
  if (error) {
    console.error('Could not start the server:', error.message);
    process.exit(1);
  }
  console.log(`API running at http://localhost:${env.PORT}`);
});
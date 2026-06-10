import dotenv from 'dotenv';
import app from './app.js';
import pool from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Graceful shutdown
let server;

const startServer = async () => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected at:', result.rows[0].now);

    // Start the server
    server = app.listen(PORT, () => {
      console.log(`\n🚀 Glamour Backend Server`);
      console.log(`├─ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`├─ Port: ${PORT}`);
      console.log(`├─ API Base: ${process.env.API_BASE_PATH || '/api'}/v1`);
      console.log(`└─ Started at: ${new Date().toISOString()}\n`);
    });

    // Handle shutdown signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  console.log('\n📛 Shutting down gracefully...');

  if (server) {
    server.close(async () => {
      console.log('✓ Server closed');

      try {
        await pool.end();
        console.log('✓ Database pool closed');
      } catch (error) {
        console.error('Error closing database pool:', error);
      }

      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error(
        '❌ Could not close connections in time, forcefully shutting down',
      );
      process.exit(1);
    }, 10000);
  }
};

startServer();

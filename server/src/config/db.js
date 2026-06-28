/**
 * @module config/db
 * @description MongoDB connection manager using Mongoose.
 * Implements retry logic (3 attempts), event listeners, and graceful shutdown.
 */

const mongoose = require('mongoose');
const config = require('./env');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

/**
 * Connects to MongoDB with automatic retry.
 * @param {number} [attempt=1] - Current attempt number (used internally for recursion).
 * @returns {Promise<void>}
 */
const connectDB = async (attempt = 1) => {
  try {
    const conn = await mongoose.connect(config.mongo.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(
      `❌  MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`
    );

    if (attempt < MAX_RETRIES) {
      console.log(`⏳  Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(attempt + 1);
    }

    console.error('⛔  All MongoDB connection attempts exhausted. Exiting.');
    process.exit(1);
  }
};

// ---------------------------------------------------------------------------
// Mongoose connection event listeners
// ---------------------------------------------------------------------------

mongoose.connection.on('connected', () => {
  console.log('📡  Mongoose connection established');
});

mongoose.connection.on('error', (err) => {
  console.error(`🔴  Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🟡  Mongoose disconnected from MongoDB');
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

/**
 * Closes the Mongoose connection cleanly before process exit.
 * @param {string} signal - The OS signal that triggered the shutdown.
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑  ${signal} received — closing MongoDB connection...`);
  await mongoose.connection.close();
  console.log('✅  MongoDB connection closed');
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;

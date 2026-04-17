const mongoose = require('mongoose');

const STATE_NAMES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Wait briefly if Mongoose is still connecting, then report whether the default connection is ready.
 */
async function ensureMongoReady(maxWaitMs = 20000) {
  const conn = mongoose.connection;
  if (conn.readyState === 1) {
    return { ok: true, state: 1, stateName: 'connected' };
  }

  if (conn.readyState === 2) {
    try {
      await Promise.race([
        conn.asPromise(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('MongoDB connect timeout')), maxWaitMs)
        ),
      ]);
    } catch {
      // fall through to state check
    }
  }

  if (conn.readyState === 1) {
    return { ok: true, state: 1, stateName: 'connected' };
  }

  return {
    ok: false,
    state: conn.readyState,
    stateName: STATE_NAMES[conn.readyState] || String(conn.readyState),
  };
}

module.exports = { ensureMongoReady, STATE_NAMES };

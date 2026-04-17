const mongoose = require('mongoose');

/**
 * JSON health payload (used by GET /health and GET /api/health).
 */
function buildHealthPayload(req) {
  const uriSet = Boolean(process.env.MONGO_URI && String(process.env.MONGO_URI).trim());
  return {
    ok: true,
    service: 'usiu-internship-api',
    hit: req.originalUrl || req.url,
    mongo: {
      readyState: mongoose.connection.readyState,
      readyStateName:
        ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] ||
        'unknown',
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
      mongoUriConfigured: uriSet,
    },
  };
}

function sendHealth(req, res) {
  res.json(buildHealthPayload(req));
}

module.exports = { sendHealth, buildHealthPayload };

module.exports = function handler(req, res) {
  res.status(410).json({ error: 'This endpoint is no longer in use.' });
};


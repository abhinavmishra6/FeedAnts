export function notFound(req, res) { res.status(404).json({ error: 'Route not found.' }); }
export function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.name === 'ZodError') return res.status(400).json({ error: 'Invalid request.', details: error.flatten() });
  if (error.code === 11000) return res.status(409).json({ error: 'You are already registered.' });
  res.status(500).json({ error: 'An unexpected server error occurred.' });
}


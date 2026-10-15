const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Handle syntax error for malformed JSON bodies
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ error: 'Invalid book id' });
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const firstField = Object.keys(err.errors)[0];
    const message = err.errors[firstField]?.message || 'Validation error';
    return res.status(400).json({ error: message });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};


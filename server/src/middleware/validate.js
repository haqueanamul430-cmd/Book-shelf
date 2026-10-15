const mongoose = require('mongoose');

const validateBookInput = (req, res, next) => {
  const { title, author } = req.body || {};

  if (title === undefined || title === null || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (author === undefined || author === null || typeof author !== 'string' || author.trim().length === 0) {
    return res.status(400).json({ error: 'Author is required' });
  }

  // Normalize trimmed values onto req.body
  req.body.title = title.trim();
  req.body.author = author.trim();

  next();
};

const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid book id' });
  }
  next();
};

module.exports = {
  validateBookInput,
  validateObjectId,
};


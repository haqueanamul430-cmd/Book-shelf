const Book = require('../models/Book');

// Async handler wrapper to ensure no unhandled promise rejections
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get all books (newest first)
// @route   GET /books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.status(200).json(books);
});

// @desc    Create a new book
// @route   POST /books
// @access  Public
const createBook = asyncHandler(async (req, res) => {
  const { title, author } = req.body;
  const book = await Book.create({ title, author });
  res.status(201).json(book);
});

// @desc    Mark a book as read
// @route   PUT /books/:id
// @access  Public
const markBookAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await Book.findByIdAndUpdate(
    id,
    { status: 'read' },
    { new: true, runValidators: true }
  );

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.status(200).json(book);
});

// @desc    Delete a book
// @route   DELETE /books/:id
// @access  Public
const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const book = await Book.findByIdAndDelete(id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.status(200).json({
    message: 'Book deleted successfully',
    id: book.id || book._id.toString(),
  });
});

module.exports = {
  getBooks,
  createBook,
  markBookAsRead,
  deleteBook,
};


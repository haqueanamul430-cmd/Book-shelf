const express = require('express');
const router = express.Router();
const {
  getBooks,
  createBook,
  markBookAsRead,
  deleteBook,
} = require('../controllers/bookController');
const {
  validateBookInput,
  validateObjectId,
} = require('../middleware/validate');

router.route('/')
  .get(getBooks)
  .post(validateBookInput, createBook);

router.route('/:id')
  .put(validateObjectId, markBookAsRead)
  .delete(validateObjectId, deleteBook);

module.exports = router;


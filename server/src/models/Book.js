const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      minlength: [1, 'Author cannot be empty'],
    },
    status: {
      type: String,
      enum: {
        values: ['unread', 'read'],
        message: 'Status must be either "unread" or "read"',
      },
      default: 'unread',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (doc, ret) => {
        return {
          id: ret._id.toString(),
          title: ret.title,
          author: ret.author,
          status: ret.status,
          createdAt: ret.createdAt,
        };
      },
    },
    toObject: {
      transform: (doc, ret) => {
        return {
          id: ret._id.toString(),
          title: ret.title,
          author: ret.author,
          status: ret.status,
          createdAt: ret.createdAt,
        };
      },
    },
  }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;


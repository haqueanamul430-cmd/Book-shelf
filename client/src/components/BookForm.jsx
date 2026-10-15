import React, { useState } from 'react';

/**
 * BookForm Component
 * Renders inputs for title and author with client-side validation,
 * inline error messages, and loading state during submission.
 */
export default function BookForm({ onAddBook }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required and cannot be empty.';
    }
    if (!author.trim()) {
      newErrors.author = 'Author is required and cannot be empty.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const success = await onAddBook(title.trim(), author.trim());
      if (success) {
        setTitle('');
        setAuthor('');
        setErrors({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: '' }));
    }
  };

  const handleAuthorChange = (e) => {
    setAuthor(e.target.value);
    if (errors.author) {
      setErrors((prev) => ({ ...prev, author: '' }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Add a New Book</h2>
          <p className="text-xs text-slate-500">Record a book you're reading or want to read</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="book-title" className="block text-sm font-medium text-slate-700 mb-1.5">
            Book Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="book-title"
            name="title"
            type="text"
            placeholder="e.g. The Pragmatic Programmer"
            value={title}
            onChange={handleTitleChange}
            disabled={isSubmitting}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
              errors.title
                ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white'
            }`}
          />
          {errors.title && (
            <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1 font-medium">
              <svg className="w-3.5 h-3.5 inline shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="book-author" className="block text-sm font-medium text-slate-700 mb-1.5">
            Author <span className="text-rose-500">*</span>
          </label>
          <input
            id="book-author"
            name="author"
            type="text"
            placeholder="e.g. Andrew Hunt & David Thomas"
            value={author}
            onChange={handleAuthorChange}
            disabled={isSubmitting}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${
              errors.author
                ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white'
            }`}
          />
          {errors.author && (
            <p className="text-rose-600 text-xs mt-1.5 flex items-center gap-1 font-medium">
              <svg className="w-3.5 h-3.5 inline shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.author}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300 text-white font-medium text-sm transition-colors shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Adding Book...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Book</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}


import React, { useState } from 'react';

/**
 * BookItem Component
 * Renders an individual book with title, author, status badge,
 * "Mark as read" button (disabled when read), and "Delete" button.
 */
export default function BookItem({ book, onMarkAsRead, onDeleteBook }) {
  const [isMarking, setIsMarking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isRead = book.status === 'read';

  const handleMarkRead = async () => {
    if (isRead || isMarking) return;
    try {
      setIsMarking(true);
      await onMarkAsRead(book.id);
    } finally {
      setIsMarking(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await onDeleteBook(book.id);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date cleanly
  const formattedDate = book.createdAt
    ? new Date(book.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <li
      className={`group relative bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 ${
        isRead
          ? 'border-emerald-100/80 bg-slate-50/60 shadow-none'
          : 'border-slate-200/80 hover:border-indigo-200 hover:shadow-md shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Book Details */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-base font-semibold truncate transition-colors ${
                isRead
                  ? 'line-through text-slate-400'
                  : 'text-slate-800'
              }`}
              title={book.title}
            >
              {book.title}
            </h3>

            {/* Status Badge */}
            {isRead ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                {/* Green check icon */}
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Read
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span className="font-medium text-slate-600">
              by <span className="text-slate-700 font-semibold">{book.author}</span>
            </span>
            {formattedDate && (
              <>
                <span className="text-slate-300">•</span>
                <span>Added {formattedDate}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Mark as Read Button */}
          {!isRead ? (
            <button
              type="button"
              onClick={handleMarkRead}
              disabled={isMarking || isDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              aria-label={`Mark "${book.title}" as read`}
            >
              {isMarking ? (
                <svg className="animate-spin h-3.5 w-3.5 text-emerald-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span>Mark as read</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
              aria-label="Already read"
            >
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Read</span>
            </button>
          )}

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isMarking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
            aria-label={`Delete "${book.title}"`}
          >
            {isDeleting ? (
              <svg className="animate-spin h-3.5 w-3.5 text-rose-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </li>
  );
}


import React from 'react';
import BookItem from './BookItem';

/**
 * BookList Component
 * Displays the reading list, loading state skeletons, or an empty state message.
 */
export default function BookList({ books, isLoading, onMarkAsRead, onDeleteBook }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-5 w-20 bg-slate-200 rounded animate-pulse"></div>
        </div>
        {/* Skeleton items */}
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-slate-200 rounded-xl"></div>
                <div className="h-8 w-16 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-10 md:p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">No books yet</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Your reading shelf is empty. Add a book using the form above to start building your personal library!
        </p>
      </div>
    );
  }

  const readCount = books.filter((b) => b.status === 'read').length;
  const unreadCount = books.length - readCount;

  return (
    <div className="space-y-4">
      {/* Header and stats */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-800">Your Bookshelf</h2>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 text-slate-700">
            {books.length}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {readCount} read
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {unreadCount} unread
          </span>
        </div>
      </div>

      {/* List */}
      <ul className="space-y-3" role="list" aria-label="Book list">
        {books.map((book) => (
          <BookItem
            key={book.id}
            book={book}
            onMarkAsRead={onMarkAsRead}
            onDeleteBook={onDeleteBook}
          />
        ))}
      </ul>
    </div>
  );
}


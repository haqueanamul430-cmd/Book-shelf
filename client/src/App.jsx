
import React, { useEffect, useReducer, useCallback } from 'react';
import BookForm from './components/BookForm';
import BookList from './components/BookList';
import {
  getBooks,
  createBook,
  markBookAsRead,
  deleteBook,
} from './api/books';


const initialState = {
  books: [],
  isLoading: true,
  error: null,
};


function booksReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_BOOKS':
      return {
        ...state,
        books: action.payload,
        isLoading: false,
        error: null,
      };

    case 'ADD_BOOK':
      return {
        ...state,
        books: [action.payload, ...state.books],
        error: null,
      };

    case 'MARK_READ':
      return {
        ...state,
        books: state.books.map((book) =>
          book.id === action.payload.id ? action.payload : book
        ),
        error: null,
      };

    case 'DELETE_BOOK':
      return {
        ...state,
        books: state.books.filter(
          (book) => book.id !== action.payload
        ),
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(
    booksReducer,
    initialState
  );


  const fetchBooks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const data = await getBooks();

      dispatch({
        type: 'SET_BOOKS',
        payload: data,
      });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Failed to fetch books.',
      });
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  
  const handleAddBook = async (title, author) => {
    try {
      const newBook = await createBook({ title, author });

      dispatch({
        type: 'ADD_BOOK',
        payload: newBook,
      });

      return true;
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Failed to add book.',
      });

      return false;
    }
  };


  const handleMarkAsRead = async (id) => {
    try {
      const updatedBook = await markBookAsRead(id);

      dispatch({
        type: 'MARK_READ',
        payload: updatedBook,
      });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload:
          err.message || 'Failed to update book status.',
      });
    }
  };

  
  const handleDeleteBook = async (id) => {
    try {
      await deleteBook(id);

      dispatch({
        type: 'DELETE_BOOK',
        payload: id,
      });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Failed to delete book.',
      });
    }
  };

  
  const handleDismissError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      
      <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              BookShelf Manager
            </h1>
            <p className="text-sm text-gray-400">
              Personal reading list & library tracker
            </p>
          </div>
        </div>
      </header>

      
      <main className="mx-auto max-w-6xl px-4 py-8">
       
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">
            My Bookshelf
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Add, manage, and track your books.
          </p>
        </div>

        
        {state.error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-800 bg-red-950 p-4 text-red-200"
          >
            <p className="text-sm">{state.error}</p>

            <button
              type="button"
              onClick={handleDismissError}
              className="rounded px-2 py-1 hover:bg-red-900"
              aria-label="Dismiss error banner"
            >
              ✕
            </button>
          </div>
        )}

       
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
         
          <section className="rounded-lg border border-gray-700 bg-gray-900 p-5 lg:col-span-5">
            <h3 className="mb-5 border-b border-gray-700 pb-3 text-lg font-semibold text-white">
              Add New Book
            </h3>

            <BookForm onAddBook={handleAddBook} />
          </section>

          
          <section className="rounded-lg border border-gray-700 bg-gray-900 p-5 lg:col-span-7">
            <h3 className="mb-5 border-b border-gray-700 pb-3 text-lg font-semibold text-white">
              Book List
            </h3>

            <BookList
              books={state.books}
              isLoading={state.isLoading}
              onMarkAsRead={handleMarkAsRead}
              onDeleteBook={handleDeleteBook}
            />
          </section>
        </div>

       
        <footer className="mt-8 border-t border-gray-800 py-5 text-center">
          <p className="text-sm text-gray-400">
            BookShelf Manager © 2026
          </p>
        </footer>
      </main>
    </div>
  );
}

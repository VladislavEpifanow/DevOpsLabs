import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

interface Book {
  id: number
  title: string
  author: string
}

const App = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [newBook, setNewBook] = useState({ title: '', author: '' })
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/books/')
      setBooks(response.data)
    } catch (err) {
      setError('Failed to load books')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBook.title.trim() || !newBook.author.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      if (editingBook) {
        // Редактирование существующей книги
        const response = await axios.put(
          `http://localhost:8000/books/${editingBook.id}`,
          newBook
        )
        setBooks(books.map(book => 
          book.id === editingBook.id ? response.data : book
        ))
        setEditingBook(null)
      } else {
        // Добавление новой книги
        const response = await axios.post('http://localhost:8000/books/', newBook)
        setBooks([...books, response.data])
      }
      setNewBook({ title: '', author: '' })
      setError('')
    } catch (err) {
      setError(editingBook ? 'Failed to update book' : 'Failed to add book')
    }
  }

  const startEditing = (book: Book) => {
    setEditingBook(book)
    setNewBook({ title: book.title, author: book.author })
  }

  const cancelEditing = () => {
    setEditingBook(null)
    setNewBook({ title: '', author: '' })
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/books/${id}`)
      setBooks(books.filter(book => book.id !== id))
    } catch (err) {
      setError('Failed to delete book')
    }
  }

  return (
    <div className="app-container">
      <h1 className="books-header">Book Library</h1>

      <form className="add-book-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Book Title"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            className="form-input"
          />
          
          <input
            type="text"
            placeholder="Author"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            className="form-input"
          />
          
          <div className="form-actions">
            <button 
              type="submit"
              className={`submit-button ${editingBook ? 'update-button' : ''}`}
            >
              {editingBook ? 'Update Book' : 'Add Book'}
            </button>
            
            {editingBook && (
              <button
                type="button"
                className="cancel-button"
                onClick={cancelEditing}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>

      <div className="book-list">
        {books.map((book) => (
          <div key={book.id} className="book-item">
            <div className="book-info">
              <div className="book-title">{book.title}</div>
              <div className="book-author">by {book.author}</div>
            </div>
            <div className="book-actions">
              <button
                onClick={() => startEditing(book)}
                className="edit-button"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(book.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
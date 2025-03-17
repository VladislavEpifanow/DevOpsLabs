import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import axios from 'axios'
import App from './App.tsx'
import '@testing-library/jest-dom'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Book Library Application', () => {
  const mockBooks = [
    { id: 1, title: 'The Master and Margarita', author: 'Mikhail Bulgakov' },
    { id: 2, title: '1984', author: 'George Orwell' }
  ]

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: mockBooks })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // Тест 1: Проверка начальной загрузки данных
  test('1. Загружает и отображает список книг', async () => {
    render(<App />)
    
    // Проверяем заголовок
    expect(await screen.findByText('Book Library')).toBeInTheDocument()
    
    // Проверяем отображение всех книг
    await waitFor(() => {
      expect(screen.getByText('The Master and Margarita')).toBeInTheDocument()
      expect(screen.getByText('by Mikhail Bulgakov')).toBeInTheDocument()
      expect(screen.getByText('1984')).toBeInTheDocument()
      expect(screen.getByText('by George Orwell')).toBeInTheDocument()
    })
  })

  // Тест 2: Добавление новой книги
  test('2. Добавляет новую книгу через форму', async () => {
    const newBook = { id: 3, title: 'Brave New World', author: 'Aldous Huxley' }
    mockedAxios.post.mockResolvedValueOnce({ data: newBook })

    render(<App />)
    
    // Заполняем форму
    fireEvent.change(screen.getByPlaceholderText('Book Title'), {
      target: { value: newBook.title }
    })
    fireEvent.change(screen.getByPlaceholderText('Author'), {
      target: { value: newBook.author }
    })
    
    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /add book/i }))

    // Проверяем запрос к API
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/books/',
        { title: newBook.title, author: newBook.author }
      )
    })

    // Проверяем обновленный список
    expect(await screen.findByText('Brave New World')).toBeInTheDocument()
    expect(screen.getByText('by Aldous Huxley')).toBeInTheDocument()
  })

  // Тест 3: Валидация формы
  test('3. Показывает ошибку при попытке добавить книгу с пустыми полями', async () => {
    render(<App />)
    
    // Пытаемся отправить пустую форму
    fireEvent.click(screen.getByRole('button', { name: /add book/i }))

    // Проверяем сообщение об ошибке
    expect(await screen.findByText(/Please fill in all fields/i)).toBeInTheDocument()
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  // Тест 4: Удаление книги
  test('4. Удаляет книгу из списка', async () => {
    mockedAxios.delete.mockResolvedValueOnce({})

    render(<App />)
    
    // Находим и кликаем кнопку удаления первой книги
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    // Проверяем запрос на удаление
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8000/books/1'
      )
    })

    // Проверяем обновленный список
    expect(screen.queryByText('The Master and Margarita')).not.toBeInTheDocument()
  })

  // Тест 5: Обработка ошибок при загрузке данных
  test('5. Показывает сообщение об ошибке при неудачной загрузке книг', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'))
    
    render(<App />)
    
    // Проверяем отображение ошибки
    expect(await screen.findByText(/Failed to load books/i)).toBeInTheDocument()
  })

  // Тест 6: Обработка ошибок при добавлении книги
  test('6. Показывает ошибку при неудачном добавлении книги', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Server Error'))
    
    render(<App />)
    
    // Заполняем форму
    fireEvent.change(screen.getByPlaceholderText('Book Title'), {
      target: { value: 'New Book' }
    })
    fireEvent.change(screen.getByPlaceholderText('Author'), {
      target: { value: 'Author' }
    })
    
    // Отправляем форму
    fireEvent.click(screen.getByRole('button', { name: /add book/i }))

    // Проверяем сообщение об ошибке
    expect(await screen.findByText(/Failed to add book/i)).toBeInTheDocument()
  })
  test('7. Редактирует книгу и обновляет список', async () => {
    const updatedBook = { 
      id: 1, 
      title: 'Updated Title', 
      author: 'Updated Author' 
    }
    mockedAxios.put.mockResolvedValueOnce({ data: updatedBook })

    render(<App />)
    
    // Дождаться загрузки книг
    await screen.findByText('The Master and Margarita')
    
    // Нажать кнопку Edit
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    // Проверить заполнение формы
    const titleInput = screen.getByPlaceholderText('Book Title') as HTMLInputElement
    const authorInput = screen.getByPlaceholderText('Author') as HTMLInputElement
    
    await waitFor(() => {
      expect(titleInput.value).toBe('The Master and Margarita')
      expect(authorInput.value).toBe('Mikhail Bulgakov')
    })

    // Изменить данные
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } })
    fireEvent.change(authorInput, { target: { value: 'Updated Author' } })
    
    // Отправить форму
    fireEvent.click(screen.getByRole('button', { name: /update book/i }))

    // Проверить запрос и обновление
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:8000/books/1',
        { title: 'Updated Title', author: 'Updated Author' }
      )
      expect(screen.getByText('Updated Title')).toBeInTheDocument()
      expect(screen.getByText('by Updated Author')).toBeInTheDocument()
      expect(screen.queryByText('The Master and Margarita')).toBeNull()
    })
  })

  // Тест 8: Отмена редактирования
  test('8. Отменяет редактирование без сохранения', async () => {
    render(<App />)
    
    await screen.findByText('The Master and Margarita')
    
    // Начать редактирование
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    // Нажать Cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    // Проверить сброс формы
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Book Title')).toHaveValue('')
      expect(screen.getByPlaceholderText('Author')).toHaveValue('')
      expect(screen.queryByText('Update Book')).toBeNull()
    })
  })

  // Тест 9: Ошибка при обновлении
  test('9. Показывает ошибку при неудачном обновлении', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Server Error'))
    
    render(<App />)
    
    await screen.findByText('The Master and Margarita')
    
    // Начать и отправить редактирование
    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0])
    fireEvent.change(screen.getByPlaceholderText('Book Title'), {
      target: { value: 'New Title' }
    })
    fireEvent.click(screen.getByRole('button', { name: /update book/i }))

    // Проверить сообщение об ошибке
    expect(await screen.findByText(/Failed to update book/i)).toBeInTheDocument()
  })
})
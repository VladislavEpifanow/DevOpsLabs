from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from app import models, database 
from app.telegram_notifier import send_telegram_message
import asyncio

# Pydantic модели
class BookCreate(BaseModel):
    title: str
    author: str

class BookResponse(BaseModel):
    id: int
    title: str
    author: str

    model_config = ConfigDict(from_attributes=True)

# Инициализация БД
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency для сессии БД
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CRUD операции
@app.post("/books/", response_model=BookResponse)
async def create_book(book: BookCreate, db: Session = Depends(get_db)):
    db_book = models.Book(**book.model_dump())
    db.add(db_book)
    db.commit()
    db.refresh(db_book)

    asyncio.create_task(send_telegram_message(f"✅ Новая книга добавлена: {db_book.title} — {db_book.author}"))

    return db_book

@app.get("/books/", response_model=list[BookResponse])
def read_books(db: Session = Depends(get_db)):
    return db.query(models.Book).all()

@app.get("/books/{book_id}", response_model=BookResponse)
def read_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@app.put("/books/{book_id}", response_model=BookResponse)
async def update_book(book_id: int, book: BookCreate, db: Session = Depends(get_db)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    db_book.title = book.title
    db_book.author = book.author
    db.commit()
    db.refresh(db_book)

    asyncio.create_task(send_telegram_message(f"✏️ Книга обновлена: {db_book.title} — {db_book.author}"))

    return db_book

@app.delete("/books/{book_id}")
async def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    title, author = book.title, book.author
    db.delete(book)
    db.commit()

    asyncio.create_task(send_telegram_message(f"🗑️ Книга удалена: {title} — {author}"))

    return {"message": "Book deleted successfully"}
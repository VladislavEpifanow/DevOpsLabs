FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    sqlite3 \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r /app/requirements.txt

COPY ./app/ /app/app/

RUN mkdir -p /app/db && \
    touch /app/db/library.db && \
    chmod 777 /app/db/library.db

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
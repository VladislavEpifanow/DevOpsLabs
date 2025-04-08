FROM node:18-alpine

# Установка зависимостей
RUN apk add --no-cache xdg-utils curl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Используем переменную окружения для API
ENV VITE_API_URL=/api

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
FROM node:18-alpine

# Устанавливаем xdg-utils для исправления ошибки с открытием браузера
RUN apk add --no-cache xdg-utils

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV VITE_API_URL=http://backend:8000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
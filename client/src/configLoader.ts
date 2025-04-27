// src/configLoader.ts

// Загрузка dotenv только во время тестов
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config();
  }
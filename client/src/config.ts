export function getApiUrl(): string {
    if (process.env.NODE_ENV === 'test') {
      return "http://localhost:8000"; // Для тестов
    }
    return import.meta.env.VITE_API_URL || "http://localhost:8000";
  }
  
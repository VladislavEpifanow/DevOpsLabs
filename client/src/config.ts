export function getApiUrl(): string {
    if (process.env.NODE_ENV === 'test') {
      return "http://localhost:8000";
    }
    if (typeof window !== "undefined") {
      return import.meta.env.VITE_API_URL || "http://localhost:8000";
    }
    return "http://localhost:8000";
  }
  
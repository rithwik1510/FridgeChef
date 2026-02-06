import axios from 'axios';

/**
 * Extract a user-friendly error message from any error.
 * Handles Axios errors, standard errors, and unknown values.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot connect to server. Make sure the backend is running.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    if (error.response) {
      // Server returned an error response
      const detail = error.response.data?.detail;
      if (typeof detail === 'string') return detail;
      if (error.response.data?.message) return error.response.data.message;
      return `Server error (${error.response.status})`;
    }
    if (error.request) {
      return 'No response from server. Check your connection.';
    }
    return error.message || 'Network error';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if an error is an Axios error with a specific HTTP status code.
 */
export function isHttpError(error: unknown, status: number): boolean {
  return axios.isAxiosError(error) && error.response?.status === status;
}

import axios from 'axios';
import { API_BASE_URL } from '../config/env';

// No auth interceptor: customers have no accounts and every endpoint the
// app uses is public. (Admin login exists only on the web.)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

/** Marks a 200 response whose body is not the JSON we expected. */
export class BadResponseError extends Error {
  constructor(message = 'Unexpected response from the shop') {
    super(message);
    this.name = 'BadResponseError';
  }
}

/**
 * True when the failure is "no connection / timed out" rather than the
 * server answering. Drives the calm offline state instead of an error wall.
 */
export function isNetworkError(err) {
  if (!err) return false;
  if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') return true;
  return Boolean(err.isAxiosError) && !err.response;
}

/**
 * Friendly text for any failure. The API answers errors as
 * { error: "message" } (friendly for 400/404/413/429), but a proxy in
 * front of it can return HTML on some failures — so only trust the body
 * when it is an object with a string `error`.
 */
export function getErrorMessage(err) {
  if (isNetworkError(err)) return "Can't reach the shop. Check your connection and try again.";
  const body = err?.response?.data;
  if (body && typeof body === 'object' && typeof body.error === 'string' && body.error) return body.error;
  if (err?.response?.status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (err instanceof BadResponseError) return 'The shop sent something unexpected. Please try again.';
  return 'Something went wrong. Please try again.';
}

export default api;

import { Response } from 'express';

/**
 * Sends an HTTP response with the given status code, message, data, and error (if any).
 * @param {Object} res - The Express response object.
 * @param {number} status - The HTTP status code to send.
 * @param {string} message - The message to include in the response body.
 * @param {Object} [data] - Optional data to include in the response body.
 * @param {Object} [error] - Optional error information to include in the response body.
 * @returns {Object} The Express response object.
 */
export const handleResponse = (res: Response, status: number, message: string, data?: any, error?: any): Response => {
  // Set the HTTP status code and send the response
  return res.status(status || 500).json({ status, message, data, error });
};

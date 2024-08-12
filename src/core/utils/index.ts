import { env } from "../../config";

export function parseData(data: any): any[] {
  // If the data is an array, return that
  if (Array.isArray(data)) {
    return data;
  }

  // Some endpoints respond with 204 No Content instead of empty array
  // when there is no data. In that case, return an empty array.
  if (!data) {
    return [];
  }

  // Otherwise, the array of items that we want is in an object
  // Delete keys that don't include the array of items
  delete data.incomplete_results;
  delete data.repository_selection;
  delete data.total_count;
  // Pull out the array of items
  const namespaceKey = Object.keys(data)[0];
  data = data[namespaceKey];

  return data;
}

/**
 * A simple logger that checks if the node environment is development
 * and hides all logs in production.
 * @namespace
 * @property {Function} log - Logs messages in development environment.
 * @property {Function} error - Logs error messages in development environment.
 * @property {Function} warn - Logs warning messages in development environment.
 * @property {Function} info - Logs info messages in development environment.
 * @property {Function} debug - Logs debug messages in development environment.
 */
export const logger = {
  log: (...args: any[]) => {
    if (env.isDev) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (env.isDev) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (env.isDev) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (env.isDev) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (env.isDev) {
      console.debug(...args);
    }
  }
};

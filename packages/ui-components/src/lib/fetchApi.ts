import config from '@unstoppabledomains/config';

import {notifyEvent} from './error';

// the default fetch timeout
const DEFAULT_TIMEOUT_MS = 300 * 1000; // 5 minutes

export interface FetchOptions extends RequestInit {
  host?: string;
  forceRefresh?: boolean;
  acceptStatusCodes?: number[];
  timeout?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchApi = async <T = any>(
  path: string,
  options: FetchOptions = {},
): Promise<T> => {
  // prepare the request URL from the provided path string
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = normalizedPath.startsWith('https://')
    ? normalizedPath
    : options.host
    ? `${options.host}/${normalizedPath}`
    : `${config.UNSTOPPABLE_API_URL}/api/${normalizedPath}`;

  // add the authorization header if the request is going to the profile API
  if (url.startsWith(config.PROFILE.HOST_URL) && config.GATEWAY_API_KEY) {
    options.headers = {
      ...options.headers,
      ['Authorization']: `Bearer ${config.GATEWAY_API_KEY}`,
    };
  }

  // force refresh forces to retrieve a fresh version from the server
  if (options.forceRefresh) {
    options.headers = {
      ...options.headers,
      ['X-Fastly-Force-Refresh']: 'true',
    };
  }

  // prepare the abort controller to send a signal to fetch when the
  // request timeout has been exceeded
  const cancelController = new AbortController();
  options.signal = cancelController.signal;

  // set a timer to fire at the requested timeout
  const cancelTimer = setTimeout(() => {
    const cancelMsg = `request timeout after ${options.timeout}ms`;
    notifyEvent(new Error(cancelMsg), 'error', 'Request', 'Fetch', {
      meta: {url},
    });
    cancelController.abort(cancelMsg);
  }, options.timeout || DEFAULT_TIMEOUT_MS);

  // make the request
  return fetch(url, options)
    .then(async (res: Response) => {
      if (!res.ok && !options.acceptStatusCodes?.includes(res.status)) {
        const severity = res.status >= 429 ? 'error' : 'warning';
        notifyEvent(
          new Error(`unexpected response code`),
          severity,
          'Request',
          'Fetch',
          {
            msg: 'unexpected response code',
            meta: {status: res.status, url},
          },
        );
        return undefined;
      }
      try {
        const contentType =
          res.headers.get('Content-Type') || res.headers.get('content-type');
        return typeof contentType === 'string' &&
          contentType.toLowerCase().includes('application/json')
          ? await res.json()
          : await res.text();
      } catch (e) {
        return undefined;
      }
    })
    .catch(e => {
      notifyEvent(e, 'error', 'Request', 'Fetch', {
        msg: 'fetch error',
        meta: {url},
      });
      return undefined;
    })
    .finally(() => clearTimeout(cancelTimer));
};

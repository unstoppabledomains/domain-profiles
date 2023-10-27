import config from '@unstoppabledomains/config';

import {notifyError} from './error';

export interface FetchOptions extends RequestInit {
  host?: string;
  forceRefresh?: boolean;
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

  // force refresh forces to retrieve a fresh version from the server
  if (options.forceRefresh) {
    if (!options.headers) {
      options.headers = new Headers();
    }
    (options.headers as Headers).append('X-Fastly-Force-Refresh', 'true');
  }

  // make the request
  return fetch(url, options).then(async (res: Response) => {
    if (!res.ok) {
      notifyError(new Error(`error fetching API`), {res, url, options});
      return undefined;
    }
    try {
      return await res.json();
    } catch (e) {
      return undefined;
    }
  });
};

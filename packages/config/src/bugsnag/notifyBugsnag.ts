import type {BugsnagError} from './types';

interface BugsnagConfig {
  api_key: string;
  app_version: string;
  app_env: string;
}

const notifyBugsnag = (
  errorObj: BugsnagError,
  altConfig?: BugsnagConfig,
): boolean => {
  let clientName = 'Unknown Client';

  if (typeof window !== 'undefined' && window.document !== null) {
    clientName =
      window?.sessionStorage?.getItem('clientId') ?? 'Unknown Client';
  }

  // TODO: replace with datadog event

  // eslint-disable-next-line no-console
  console.error(clientName, errorObj);
  return true;
};

export default notifyBugsnag;

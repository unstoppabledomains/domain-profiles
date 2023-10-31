export type Severity = 'info' | 'warning' | 'error';

export const notifyError = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalMetaData?: Record<string, any>,
  // default severity for bugsnag if not set it warning for handled exceptions and error for unhandled
  severity?: Severity,
) => {
  switch (severity) {
    case 'info':
      // eslint-disable-next-line no-console
      console.info(error?.message ? error.message : error, additionalMetaData);
      break;
    case 'warning':
      // eslint-disable-next-line no-console
      console.warn(error?.message ? error.message : error, additionalMetaData);
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(error, additionalMetaData);
  }
};

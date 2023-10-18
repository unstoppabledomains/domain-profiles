export type Severity = 'info' | 'warning' | 'error';

export const notifyError = (
  error: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalMetaData?: Record<string, any>,
  // default severity for bugsnag if not set it warning for handled exceptions and error for unhandled
  severity?: Severity,
) => {
  // TODO handle error processing
  // eslint-disable-next-line no-console
  console.error(error, severity, additionalMetaData);
};

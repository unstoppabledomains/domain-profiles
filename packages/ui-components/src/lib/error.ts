/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BugsnagErrorClasses,
  BugsnagErrorContexts,
  SeverityLevel,
} from '@unstoppabledomains/config';
import {notifyBugsnag} from '@unstoppabledomains/config';

export type ErrorMetadata = {
  msg: string;
  meta?: Record<string, any>;
};

export const notifyError = (
  error: any,
  severity: SeverityLevel,
  appContext: keyof typeof BugsnagErrorContexts,
  errorClass: keyof typeof BugsnagErrorClasses,
  metadata?: ErrorMetadata,
) => {
  const isReported = notifyBugsnag({
    error,
    appContext,
    errorClass,
    severity,
    metadata,
  });
  switch (severity) {
    case 'info':
      // eslint-disable-next-line no-console
      console.info(
        error?.message ? error.message : error,
        JSON.stringify({
          additionalMetaData: metadata,
          isReported,
        }),
      );
      break;
    case 'warning':
      // eslint-disable-next-line no-console
      console.warn(
        error?.message ? error.message : error,
        JSON.stringify({
          additionalMetaData: metadata,
          isReported,
        }),
      );
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(
        error,
        JSON.stringify({
          additionalMetaData: metadata,
          isReported,
        }),
      );
  }
};

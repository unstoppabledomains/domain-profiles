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

export const notifyEvent = (
  error: any,
  severity: SeverityLevel,
  appContext: keyof typeof BugsnagErrorContexts,
  errorClass: keyof typeof BugsnagErrorClasses,
  metadata?: ErrorMetadata,
  forceSend?: boolean,
) => {
  let sendToBugsnag = forceSend || false;
  switch (severity) {
    case 'info':
      // eslint-disable-next-line no-console
      console.info(
        error?.message ? error.message : error,
        JSON.stringify({
          metadata,
        }),
      );
      break;
    case 'warning':
      // eslint-disable-next-line no-console
      console.warn(
        error?.message ? error.message : error,
        JSON.stringify({
          metadata,
        }),
      );
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(
        error,
        JSON.stringify({
          metadata,
        }),
      );
      sendToBugsnag = true;
  }
  if (sendToBugsnag) {
    notifyBugsnag({
      error,
      appContext,
      errorClass,
      severity,
      metadata,
    });
  }
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  BugsnagErrorClasses,
  BugsnagErrorContexts,
  SeverityLevel,
} from '@unstoppabledomains/config';
import {notifyBugsnag} from '@unstoppabledomains/config';

export type ErrorMetadata = {
  msg?: string;
  meta?: Record<string, any>;
};

export const notifyEvent = (
  event: any,
  severity: SeverityLevel,
  appContext: keyof typeof BugsnagErrorContexts,
  errorClass: keyof typeof BugsnagErrorClasses,
  metadata?: ErrorMetadata,
  forceSend?: boolean,
) => {
  let sendToBugsnag = forceSend || false;
  const logData = [
    event?.message ? event.message : event || 'event',
    metadata
      ? JSON.stringify({
          metadata,
        })
      : undefined,
  ].filter(d => d !== undefined);
  switch (severity) {
    case 'info':
      // eslint-disable-next-line no-console
      console.info(...logData);
      break;
    case 'warning':
      // eslint-disable-next-line no-console
      console.warn(...logData);
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(...logData);
      sendToBugsnag = true;
  }
  if (sendToBugsnag) {
    notifyBugsnag({
      error: event,
      appContext,
      errorClass,
      severity,
      metadata,
    });
  }
};

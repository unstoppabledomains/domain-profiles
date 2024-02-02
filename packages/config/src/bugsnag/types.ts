/* eslint-disable @typescript-eslint/no-explicit-any */
export type BugsnagError = {
  error: any; // usually an object, sometimes a string. Bugsnag.notify can consume either. Objects offer greater stack tracing details
  appContext: keyof typeof BugsnagErrorContexts; // app or component name
  errorClass: keyof typeof BugsnagErrorClasses; // type of error
  severity: SeverityLevel; // info, warning, error
  metadata?: Record<string, any>; // additional error metadata
};

export type SeverityLevel = 'info' | 'warning' | 'error';

export enum BugsnagErrorContexts {
  'BADGES',
  'INFRASTRUCTURE',
  'MESSAGING',
  'PROFILE',
  'TOKEN_GALLERY',
  'WALLET',
}

export enum BugsnagErrorClasses {
  Authorization = 'Authorization Error',
  Signature = 'Signature Error',
  Fetch = 'Fetch Error',
  Resolution = 'Resolution Error',
  Validation = 'Validation Error',
  PushProtocol = 'Push Protocol Error',
  XMTP = 'XMTP Error',
}

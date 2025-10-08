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
  'Badges',
  'Request',
  'Messaging',
  'Profile',
  'TokenGallery',
  'Wallet',
  'Extension',
}

export enum BugsnagErrorClasses {
  Authorization = 'Authorization',
  Background = 'Background',
  Configuration = 'Configuration',
  Fetch = 'Fetch',
  Fireblocks = 'Fireblocks',
  Popup = 'Popup',
  PushProtocol = 'Push Protocol',
  Resolution = 'Resolution',
  Signature = 'Signature',
  Transaction = 'Transaction',
  Validation = 'Validation',
  XMTP = 'XMTP',
}

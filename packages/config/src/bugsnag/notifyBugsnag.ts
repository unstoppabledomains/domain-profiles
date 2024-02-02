import Bugsnag, {Client as BugsnagClient} from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import React from 'react';

import config from '../';
import type {BugsnagError} from './types';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var bugsnag: BugsnagClient | undefined;
}

export const getBugsnag = (): BugsnagClient | undefined => {
  if (global.bugsnag) {
    return global.bugsnag;
  }
  const bugsnagClient =
    global.bugsnag ??
    (config.BUGSNAG.API_KEY
      ? Bugsnag.start({
          apiKey: config.BUGSNAG.API_KEY,
          plugins: [new BugsnagPluginReact(React)],
          releaseStage: config.APP_ENV,
          enabledReleaseStages: ['development', 'staging', 'production'],
          logger: null,
        })
      : undefined);

  global.bugsnag = bugsnagClient;
  return bugsnagClient;
};

const notifyBugsnag = (errorObj: BugsnagError): boolean => {
  const bugsnagClient = getBugsnag();
  if (!bugsnagClient) {
    return false;
  }

  const {error, appContext, errorClass, severity} = errorObj;
  let clientName = 'Unknown Client';

  if (typeof window !== 'undefined' && window.document !== null) {
    clientName =
      window?.sessionStorage?.getItem('clientId') ?? 'Unknown Client';
  }

  bugsnagClient.notify(error, event => {
    event.context = appContext; // what component the error occurred in
    event.errors[0].errorClass = errorClass; // what classification of error, logical, routing, etc
    event.severity = severity;
    event.addMetadata('client', {name: clientName});
    if (errorObj.metadata) {
      event.addMetadata('context', errorObj.metadata);
    }
  });
  return true;
};

export default notifyBugsnag;

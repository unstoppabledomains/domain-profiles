import BugsnagPerformance from '@bugsnag/browser-performance';
import Bugsnag, {Client as BugsnagClient} from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';
import React from 'react';

import config from '../';
import type {BugsnagError} from './types';

declare global {
  // eslint-disable-next-line no-var, vars-on-top
  var bugsnag: BugsnagClient | undefined;
}

interface BugsnagConfig {
  api_key: string;
  app_version: string;
  app_env: string;
}

export const getBugsnag = (
  altConfig?: BugsnagConfig,
): BugsnagClient | undefined => {
  const clientConfig: BugsnagConfig | undefined = config.BUGSNAG.API_KEY
    ? {
        api_key: config.BUGSNAG.API_KEY,
        app_version: config.APP_VERSION,
        app_env: config.APP_ENV,
      }
    : altConfig;
  if (!clientConfig) {
    return undefined;
  }
  if (global.bugsnag) {
    return global.bugsnag;
  }

  // create a shared bugsnag client
  const bugsnagClient =
    global.bugsnag ??
    Bugsnag.start({
      appVersion: clientConfig.app_version,
      apiKey: clientConfig.api_key,
      plugins: [new BugsnagPluginReact(React)],
      releaseStage: clientConfig.app_env,
      enabledReleaseStages: ['development', 'staging', 'production'],
      logger: null,
    });
  global.bugsnag = bugsnagClient;

  // start performance monitoring
  BugsnagPerformance.start({apiKey: clientConfig.api_key});
  return bugsnagClient;
};

const notifyBugsnag = (
  errorObj: BugsnagError,
  altConfig?: BugsnagConfig,
): boolean => {
  const bugsnagClient = getBugsnag(altConfig);
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

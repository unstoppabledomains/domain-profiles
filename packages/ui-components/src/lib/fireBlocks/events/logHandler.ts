import type {IEventsHandler, TEvent} from '@fireblocks/ncw-js-sdk';

import {notifyEvent} from '../../error';

export class LogEventHandler implements IEventsHandler {
  onEventCallback?: (event: TEvent) => void;

  constructor(onEventCallback?: (event: TEvent) => void) {
    this.onEventCallback = onEventCallback;
  }

  async handleEvent(event: TEvent) {
    if (this.onEventCallback) {
      this.onEventCallback(event);
    }
    notifyEvent('fireblocks event', 'info', 'Wallet', 'Fireblocks', {
      meta: {
        timestamp: new Date().toString(),
        event,
      },
    });
  }
}

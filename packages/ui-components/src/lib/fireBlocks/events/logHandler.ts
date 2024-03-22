import type {IEventsHandler, TEvent} from '@fireblocks/ncw-js-sdk';

import {notifyEvent} from '../../error';

export class LogEventHandler implements IEventsHandler {
  async handleEvent(event: TEvent) {
    notifyEvent('fireblocks event', 'info', 'Wallet', 'Fireblocks', {
      meta: {
        timestamp: new Date().toString(),
        event,
      },
    });
  }
}

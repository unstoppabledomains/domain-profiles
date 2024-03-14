import type {IEventsHandler, TEvent} from '@fireblocks/ncw-js-sdk';

export class LogEventHandler implements IEventsHandler {
  async handleEvent(event: TEvent) {
    // eslint-disable-next-line no-console
    console.log(`Fireblocks event`, JSON.stringify(event));
  }
}

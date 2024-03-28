import type {IMessagesHandler} from '@fireblocks/ncw-js-sdk';

import {sendRpcMessage} from '../../../actions/fireBlocksActions';
import {notifyEvent} from '../../error';

export class RpcMessageProvider implements IMessagesHandler {
  private jwt: string;

  constructor(jwt: string) {
    this.jwt = jwt;
  }

  setAuthentication(jwt: string): void {
    this.jwt = jwt;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleOutgoingMessage(message: string): Promise<any> {
    try {
      return await sendRpcMessage(message, this.jwt);
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Fetch', {
        msg: 'error sending RPC message',
      });
      return {
        error: {
          message: 'unknown',
        },
      };
    }
  }
}

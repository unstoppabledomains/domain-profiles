import type {IMessagesHandler} from '@fireblocks/ncw-js-sdk';

import {sendRpcMessage} from '../../../actions/fireBlocksActions';
import {notifyEvent} from '../../error';

let RPC_MESSAGE_PROVIDER_JWT: string = '';

export class RpcMessageProvider implements IMessagesHandler {
  constructor(jwt: string) {
    setRpcMessageProviderJwt(jwt);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleOutgoingMessage(message: string): Promise<any> {
    try {
      return await sendRpcMessage(message, RPC_MESSAGE_PROVIDER_JWT);
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

export const setRpcMessageProviderJwt = (jwt: string): void => {
  RPC_MESSAGE_PROVIDER_JWT = jwt;
};

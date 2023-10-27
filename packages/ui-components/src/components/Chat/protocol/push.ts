import type {IMessageIPFS} from '@pushprotocol/restapi';
import * as PushAPI from '@pushprotocol/restapi';
import {sign} from '@pushprotocol/restapi/src/lib/chat/helpers/pgp';
import {ENV} from '@pushprotocol/uiweb';
import {ethers} from 'ethers';
import {Web3Storage} from 'web3.storage';

import config from '@unstoppabledomains/config';

import {Upload} from './upload';
import {formatFileSize} from './xmtp';

export const PUSH_PAGE_SIZE = 20;

export enum MessageType {
  Text = 'Text',
  Media = 'MediaEmbed',
}

// getAddressAccount normalizes expected account format
export const getAddressAccount = (address: string) => {
  return `eip155:${ethers.utils.getAddress(address)}`;
};

// getPushUser defined here to allow for test mock
export const getPushUser = async (
  address: string,
): Promise<PushAPI.IUser | undefined> => {
  return await PushAPI.user.get({
    account: getAddressAccount(address),
    env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
  });
};

export const getGroupInfo = async (chatId?: string) => {
  if (!chatId) return;
  try {
    return await PushAPI.chat.getGroup({
      env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
      chatId,
    });
  } catch (e) {
    console.log('error getting group', e);
    return;
  }
};

export const acceptGroupInvite = async (
  chatId: string,
  address: string,
  pushKey: string,
) => {
  // check for an existing group chat request
  const requests = await PushAPI.chat.requests({
    account: getAddressAccount(address),
    pgpPrivateKey: pushKey,
    env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
  });
  const groupChatRequest = requests.filter(r => r.chatId === chatId);

  // accept invite request if present
  if (groupChatRequest.length > 0) {
    await PushAPI.chat.approve({
      account: getAddressAccount(address),
      pgpPrivateKey: pushKey,
      env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
      senderAddress: chatId,
    });
  }
};

export const signMessage = async (
  message: string,
  pushKey: string,
): Promise<string> => {
  return await sign({message, signingKey: pushKey});
};

export const sendMessage = async (
  chatId: string,
  address: string,
  pushKey: string,
  message: string,
) => {
  const sentMessage = await PushAPI.chat.send({
    account: getAddressAccount(address),
    pgpPrivateKey: pushKey,
    env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
    message: {
      content: message,
      type: MessageType.Text,
    },
    to: chatId,
  });
  sentMessage.messageObj = {
    content: message,
  };
  return sentMessage;
};

export const sendRemoteAttachment = async (
  chatId: string,
  address: string,
  pushKey: string,
  storageApiKey: string,
  uploadFile: File,
) => {
  // check max file size in bytes
  if (uploadFile.size > config.XMTP.MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `File must be less than ${formatFileSize(
        config.XMTP.MAX_ATTACHMENT_BYTES,
      )}`,
    );
  }

  // upload the attachment somewhere and get a URL
  const web3Storage = new Web3Storage({
    token: storageApiKey,
  });
  const upload = new Upload(
    `${address}-${chatId}-${uploadFile.name}`,
    new Uint8Array(await uploadFile.arrayBuffer()),
  );
  const cid = await web3Storage.put([upload]);
  const url = `https://${cid}.ipfs.w3s.link/${upload.name}?mimeType=${uploadFile.type}`;

  // send the message as embedded media
  return await PushAPI.chat.send({
    account: getAddressAccount(address),
    pgpPrivateKey: pushKey,
    env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
    message: {
      content: url,
      type: MessageType.Media,
    },
    to: chatId,
  });
};

export const getMessages = async (
  chatId: string,
  address: string,
  pushKey: string,
  threadhash?: string,
) => {
  // get thread hash of the group chat
  if (!threadhash) {
    const hashResponse = await PushAPI.chat.conversationHash({
      account: getAddressAccount(address),
      env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
      conversationId: chatId,
    });
    threadhash = hashResponse.threadHash;
  }

  // retrieve the group chat
  return await PushAPI.chat.history({
    account: getAddressAccount(address),
    env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
    threadhash,
    pgpPrivateKey: pushKey,
    toDecrypt: true,
    limit: PUSH_PAGE_SIZE,
  });
};

export const decryptMessage = async (
  address: string,
  pushKey: string,
  msg: IMessageIPFS,
): Promise<IMessageIPFS | undefined> => {
  const connectedUser = await getPushUser(address);
  if (!connectedUser) {
    return undefined;
  }
  const decryptedMessage = await PushAPI.chat.decryptConversation({
    env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
    pgpPrivateKey: pushKey,
    messages: [msg],
    connectedUser,
  });
  if (decryptedMessage.length > 0) {
    return decryptedMessage[0];
  }
  return undefined;
};

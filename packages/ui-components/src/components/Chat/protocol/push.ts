import type {IMessageIPFS} from '@pushprotocol/restapi';
import * as PushAPI from '@pushprotocol/restapi';
import {aesDecrypt} from '@pushprotocol/restapi/src/lib/chat/helpers';
import {getEncryptedSecret} from '@pushprotocol/restapi/src/lib/chat/helpers/getEncryptedSecret';
import * as PGP from '@pushprotocol/restapi/src/lib/chat/helpers/pgp';
import {sign} from '@pushprotocol/restapi/src/lib/chat/helpers/pgp';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import * as Web3Signer from '@ucanto/principal/ed25519';
import * as Web3UpClient from '@web3-storage/w3up-client';
import {ethers} from 'ethers';

import config from '@unstoppabledomains/config';

import {notifyError} from '../../../lib/error';
import {sleep} from '../../../lib/sleep';
import {getLocalKey, setLocalKey} from '../storage';
import {fromCaip10Address} from '../types';
import {registerClientTopics} from './registration';
import {isEthAddress} from './resolution';
import type {W3UpKey} from './types';
import {Upload, parseW3UpProof} from './upload';
import {formatFileSize} from './xmtp';

export enum MessageType {
  Text = 'Text',
  Media = 'MediaEmbed',
  Meta = 'Meta',
  Reaction = 'Reaction',
}

export const PUSH_DECRYPT_ERROR_MESSAGE = 'Unable to Decrypt Message';
export const PUSH_PAGE_SIZE = 20;

export const acceptGroupInvite = async (
  chatId: string,
  address: string,
  pushKey: string,
) => {
  try {
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
        overrideSecretKeyGeneration: false,
      });
    }
  } catch (e) {
    notifyError(e, 'error', 'MESSAGING', 'PushProtocol', {
      msg: 'error accepting group invitation',
    });
  }
};

export const decryptMessage = async (
  address: string,
  pushKey: string,
  msg: IMessageIPFS,
): Promise<IMessageIPFS | undefined> => {
  if (msg.link) {
    const cachedMsg = getLocalKey<IMessageIPFS>(msg.link);
    if (cachedMsg) {
      return cachedMsg;
    }
  }
  try {
    const connectedUser = await getPushUser(address);
    if (!connectedUser) {
      return undefined;
    }

    // decrypt the message with PGP
    const decryptedMessage = await decryptMessageWithPGP(
      msg,
      pushKey,
      config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
    );

    if (msg.link && decryptedMessage) {
      setLocalKey<IMessageIPFS>(msg.link, decryptedMessage);
      return decryptedMessage;
    }
  } catch (e) {
    notifyError(e, 'error', 'MESSAGING', 'PushProtocol', {
      msg: 'error decrypting message',
    });
  }
  return undefined;
};

export const decryptMessageWithPGP = async (
  message: IMessageIPFS | PushAPI.IMessageIPFSWithCID,
  pgpPrivateKey: string,
  env: ENV,
  pgpHelper = PGP.PGPHelper,
): Promise<IMessageIPFS | PushAPI.IMessageIPFSWithCID | undefined> => {
  const decryptedMessage: IMessageIPFS | PushAPI.IMessageIPFSWithCID = {
    ...message,
  };
  try {
    if (message.encType === 'pgpv1:group') {
      message.encryptedSecret = await getEncryptedSecret({
        sessionKey: message.sessionKey as string,
        env,
      });
    }
    const secretKey: string = await pgpHelper.pgpDecrypt({
      cipherText: message.encryptedSecret,
      toPrivateKeyArmored: pgpPrivateKey,
    });
    decryptedMessage.messageContent = aesDecrypt({
      cipherText: message.messageContent,
      secretKey,
    });
    if (message.messageObj) {
      const plainText = aesDecrypt({
        cipherText: message.messageObj as string,
        secretKey,
      });
      try {
        decryptedMessage.messageObj = JSON.parse(plainText);
      } catch (parseErr) {
        decryptedMessage.messageObj = plainText;
      }
    }
  } catch (err) {
    notifyError(err, 'error', 'MESSAGING', 'PushProtocol', {
      msg: 'error decrypting message',
    });
    return undefined;
  }

  return decryptedMessage;
};

// getAddressAccount normalizes expected account format
export const getAddressAccount = (address: string) => {
  return `eip155:${ethers.utils.getAddress(address)}`;
};

export const getGroupInfo = async (chatId?: string) => {
  if (!chatId) return;
  try {
    return await PushAPI.chat.getGroup({
      env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
      chatId,
    });
  } catch (e) {
    notifyError(e, 'error', 'MESSAGING', 'PushProtocol', {
      msg: 'error getting group',
    });
    return;
  }
};

export const getLatestMessage = async (
  chatId: string,
  address: string,
  pushKey: string,
  threadhash?: string,
) => {
  try {
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
    const encryptedMsg = await PushAPI.chat.latest({
      account: getAddressAccount(address),
      env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
      threadhash,
      pgpPrivateKey: pushKey,
    });
    if (encryptedMsg && encryptedMsg.length > 0) {
      return await decryptMessage(address, pushKey, encryptedMsg[0]);
    }
  } catch (e) {
    notifyError(e, 'error', 'MESSAGING', 'PushProtocol', {
      msg: 'error retrieving latest message',
    });
  }
  return undefined;
};

export const getMessages = async (
  chatId: string,
  address: string,
  pushKey: string,
  threadhash?: string,
) => {
  try {
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
      limit: PUSH_PAGE_SIZE,
    });
  } catch (e) {
    notifyError(e, 'error', 'MESSAGING', 'PushProtocol', {
      msg: 'error retrieving chat history',
    });
  }
  return [];
};

// getPushUser defined here to allow for test mock
export const getPushUser = async (
  address: string,
): Promise<PushAPI.IUser | undefined> => {
  // attempt to retrieve user from cache
  const cachedUser = getLocalKey<PushAPI.IUser>(address);
  if (cachedUser) {
    return cachedUser;
  }

  try {
    // retrieve the push user
    const pushUser = await PushAPI.user.get({
      account: getAddressAccount(address),
      env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
    });
    if (pushUser) {
      setLocalKey(address, pushUser);
      return pushUser;
    }
  } catch (e) {
    notifyError(e, 'error', 'MESSAGING', 'PushProtocol', {
      msg: 'error getting push user',
    });
  }
  return undefined;
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

export const sendReaction = async (
  chatId: string,
  address: string,
  pushKey: string,
  messageId: string,
  reactionContent: string,
) => {
  const messageObj: PushAPI.Message = {
    content: reactionContent,
    type: MessageType.Reaction,
    reference: messageId,
  };
  const message = {
    account: getAddressAccount(address),
    pgpPrivateKey: pushKey,
    env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
    to: chatId,
    message: messageObj,
    messageType: messageObj.type,
    messageObj: {
      content: JSON.stringify(messageObj),
    },
  };
  const sentMessage = await PushAPI.chat.send(message);
  return sentMessage;
};

export const sendRemoteAttachment = async (
  chatId: string,
  address: string,
  pushKey: string,
  token: string,
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

  // parse and verify the w3-up token format
  const w3upToken: W3UpKey = JSON.parse(token);
  if (!w3upToken.key || !w3upToken.proof) {
    throw new Error('invalid w3-up token');
  }

  // prepare to upload the file using w3-up service
  const principal = Web3Signer.parse(w3upToken.key);
  const client = await Web3UpClient.create({principal});
  const proof = await parseW3UpProof(w3upToken.proof);
  const space = await client.addSpace(proof);
  await client.setCurrentSpace(space.did());

  // prepare the uploaded file
  const upload = new Upload(
    `${address}-${chatId}-${uploadFile.name}`,
    new Uint8Array(await uploadFile.arrayBuffer()),
  );

  // upload the file and retrieve the UUID
  const cid = await client.uploadFile(upload);
  const cidToString = cid.toString();
  const url = `https://w3s.link/ipfs/${cidToString}`;

  // send the message as embedded media
  const sentMessage = await PushAPI.chat.send({
    account: getAddressAccount(address),
    pgpPrivateKey: pushKey,
    env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
    message: {
      content: url,
      type: MessageType.Media,
    },
    to: chatId,
  });

  // wait a moment, as there seems to be a bug on the w3s IPFS gateway that results
  // in the wrong URL format (https://<cid>.ipfs.dweb.link/) to be requested if the
  // expected URL is retrieved too quickly after upload. The provided URL format is
  // correct (https://w3s.link/ipfs/<cid>), but results in a redirect on the client
  // side if used immediately in the client UX and causes a broken image link.
  await sleep(3000);
  return sentMessage;
};

export const signMessage = async (
  message: string,
  pushKey: string,
): Promise<string> => {
  return await sign({message, signingKey: pushKey});
};

export const updateBlockedList = async (
  address: string,
  pushKey: string,
  add?: string[],
  remove?: string[],
): Promise<string[]> => {
  // get current list of blocked addresses for user
  const pushUser = await PushAPI.user.get({
    account: getAddressAccount(address),
    env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
  });

  // add necessary users to blocked list
  const blockedUsers = pushUser?.profile?.blockedUsersList || [];
  if (add) {
    blockedUsers.push(...add);
  }

  // remove any necessary addresses from blocked list
  const validatedList = [...new Set(blockedUsers)]
    .map(a => fromCaip10Address(a.toLowerCase()) || '')
    .filter(a => a.length > 0)
    .filter(a => a.toLowerCase() !== address.toLowerCase())
    .filter(a => isEthAddress(a))
    .filter(
      blockedAddr =>
        !remove ||
        remove.length === 0 ||
        !remove
          .map(r => r.toLowerCase())
          .includes(fromCaip10Address(blockedAddr.toLowerCase()) || ''),
    );

  // update the protocol list with blocked users and update the
  // cached push user in local storage
  setLocalKey(
    address,
    await PushAPI.user.profile.update({
      account: getAddressAccount(address),
      pgpPrivateKey: pushKey,
      env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
      profile: {
        blockedUsersList: validatedList,
      },
    }),
  );

  // update block list reporting, which allows blocked user addresses to be
  // aggregated by the service. Action can be taken to limit usage of abusive
  // addresses reported over a given threshold.
  try {
    // list of blocked address registrations
    const blockedRegistrations =
      add?.map(a => {
        const addr = fromCaip10Address(a)?.toLowerCase();
        return {
          topic: `/push/addr-${addr}`,
          peerAddress: addr!,
          block: true,
          accept: false,
        };
      }) || [];
    // list of unblocked address registrations
    const unblockRegistrations =
      remove?.map(a => {
        const addr = fromCaip10Address(a)?.toLowerCase();
        return {
          topic: `/push/addr-${addr}`,
          peerAddress: addr!,
          block: false,
          accept: true,
        };
      }) || [];
    // batch registration of all changes to block list
    await registerClientTopics(address.toLowerCase(), [
      ...blockedRegistrations,
      ...unblockRegistrations,
    ]);
  } catch (e) {
    // graceful failure
    notifyError(e, 'error', 'MESSAGING', 'PushProtocol', {
      msg: 'unable to update block list registration',
    });
  }

  // return the aggregated blocked list
  return validatedList;
};

import type {
  Conversation,
  DecodedMessage,
  Identifier,
  Signer as XmtpSigner,
} from '@xmtp/browser-sdk';
import {Client, ConsentState, SortDirection} from '@xmtp/browser-sdk';
import type {
  Attachment,
  RemoteAttachment,
} from '@xmtp/content-type-remote-attachment';
import {
  AttachmentCodec,
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
} from '@xmtp/content-type-remote-attachment';
import {ContentTypeText} from '@xmtp/content-type-text';
import Bluebird from 'bluebird';
import type {Signer} from 'ethers';
import {filesize} from 'filesize';
import {toBytes} from 'viem';

import config from '@unstoppabledomains/config';

import {getUnstoppableConsents} from '../../../actions/messageActions';
import {notifyEvent} from '../../../lib/error';
import {sleep} from '../../../lib/sleep';
import type {ConsentPreferences} from '../../../lib/types/message';
import {
  getXmtpLocalAddress,
  getXmtpLocalKey,
  setXmtpLocalAddress,
  setXmtpLocalKey,
} from '../storage';
import {uploadAttachment} from './upload';

export interface ConversationMeta {
  conversation: Conversation;
  consentState: ConsentState;
  preview: string;
  timestamp: number;
  visible: boolean;
}

// single reference to the XMTP client for reuse
const xmtpClients: Record<string, Client> = {};
const xmtpOpts = {
  env: config.XMTP.ENVIRONMENT,
};

export const formatFileSize = (bytes: number): string => {
  return filesize(bytes, {base: 2, standard: 'jedec'}) as string;
};

export const getAddressFromInboxId = async (
  inboxId: string,
): Promise<string | undefined> => {
  const client = await getXmtpClientFromLocal();
  if (!client) {
    return undefined;
  }
  const inboxState = await client.preferences.inboxStateFromInboxIds(
    [inboxId],
    true,
  );
  if (inboxState && inboxState.length > 0) {
    return inboxState[0].accountIdentifiers.find(
      i => i.identifierKind === 'Ethereum',
    )?.identifier;
  }
  return undefined;
};

const getIdentifierFromAddress = (address: string): Identifier => {
  return {
    identifier: address,
    identifierKind: 'Ethereum',
  };
};

const getInboxIdFromIdentifier = async (
  identifier: Identifier,
): Promise<string | undefined> => {
  const xmtp = await getXmtpClientFromLocal();
  if (!xmtp) {
    return undefined;
  }
  return await xmtp.findInboxIdByIdentifier(identifier);
};

const getInboxIdFromAddress = async (
  address: string,
): Promise<string | undefined> => {
  const xmtp = await getXmtpClientFromLocal();
  if (!xmtp) {
    return undefined;
  }
  return await getInboxIdFromIdentifier(getIdentifierFromAddress(address));
};

export const getConversation = async (
  address: string,
  peerAddress: string,
): Promise<Conversation | undefined> => {
  const xmtp = await getXmtpClient(address);
  const isAvailable = await xmtp.canMessage([
    getIdentifierFromAddress(peerAddress),
  ]);
  if (!isAvailable) {
    return undefined;
  }
  const inboxId = await getInboxIdFromAddress(peerAddress);
  if (!inboxId) {
    return undefined;
  }
  return await xmtp.conversations.newDm(inboxId);
};

export const getConversationById = async (
  conversationId: string,
): Promise<Conversation> => {
  const xmtp = await getXmtpClientFromLocal();
  if (!xmtp) {
    throw new Error('no XMTP client found');
  }
  const conversation =
    await xmtp.conversations.getConversationById(conversationId);
  if (!conversation) {
    throw new Error('conversation not found');
  }
  return conversation;
};

export const getConversationPeerAddress = async (
  conversation: Conversation,
): Promise<string> => {
  const xmtpClient = await getXmtpClientFromLocal();
  if (!xmtpClient) {
    throw new Error('no XMTP client found');
  }
  const members = await conversation.members();
  const peerAddress = members
    .filter(m => m.inboxId !== xmtpClient.inboxId)
    .map(
      m =>
        m.accountIdentifiers.find(i => i.identifierKind === 'Ethereum')
          ?.identifier,
    )
    .find(m => m);
  if (!peerAddress) {
    throw new Error('no peer address found');
  }
  return peerAddress;
};

export const getConversations = async (
  address: string,
): Promise<ConversationMeta[]> => {
  const xmtp = await getXmtpClient(address);
  const chats: ConversationMeta[] = [];
  const [conversations, udConsents] = await Promise.all([
    // load conversations from XMTP network
    xmtp.conversations.list(),
    // retrieve existing UD consents
    getUnstoppableConsents(address),
  ]);

  // build a list of filtered conversations
  for (const conversation of conversations) {
    // create a default conversation metadata object
    chats.push({
      conversation,
      preview: 'New conversation',
      timestamp: 0,
      visible: true,
      consentState: ConsentState.Unknown,
    });
  }

  // Fetch latest message from conversations, which is required for proper
  // ordering of the conversation list. Since the timestamp of the most recent
  // message is not provided in the most recent list, it's necessary to get
  // the metadata for each conversation and then sort.
  await Bluebird.map(
    chats,
    async chat => {
      await Promise.all([
        // retrieve the message preview
        loadConversationPreview(chat),
        // retrieve the consent state
        loadConversationConsentState(xmtp, chat, udConsents),
      ]);
    },
    {
      concurrency: 10,
    },
  );

  // associate owner's conversation topics with their wallet address
  // TODO: AJQ future XMTP v3 work, register topics for push notifications
  /*
  await registerClientTopics(
    address,
    chats.map(chat => {
      return {
        topic: chat.conversation.id,
        peerAddress: chat.conversation.peerAddress,
      };
    }),
  );
  */

  // sort and return conversations
  return (
    chats
      // sort by newest conversation first
      .sort((a, b): number => {
        return b.timestamp - a.timestamp;
      })
  );
};

export const getRemoteAttachment = async (
  message: DecodedMessage,
): Promise<Attachment | undefined> => {
  try {
    const xmtp = await getXmtpClientFromLocal();
    if (!xmtp) {
      throw new Error('no XMTP client found');
    }
    const remoteAttachment: RemoteAttachment = message.content;
    const attachment: Attachment = await RemoteAttachmentCodec.load(
      remoteAttachment,
      xmtp,
    );
    return attachment;
  } catch (e) {
    notifyEvent(e, 'error', 'Messaging', 'XMTP', {
      msg: 'error loading remote attachment',
    });
  }
  return;
};

export const getXmtpClient = async (
  address: string,
  signer?: Signer,
): Promise<Client> => {
  // retrieve the local encryption key
  let xmtpLocalEncryptionKey = await getXmtpLocalKey(address);

  // if no local encryption key is available, create a new XMTP client
  // instance by creating a new encryption key and signing with the provided
  // wallet signer reference.
  if (!xmtpLocalEncryptionKey) {
    if (!signer) {
      throw new Error('signer is required to create a new account');
    }

    // create the new XMTP client
    xmtpLocalEncryptionKey = window.crypto.getRandomValues(new Uint8Array(32));
    const newClient = await Client.create(
      getXmtpSigner(address, signer),
      xmtpLocalEncryptionKey,
      {
        ...xmtpOpts,
      },
    );

    // store the local encryption key and address
    await setXmtpLocalKey(address, xmtpLocalEncryptionKey);
    await setXmtpLocalAddress(address);

    // store the client in memory for use
    xmtpClients[address.toLowerCase()] = newClient;
    return newClient;
  }

  // return an in-memory existing client if available
  if (xmtpClients[address.toLowerCase()]) {
    return xmtpClients[address.toLowerCase()];
  }

  // restore from locally stored encryption key with a dummy signer
  const dummySigner: XmtpSigner = {
    type: 'EOA',
    getIdentifier: () => {
      return getIdentifierFromAddress(address);
    },
    signMessage: async (message: string): Promise<Uint8Array> => {
      return new Uint8Array();
    },
  };
  return await Client.create(dummySigner, xmtpLocalEncryptionKey, {
    ...xmtpOpts,
  });
};

export const getXmtpInboxId = async (): Promise<string> => {
  const xmtp = await getXmtpClientFromLocal();
  if (!xmtp) {
    throw new Error('no XMTP client found');
  }
  const inboxId = xmtp.inboxId;
  if (!inboxId) {
    throw new Error('no inbox ID found');
  }
  return inboxId;
};

export const getXmtpSigner = (address: string, signer: Signer): XmtpSigner => {
  return {
    type: 'EOA',
    getIdentifier: () => {
      return getIdentifierFromAddress(address);
    },
    signMessage: async (message: string): Promise<Uint8Array> => {
      const signature = await signer.signMessage(message);
      return toBytes(signature);
    },
  };
};

export const getXmtpWalletAddress = async (): Promise<string> => {
  const authAddress = await getXmtpLocalAddress();
  if (!authAddress) {
    throw new Error('no auth address found');
  }
  return authAddress;
};

const getXmtpClientFromLocal = async (): Promise<Client | undefined> => {
  const authAddress = await getXmtpLocalAddress();
  if (!authAddress) {
    return undefined;
  }
  return await getXmtpClient(authAddress);
};

const getXmtpClientInboxId = async (): Promise<string | undefined> => {
  const xmtp = await getXmtpClientFromLocal();
  if (!xmtp) {
    return undefined;
  }
  return xmtp.inboxId;
};

export const initXmtpAccount = async (address: string, signer: Signer) => {
  try {
    // create a client for the first time using the wallet signer reference
    await getXmtpClient(address, signer);
  } catch (e) {
    notifyEvent(e, 'warning', 'Messaging', 'XMTP');
    throw e;
  }
};

export const isAllowListed = (address: string) => {
  return config.XMTP.CONVERSATION_ALLOW_LIST.map(a => a.toLowerCase()).includes(
    address.toLowerCase(),
  );
};

export const isXmtpUser = async (address: string): Promise<boolean> => {
  const addressIdentifier = getIdentifierFromAddress(address);
  const xmtp = await getXmtpClientFromLocal();
  if (!xmtp) {
    return false;
  }
  const canMessage = await xmtp.canMessage([addressIdentifier]);
  return Object.values(canMessage).some(Boolean);
};

// loadConversationConsentState retrieves the consent state for this conversation
export const loadConversationConsentState = async (
  xmtp: Client,
  chat: ConversationMeta,
  udConsents?: ConsentPreferences,
): Promise<ConversationMeta> => {
  // retrieve the protocol layer consent state );
  let consentState = await chat.conversation.consentState();

  // attempt to migrate UD consent state if protocol state is unknown
  if (udConsents && consentState === ConsentState.Unknown) {
    if (udConsents.accepted_topics?.includes(chat.conversation.id)) {
      // migrate existing UD allowlist entry to XMTP allowlist
      await chat.conversation.updateConsentState(ConsentState.Allowed);
      consentState = ConsentState.Allowed;
    }
    if (udConsents.blocked_topics?.includes(chat.conversation.id)) {
      // migrate existing UD blocklist entry to XMTP blocklist
      await chat.conversation.updateConsentState(ConsentState.Denied);
      consentState = ConsentState.Denied;
    }
  }

  // populate the consent state
  chat.consentState = consentState;
  return chat;
};

// loadConversationPreview retrieve latest message associated with conversation
export const loadConversationPreview = async (
  conversation: ConversationMeta,
): Promise<ConversationMeta> => {
  // retrieve conversation metadata
  const latestMessage = await conversation.conversation.messages({
    limit: 1n,
    direction: SortDirection.Descending,
  });
  conversation.timestamp =
    conversation.conversation.createdAt?.getTime() || Date.now();
  if (latestMessage && latestMessage.length > 0) {
    const message = latestMessage[0];

    // my inbox ID
    const myInboxId = await getXmtpClientInboxId();

    // set the preview text
    conversation.preview = `${
      message.senderInboxId === myInboxId ? 'You: ' : ''
    }${
      message.contentType.sameAs(ContentTypeText)
        ? message.content
        : 'Attachment'
    }`;

    // set the timestamp
    conversation.timestamp = Number(message.sentAtNs / 1000000n);
  }
  return conversation;
};

export const sendRemoteAttachment = async (
  conversation: Conversation,
  file: File,
  authDomain: string,
): Promise<DecodedMessage> => {
  // check max file size in bytes
  if (file.size > config.XMTP.MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `File must be less than ${formatFileSize(
        config.XMTP.MAX_ATTACHMENT_BYTES,
      )}`,
    );
  }

  // create an attachment object
  const attachment: Attachment = {
    filename: file.name,
    mimeType: file.type,
    data: new Uint8Array(await file.arrayBuffer()),
  };

  // encrypt the attachment
  const encryptedAttachment = await RemoteAttachmentCodec.encodeEncrypted(
    attachment,
    new AttachmentCodec(),
  );

  // upload the attachment
  const url = await uploadAttachment(
    authDomain,
    encryptedAttachment.payload,
    file.type,
  );
  if (!url) {
    throw new Error('error uploading attachment');
  }

  // create the remote attachment
  const remoteAttachment: RemoteAttachment = {
    // This is the URL string where clients can download the encrypted
    // encoded content
    url,

    // We hash the encrypted encoded payload and send that along with the
    // remote attachment. On the recipient side, clients can verify that the
    // encrypted encoded payload they've downloaded matches what was uploaded.
    // This is to prevent tampering with the content once it's been uploaded.
    contentDigest: encryptedAttachment.digest,

    // These are the encryption keys that will be used by the recipient to
    // decrypt the remote payload
    salt: encryptedAttachment.salt,
    nonce: encryptedAttachment.nonce,
    secret: encryptedAttachment.secret,

    // For now, all remote attachments MUST be fetchable via HTTPS GET requests.
    // We're investigating IPFS here among other options.
    scheme: 'https://',

    // These fields are used by clients to display some information about
    // the remote attachment before it is downloaded and decrypted.
    filename: attachment.filename,
    contentLength: attachment.data.byteLength,
  };

  // send the attachment to the conversation
  const sentMessage = await conversation.send(
    remoteAttachment,
    ContentTypeRemoteAttachment,
  );

  // wait a moment, as there seems to be a bug on the w3s IPFS gateway that results
  // in the wrong URL format (https://<cid>.ipfs.dweb.link/) to be requested if the
  // expected URL is retrieved too quickly after upload. The provided URL format is
  // correct (https://w3s.link/ipfs/<cid>), but results in a redirect on the client
  // side if used immediately in the client UX and causes a broken image link.
  await sleep(3000);

  // retrieve the message by ID
  const messageList = await conversation.messages({
    direction: SortDirection.Descending,
    limit: 5n,
  });
  const message = messageList.find(m => m.id === sentMessage);
  if (!message) {
    throw new Error('message not sent');
  }
  return message;
};

export const waitForXmtpMessages = async (
  address: string,
  callback: (data: DecodedMessage) => void,
  conversation?: Conversation,
): Promise<void> => {
  const xmtp = await getXmtpClient(address);
  if (conversation) {
    // stream a specific conversation
    for await (const message of await conversation.stream()) {
      if (!message) {
        continue;
      }
      if (message.senderInboxId !== xmtp.inboxId) {
        callback(message);
      }
    }
  } else {
    // stream all conversations
    for await (const message of await xmtp.conversations.streamAllMessages()) {
      if (!message) {
        continue;
      }
      if (message.senderInboxId !== xmtp.inboxId) {
        callback(message);
      }
    }
  }
};

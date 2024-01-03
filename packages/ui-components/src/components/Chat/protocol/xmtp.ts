import type {
  Attachment,
  RemoteAttachment,
} from '@xmtp/content-type-remote-attachment';
import {
  AttachmentCodec,
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
} from '@xmtp/content-type-remote-attachment';
import type {signature} from '@xmtp/proto';
import {fetcher} from '@xmtp/proto';
import type {
  Conversation,
  DecodedMessage,
  SignedPublicKeyBundle,
} from '@xmtp/xmtp-js';
import {
  Client,
  ContentTypeText,
  SortDirection,
  StaticKeystoreProvider,
} from '@xmtp/xmtp-js';
import Bluebird from 'bluebird';
import type {Signer} from 'ethers';
import {sha256} from 'ethers/lib/utils';
import {filesize} from 'filesize';
import {Web3Storage} from 'web3.storage';

import config from '@unstoppabledomains/config';

import {notifyError} from '../../../lib/error';
import {getXmtpLocalKey, setXmtpLocalKey} from '../storage';
import {registerClientTopics} from './registration';
import {Upload} from './upload';

export interface ConversationMeta {
  conversation: Conversation;
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

export const getConversation = async (
  address: string,
  peerAddress: string,
): Promise<Conversation | undefined> => {
  const xmtp = await getXmtpClient(address);
  const isAvailable = await xmtp.canMessage(peerAddress);
  if (!isAvailable) {
    return undefined;
  }
  return await xmtp.conversations.newConversation(peerAddress);
};

// getConversationPreview retrieve latest message associated with conversation
export const getConversationPreview = async (
  conversation: ConversationMeta,
): Promise<ConversationMeta> => {
  // retrieve conversation metadata
  const latestMessage = await conversation.conversation.messages({
    limit: 1,
    direction: SortDirection.SORT_DIRECTION_DESCENDING,
  });
  conversation.timestamp = conversation.conversation.createdAt.getTime();
  if (latestMessage && latestMessage.length > 0) {
    const message = latestMessage[0];

    // set the preview text
    conversation.preview = `${
      message.senderAddress.toLowerCase() ===
      message.conversation.clientAddress.toLowerCase()
        ? 'You: '
        : ''
    }${
      message.contentType.sameAs(ContentTypeText)
        ? message.content
        : 'Attachment'
    }`;

    // set the timestamp
    conversation.timestamp = message.sent.getTime();
  }
  return conversation;
};

export const getConversations = async (
  address: string,
): Promise<ConversationMeta[]> => {
  const xmtp = await getXmtpClient(address);
  const chats: ConversationMeta[] = [];
  const conversations = await xmtp.conversations.list();
  for (const conversation of conversations) {
    // filter self conversations
    if (conversation.peerAddress.toLowerCase() === address.toLowerCase()) {
      continue;
    }

    chats.push({
      conversation,
      preview: 'New conversation',
      timestamp: 0,
      visible: true,
    });
  }

  // Fetch latest message from conversations, which is required for proper
  // ordering of the conversation list. Since the timestamp of the most recent
  // message is not provided in the most recent list, it's necessary to get
  // the metadata for each conversation and then sort.
  await Bluebird.map(
    chats,
    async chat => {
      await getConversationPreview(chat);
    },
    {
      concurrency: 10,
    },
  );

  // associate owner's conversation topics with their wallet address
  await registerClientTopics(
    xmtp.address,
    chats.map(chat => {
      return {
        topic: chat.conversation.topic,
        peerAddress: chat.conversation.peerAddress,
      };
    }),
  );

  // sort and return conversations
  return (
    chats
      // sort by newest conversation first
      .sort((a, b): number => {
        return b.timestamp - a.timestamp;
      })
  );
};

export const getEncodedPrivateKey = (address: string): string | undefined => {
  const xmtpKey = getXmtpLocalKey(address);
  if (!xmtpKey) {
    return;
  }
  return fetcher.b64Encode(xmtpKey, 0, xmtpKey.length);
};

export const getRemoteAttachment = async (
  message: DecodedMessage,
): Promise<Attachment | undefined> => {
  try {
    const xmtp = await getXmtpClient(message.conversation.clientAddress);
    const remoteAttachment: RemoteAttachment = message.content;
    const attachment: Attachment = await RemoteAttachmentCodec.load(
      remoteAttachment,
      xmtp,
    );
    return attachment;
  } catch (e) {
    notifyError(e, {msg: 'error loading remote attachment'});
  }

  return;
};

export const getSignedPublicKey = async (
  address: string,
): Promise<SignedPublicKeyBundle> => {
  const xmtp = await getXmtpClient(address);
  return xmtp.signedPublicKeyBundle;
};

export const getXmtpClient = async (
  address: string,
  signer?: Signer,
): Promise<Client> => {
  // established local encryption keys
  let xmtpKey = getXmtpLocalKey(address);
  if (!xmtpKey) {
    if (!signer) {
      throw new Error('signer is required to create a new account');
    }
    xmtpKey = await Client.getKeys(signer, xmtpOpts);
    setXmtpLocalKey(address, xmtpKey);
  }

  // return existing client if available
  if (xmtpClients[address.toLowerCase()]) {
    return xmtpClients[address.toLowerCase()];
  }

  // create client from local encryption keys
  const xmtpClient = await Client.create(null, {
    persistConversations: true,
    privateKeyOverride: xmtpKey,
    keystoreProviders: [new StaticKeystoreProvider()],
    ...xmtpOpts,
  });
  xmtpClient.registerCodec(new AttachmentCodec());
  xmtpClient.registerCodec(new RemoteAttachmentCodec());
  xmtpClients[address.toLowerCase()] = xmtpClient;
  return xmtpClient;
};

export const initXmtpAccount = async (address: string, signer: Signer) => {
  try {
    // create a client for the first time using the wallet signer reference
    await getXmtpClient(address, signer);
  } catch (e) {
    notifyError(e, {}, 'warning');
    throw e;
  }
};

export const isAcceptedTopic = (
  topic: string,
  acceptedTopics: string[],
): boolean => {
  return acceptedTopics.includes('*') || acceptedTopics.includes(topic);
};

export const isXmtpUser = async (address: string): Promise<boolean> => {
  return await Client.canMessage(address, xmtpOpts);
};

export const sendRemoteAttachment = async (
  conversation: Conversation,
  file: File,
  apiKey: string,
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

  // upload the attachment somewhere and get a URL
  const web3Storage = new Web3Storage({
    token: apiKey,
  });
  const upload = new Upload(
    'XMTPEncryptedContent',
    encryptedAttachment.payload,
  );
  const cid = await web3Storage.put([upload]);
  const url = `https://${cid}.ipfs.w3s.link/XMTPEncryptedContent`;

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
  return await conversation.send(remoteAttachment, {
    contentType: ContentTypeRemoteAttachment,
    contentFallback: `Attachment: ${file.name} (${formatFileSize(file.size)})`,
  });
};

export const signMessage = async (
  walletAddress: string,
  message: string,
): Promise<signature.Signature> => {
  const xmtp = await getXmtpClient(walletAddress);
  return await xmtp.keystore.signDigest({
    digest: new TextEncoder().encode(sha256(new TextEncoder().encode(message))),
    identityKey: undefined,
    prekeyIndex: 0,
  });
};

export const waitForXmtpMessages = async (
  address: string,
  callback: (data: DecodedMessage) => void,
  conversation?: Conversation,
): Promise<void> => {
  const xmtp = await getXmtpClient(address);
  if (conversation) {
    // stream a specific conversation
    for await (const message of await conversation.streamMessages()) {
      if (message.senderAddress.toLowerCase() !== xmtp.address.toLowerCase()) {
        callback(message);
      }
    }
  } else {
    // stream all conversations
    for await (const message of await xmtp.conversations.streamAllMessages()) {
      if (message.senderAddress.toLowerCase() !== xmtp.address.toLowerCase()) {
        callback(message);
      }
    }
  }
};

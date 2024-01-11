import * as Web3Signer from '@ucanto/principal/ed25519';
import * as Web3UpClient from '@web3-storage/w3up-client';
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
  ConsentState,
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

import config from '@unstoppabledomains/config';

import {getUnstoppableConsents} from '../../../actions';
import type {ConsentPreferences} from '../../../lib';
import {notifyError} from '../../../lib/error';
import {sleep} from '../../../lib/sleep';
import {getXmtpLocalKey, setXmtpLocalKey} from '../storage';
import {registerClientTopics} from './registration';
import type {W3UpKey} from './types';
import {Upload, parseW3UpProof} from './upload';

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
    // retrieve XMTP protocol consents
    xmtp.contacts.refreshConsentList(),
  ]);

  // build a list of filtered conversations
  for (const conversation of conversations) {
    // filter self conversations
    if (conversation.peerAddress.toLowerCase() === address.toLowerCase()) {
      continue;
    }

    // create a default conversation metadata object
    chats.push({
      conversation,
      preview: 'New conversation',
      timestamp: 0,
      visible: true,
      consentState: 'unknown',
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

export const isXmtpUser = async (address: string): Promise<boolean> => {
  return await Client.canMessage(address, xmtpOpts);
};

// loadConversationConsentState retrieves the consent state for this conversation
export const loadConversationConsentState = async (
  xmtp: Client,
  chat: ConversationMeta,
  udConsents?: ConsentPreferences,
): Promise<ConversationMeta> => {
  // retrieve the protocol layer consent state
  let consentState = xmtp.contacts.consentState(chat.conversation.peerAddress);

  // attempt to migrate UD consent state if protocol state is unknown
  if (udConsents && consentState === 'unknown') {
    if (udConsents.accepted_topics?.includes(chat.conversation.topic)) {
      // migrate existing UD allowlist entry to XMTP allowlist
      await chat.conversation.allow();
      consentState = 'allowed';
    }
    if (udConsents.blocked_topics?.includes(chat.conversation.topic)) {
      // migrate existing UD blocklist entry to XMTP blocklist
      await chat.conversation.deny();
      consentState = 'denied';
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

export const sendRemoteAttachment = async (
  conversation: Conversation,
  file: File,
  token: string,
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

  // encrypt the uploaded file
  const upload = new Upload(
    'XMTPEncryptedContent',
    encryptedAttachment.payload,
  );

  // upload the file and retrieve the UUID
  const cid = await client.uploadFile(upload);
  const cidToString = cid.toString();
  const url = `https://w3s.link/ipfs/${cidToString}`;

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
  const sentMessage = await conversation.send(remoteAttachment, {
    contentType: ContentTypeRemoteAttachment,
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

export const PUSH_CHAT_APP = 'push chat';

export enum MessagingSignatureType {
  ExistingUser = 'existingUser',
  MissingChannels = 'existingUserMissingChannels',
  NewUser = 'newUser',
  NoPrimaryDomain = 'noPrimaryDomain',
}

export enum ConfigurationState {
  Initial = 'initial',
  RegisterPush = 'push',
  RegisterXmtp = 'xmtp',
  QuerySubscriptions = 'query',
  Complete = 'complete',
}

export enum TabType {
  Chat = 'chat',
  Communities = 'communities',
  Notification = 'notification',
}

export const ChatModalQueryString = 'open-chat-window';

export const getCaip10Address = (address: string): string => {
  if (!address.startsWith('eip155')) {
    address = `eip155:${address}`;
  }
  return address.replace('eip155:', 'eip155:1:');
};

export const fromCaip10Address = (caip10?: string): string | undefined => {
  const parts = caip10?.split(':');
  if (parts && parts.length > 0) {
    return parts[parts.length - 1];
  }
  return undefined;
};

export interface PushNotification {
  payload_id: number;
  sender: string;
  epoch: string;
  payload: Payload;
  source: string;
}

export interface Payload {
  data: PayloadData;
  recipients: string;
  notification: Notification;
  verificationProof: string;
}

export interface PayloadData {
  app: string;
  sid: string;
  url: string;
  acta: string;
  aimg: string;
  amsg: string;
  asub: string;
  icon: string;
  type: number;
  epoch: string;
  hidden: string;
  silent: string;
  additionalMeta: string;
}

export interface Notification {
  body: string;
  title: string;
}

export interface AddressResolution {
  address: string;
  name?: string;
  avatarUrl?: string;
}

export interface TopicRegistration {
  topic: string;
  peerAddress: string;
  signature: string;
}

export interface InitChatOptions {
  skipXmtp?: boolean;
  skipPush?: boolean;
}

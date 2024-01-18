export type Reaction = {
  messageId: string;
  senderAddress: string;
  displayName?: string;
  content: string;
};

export type W3UpKey = {
  key: string;
  proof: string;
};

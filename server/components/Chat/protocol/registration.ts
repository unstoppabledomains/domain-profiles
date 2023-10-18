import {fetcher} from '@xmtp/proto';
import {Signature} from '@xmtp/xmtp-js';
import {registerXmtpTopic} from 'actions/messageActions';
import Bluebird from 'bluebird';

import type {TopicRegistration} from '../types';
import {getSignedPublicKey, signMessage} from './xmtp';

export interface TopicMetadata {
  topic: string;
  peerAddress: string;
  accept?: boolean;
  block?: boolean;
}

export const registerClientTopics = async (
  address: string,
  topics: TopicMetadata[],
): Promise<void> => {
  // the signed public key is common to all the signatures
  const signedPublicKey = await getSignedPublicKey(address);

  // iterate topics to create a list of registrations, which must be
  // serialized to base64 before being transmitted to an API endpoint.
  const registrations: TopicRegistration[] = await Bluebird.map(
    topics,
    async topicMetadata => {
      const signatureBytes = new Signature(
        await signMessage(address, topicMetadata.topic),
      ).toBytes();
      return {
        accept: topicMetadata.accept,
        block: topicMetadata.block,
        peerAddress: topicMetadata.peerAddress,
        topic: topicMetadata.topic,
        signature: fetcher.b64Encode(signatureBytes, 0, signatureBytes.length),
      };
    },
    {
      concurrency: 3,
    },
  );

  // send to message service API endpoint
  await registerXmtpTopic(
    address,
    fetcher.b64Encode(
      signedPublicKey.toBytes(),
      0,
      signedPublicKey.toBytes().length,
    ),
    registrations,
  );
};

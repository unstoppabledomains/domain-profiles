import {signMessage} from 'components/Chat/protocol/push';
import type {TopicRegistration} from 'components/Chat/types';
import {fetchApi} from 'lib/fetchApi';
import type {SerializedCryptoWalletBadge} from 'lib/types/badge';
import type {SendMessageParams} from 'lib/types/message';

import config from '@unstoppabledomains/config';

export const sendBadgeMessage = async (params: SendMessageParams) => {
  return await fetchApi(`/push/notification/badge`, {
    method: 'POST',
    mode: 'cors',
    host: config.MESSAGING.HOST_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': params.domain,
      'x-auth-expires': params.expiry,
      'x-auth-signature': params.signature,
    },
    body: JSON.stringify(params.body),
  });
};

export const isAddressSpam = async (address: string): Promise<boolean> => {
  const spamData = await fetchApi(
    `${config.MESSAGING.HOST_URL}/xmtp/spam/${address}`,
    {host: config.MESSAGING.HOST_URL},
  );
  return spamData.isSpam === true;
};

export const joinBadgeGroupChat = async (
  badgeCode: string,
  userAddress: string,
  pushKey: string,
  leave?: boolean,
): Promise<SerializedCryptoWalletBadge | undefined> => {
  const signedBadgeCode = await signMessage(badgeCode, pushKey);
  const badgeData = await fetchApi(`/push/group/${leave ? 'leave' : 'join'}`, {
    method: 'POST',
    host: config.MESSAGING.HOST_URL,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      badgeCode,
      address: userAddress,
      signature: signedBadgeCode,
    }),
  });
  if (!badgeData) {
    throw new Error('Unable to join group');
  }
  return badgeData;
};

export type queryGet = {
  domain: string;
};

export const registerXmtpTopic = async (
  ownerAddress: string,
  signedPublicKey: string,
  registrations: TopicRegistration[],
): Promise<number> => {
  const responseJson = await fetchApi(`/xmtp/topics/register`, {
    method: 'POST',
    host: config.MESSAGING.HOST_URL,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      ownerAddress,
      signedPublicKey,
      registrations,
    }),
  });
  if (!responseJson) {
    return 0;
  }
  return responseJson.success;
};

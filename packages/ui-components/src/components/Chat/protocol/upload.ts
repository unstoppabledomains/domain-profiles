import {fetcher} from '@xmtp/proto';

import config from '@unstoppabledomains/config';

import {notifyEvent} from '../../../lib/error';
import {fetchApi} from '../../../lib/fetchApi';
import type {
  SerializedAttachmentResponse} from '../../../lib/types/domain';
import {
  getDomainSignatureExpiryKey,
  getDomainSignatureValueKey,
} from '../../../lib/types/domain';
import {localStorageWrapper} from '../storage';

export const uploadAttachment = async (
  domain: string,
  data: Uint8Array,
  type: string,
): Promise<string | undefined> => {
  try {
    // retrieve local signature information for this domain
    const sigExpiry = await localStorageWrapper.getItem(
      getDomainSignatureExpiryKey(domain),
    );
    const sigContent = await localStorageWrapper.getItem(
      getDomainSignatureValueKey(domain),
    );
    if (!sigExpiry || !sigContent) {
      notifyEvent(
        new Error('upload auth required'),
        'warning',
        'Messaging',
        'Authorization',
        {msg: 'domain not authorized', meta: {domain}},
      );
      return undefined;
    }

    // prepare the attachment content
    const attachment = {
      base64: fetcher.b64Encode(data, 0, data.length),
      type,
    };

    const responseJSON = await fetchApi<SerializedAttachmentResponse>(
      `/user/${domain}/attachment`,
      {
        host: config.PROFILE.HOST_URL,
        mode: 'cors',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-auth-domain': domain,
          'x-auth-expires': sigExpiry,
          'x-auth-signature': sigContent,
        },
        body: JSON.stringify({
          attachment,
        }),
      },
    );

    // set user profile data from result
    if (responseJSON?.url) {
      return responseJSON.url;
    }
  } catch (e) {
    notifyEvent(e, 'warning', 'Messaging', 'Fetch', {
      msg: 'error uploading attachment',
      meta: {domain},
    });
  }

  return undefined;
};

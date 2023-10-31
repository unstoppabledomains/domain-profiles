import * as PushAPI from '@pushprotocol/restapi';
import {ENV} from '@pushprotocol/restapi/src/lib/constants';
import {useCallback, useState} from 'react';

import config from '@unstoppabledomains/config';

import type {PushNotification} from '../types';

interface fetchNotification {
  page: number;
  limit: number;
  spam?: boolean;
}

const useFetchNotifications = (account: string) => {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = useCallback(
    async ({page, limit, spam = false}: fetchNotification) => {
      setLoading(true);
      try {
        const rawData: PushNotification[] = await PushAPI.user.getFeeds({
          user: account, // user address in CAIP
          raw: true,
          page,
          spam,
          limit,
          env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
        });
        return rawData.map(v => {
          const d = v.payload.data;
          if (d.additionalMeta) {
            const partnerData = parsePartnerMetadata(d.additionalMeta);
            d.icon = partnerData.logoUri || d.icon;
            d.app = partnerData.name || d.app;
            d.asub = partnerData.name
              ? d.asub.replace(`${partnerData.name}:`, '').trim()
              : d.asub;
          }
          return d;
        });
      } catch (e) {
        setLoading(false);
        setError(String(e));
        return;
      } finally {
        setLoading(false);
      }
    },
    [account],
  );

  return {fetchNotifications, error, loading};
};

export const parsePartnerMetadata = (data: string) => {
  try {
    const parsedMetadata = JSON.parse(data);
    if (parsedMetadata?.partner) {
      return parsedMetadata.partner;
    }
  } catch (e) {}
  return undefined;
};

export default useFetchNotifications;

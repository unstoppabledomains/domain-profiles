import {fetchApi} from 'lib/fetchApi';
import type {DomainNotificationConfiguration} from 'lib/types/message';
import type {MetadataDomainsRecordsResponse} from 'lib/types/records';
import QueryString from 'qs';

export const getMetadataDomainsRecords = async (query: {
  domains: string[];
  key?: string;
}): Promise<MetadataDomainsRecordsResponse> => {
  const response = await fetchApi(
    `/metadata/records?${QueryString.stringify(query)}`,
  );
  return response.json();
};

export const getNotificationConfigurations = async (
  domain: string,
): Promise<DomainNotificationConfiguration[]> => {
  // TODO need to implement on profile API
  //return fetchApi(`/user/domains/${query.domain}/notification-configurations`);
  return [];
};

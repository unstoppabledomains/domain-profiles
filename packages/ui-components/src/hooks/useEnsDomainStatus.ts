import {useQuery} from 'react-query';

import {getEnsDomainStatus} from '../actions/domainActions';

export const useEnsDomainStatus = (
  domain: string,
  enabled: boolean = false,
) => {
  return useQuery(
    ['ens-domain-status', domain],
    () => getEnsDomainStatus(domain),
    {enabled},
  );
};

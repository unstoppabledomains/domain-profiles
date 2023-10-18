import {getEnsDomainStatus} from 'actions/domainActions';
import {useQuery} from 'react-query';

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

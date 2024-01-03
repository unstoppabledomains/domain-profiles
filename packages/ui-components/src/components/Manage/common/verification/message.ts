// getSignatureMessage generates a message linking the secondary wallet with
// the domain. Contents are important, and must include the secondary wallet
// address, chain type and the domain name being linked. Once this is signed
// with the secondary wallet private key, we (or a dApp) can verify the signed
// message and cross reference the domain->secondary address that is written
import {getVerificationMessage} from '../../../../actions';

// to the blockchain to ensure the link is authorized by the domain owner.
export const getSignatureMessage = async (
  domain: string,
  currency: string,
  address: string,
): Promise<string> => {
  return await getVerificationMessage(domain, currency);
};

import {getReverseResolution} from 'actions/domainActions';
import {DomainProfileKeys} from 'lib/types/domain';
import type {LoginResult} from 'lib/types/wallet';
import {getUAuth} from 'lib/uauth';

import config from '@unstoppabledomains/config';

export const loginWithAddress = async (
  address?: string,
): Promise<LoginResult> => {
  try {
    // define the result placeholder
    const loginResult: LoginResult = {
      address: '',
      domain: '',
    };

    if (address) {
      // wait for wallet connection
      loginResult.address = address;
      loginResult.domain =
        (await getReverseResolution(loginResult.address)) || 'Wallet';
    } else {
      // complete the login with UD flow
      const uauth = await getUAuth({
        clientId: config.LOGIN_WITH_UNSTOPPABLE.CLIENT_ID,
        redirectUri: config.LOGIN_WITH_UNSTOPPABLE.REDIRECT_URI,
      });
      const authorization = await uauth.loginWithPopup();
      if (!authorization.idToken.wallet_address) {
        throw new Error('wallet address not provided in claims');
      }

      // determine the user's primary domain (if available)
      loginResult.address = authorization.idToken.wallet_address;
      loginResult.domain =
        (await getReverseResolution(loginResult.address)) ||
        authorization.idToken.sub;
    }

    // validate login was successful
    if (!loginResult.address || !loginResult.domain) {
      throw new Error('unable to login');
    }

    // store the domain to be displayed in the UX, defaulting to the
    // user's primary domain if available and falling back to the one
    // provided at login time if not available
    localStorage.setItem(DomainProfileKeys.AuthDomain, loginResult.domain);
    localStorage.setItem(DomainProfileKeys.AuthAddress, loginResult.address);

    // return the login result
    return loginResult;
  } catch (loginError) {
    console.error('login error', loginError);
    throw loginError;
  }
};

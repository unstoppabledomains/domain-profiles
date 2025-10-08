import truncateEthAddress from 'truncate-eth-address';

import config from '@unstoppabledomains/config';

import {getProfileReverseResolution} from '../../actions';
import {localStorageWrapper} from '../../components/Chat/storage';
import {DomainProfileKeys} from '../../lib/types/domain';
import type {LoginResult} from '../../lib/types/wallet';
import {getUAuth} from '../../lib/uauth';
import {notifyEvent} from '../error';

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
      loginResult.address = address.toLowerCase();
      loginResult.domain =
        (await getProfileReverseResolution(loginResult.address))?.name ||
        truncateEthAddress(address);
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
      loginResult.address = authorization.idToken.wallet_address.toLowerCase();
      loginResult.domain =
        (await getProfileReverseResolution(loginResult.address))?.name ||
        authorization.idToken.sub;
    }

    // validate login was successful
    if (!loginResult.address || !loginResult.domain) {
      throw new Error('unable to login');
    }

    // store the domain to be displayed in the UX, defaulting to the
    // user's primary domain if available and falling back to the one
    // provided at login time if not available
    await localStorageWrapper.setItem(
      DomainProfileKeys.AuthDomain,
      loginResult.domain.toLowerCase(),
    );
    await localStorageWrapper.setItem(
      DomainProfileKeys.AuthAddress,
      loginResult.address.toLowerCase(),
    );

    // return the login result
    return loginResult;
  } catch (loginError) {
    notifyEvent(loginError, 'error', 'Profile', 'Authorization', {
      msg: 'login error',
    });
    throw loginError;
  }
};

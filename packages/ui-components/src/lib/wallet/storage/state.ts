import {getAccountAssets} from '../../../actions/fireBlocksActions';
import {getBlockchainName} from '../../../components/Manage/common/verification/types';
import {notifyEvent} from '../../error';
import type {CustodyWallet} from '../../types';
import type {BootstrapState} from '../../types/fireBlocks';
import {
  BootstrapStateCurrentKey,
  BootstrapStatePrefix,
} from '../../types/fireBlocks';

export const getAccountIdFromBootstrapState = (
  state?: BootstrapState,
): string | undefined => {
  if (!state?.assets || state.assets.length === 0) {
    return undefined;
  }
  if (!state.assets[0].accountId) {
    return undefined;
  }
  return state.assets[0].accountId;
};

export const getBootstrapState = (
  state: Record<string, Record<string, string>>,
): BootstrapState | undefined => {
  const v = state[`${BootstrapStatePrefix}-${BootstrapStateCurrentKey}`];
  if (v) {
    return v as unknown as BootstrapState;
  }
  return undefined;
};

export const saveBootstrapState = async (
  values: BootstrapState,
  state: Record<string, Record<string, string>>,
  saveState: (
    state: Record<string, Record<string, string>>,
  ) => void | Promise<void>,
  accessToken?: string,
): Promise<BootstrapState> => {
  try {
    // saturate values if required
    if (accessToken && (!values.assets || values.assets.length === 0)) {
      values.assets = (await getAccountAssets(accessToken)) || [];
    }

    // save the state values
    state[`${BootstrapStatePrefix}-${BootstrapStateCurrentKey}`] =
      values as unknown as Record<string, string>;
    await saveState({...state});

    // return the resulting state
    return values;
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Configuration', {
      msg: 'error saving bootstrap state',
      meta: {values},
    });
    throw e;
  }
};

export const saveMpcCustodyState = async (
  state: Record<string, Record<string, string>>,
  saveState: (
    state: Record<string, Record<string, string>>,
  ) => void | Promise<void>,
  w: CustodyWallet,
  secret?: string,
) => {
  // initialize empty address map if necessary
  if (!w.addresses) {
    w.addresses = {};
  }
  // update bootstrap state with custody wallet data. The fireblocks
  // data will remain empty until the user takes custody
  await saveBootstrapState(
    {
      bootstrapToken: '',
      refreshToken: '',
      assets: Object.entries(w.addresses).map(addressEntry => ({
        '@type': w!.state,
        id: addressEntry[0],
        address: addressEntry[1],
        blockchainAsset: {
          '@type': w!.state,
          id: addressEntry[0],
          name: getBlockchainName(addressEntry[0]),
          symbol: addressEntry[0],
          blockchain: {
            id: addressEntry[0],
            name: getBlockchainName(addressEntry[0]),
          },
        },
      })),
      custodyState: {
        ...w,
        secret,
      },
    },
    state,
    saveState,
  );
};

import {getAccountAssets} from '../../../actions/fireBlocksActions';
import {notifyEvent} from '../../error';
import type {BootstrapState} from '../../types/fireBlocks';
import {
  BootstrapStateCurrentKey,
  BootstrapStatePrefix,
} from '../../types/fireBlocks';

export const getBootstrapState = (
  state: Record<string, Record<string, string>>,
  deviceId = BootstrapStateCurrentKey,
): BootstrapState | undefined => {
  const v = state[`${BootstrapStatePrefix}-${deviceId}`];
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
    if (values.deviceId) {
      state[`${BootstrapStatePrefix}-${values.deviceId}`] =
        values as unknown as Record<string, string>;
    }
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

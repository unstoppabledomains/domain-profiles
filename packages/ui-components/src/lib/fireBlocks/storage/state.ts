import {getAccountAssets} from '../../../actions/fireBlocksActions';
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
  setState: (state: Record<string, Record<string, string>>) => void,
  accessToken: string,
): Promise<void> => {
  // saturate values if required
  if (!values.assets || values.assets.length === 0) {
    values.assets = (await getAccountAssets(accessToken)) || [];
  }

  // save the state values
  state[`${BootstrapStatePrefix}-${values.deviceId}`] =
    values as unknown as Record<string, string>;
  state[`${BootstrapStatePrefix}-${BootstrapStateCurrentKey}`] =
    values as unknown as Record<string, string>;
  setState({...state});
};

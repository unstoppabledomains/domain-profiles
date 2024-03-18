import type {BootstrapState} from '../../types/fireBlocks';
import {
  BootstrapStateCurrentKey,
  BootstrapStatePrefix,
} from '../../types/fireBlocks';

export const getState = (
  state: Record<string, Record<string, string>>,
  deviceId = BootstrapStateCurrentKey,
): BootstrapState | undefined => {
  const v = state[`${BootstrapStatePrefix}-${deviceId}`];
  if (v) {
    return v as unknown as BootstrapState;
  }
  return undefined;
};

export const saveState = (
  values: BootstrapState,
  state: Record<string, Record<string, string>>,
  setState: (state: Record<string, Record<string, string>>) => void,
): void => {
  state[`${BootstrapStatePrefix}-${values.deviceId}`] =
    values as unknown as Record<string, string>;
  state[`${BootstrapStatePrefix}-${BootstrapStateCurrentKey}`] =
    state[`${BootstrapStatePrefix}-${values.deviceId}`];
  setState({...state});
};

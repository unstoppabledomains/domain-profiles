import type {ImmutableArray} from '@unstoppabledomains/config/build/src/env/types';

import type {SerializedWalletBalance} from '../types';

export const filterWallets = (
  wallets: SerializedWalletBalance[],
  filter: ImmutableArray<string>,
): SerializedWalletBalance[] => {
  return wallets.filter(w =>
    filter
      .map(f => f.toUpperCase())
      .includes(`${w.symbol?.toUpperCase()}/${w.gasCurrency?.toUpperCase()}`),
  );
};

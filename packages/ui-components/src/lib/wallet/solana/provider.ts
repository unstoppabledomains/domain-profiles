import {Connection} from '@solana/web3.js';

import config from '@unstoppabledomains/config';

export const getSolanaProvider = (
  ownerAddress: string,
  accessToken: string,
) => {
  return new Connection(
    `${config.PROFILE.HOST_URL}/user/${ownerAddress}/wallet/rpc?symbol=SOL`,
    {
      commitment: 'confirmed',
      httpHeaders: {
        ['Authorization']: `Bearer ${accessToken}`,
      },
    },
  );
};

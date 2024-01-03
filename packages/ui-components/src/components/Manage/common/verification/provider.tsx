import type {ReactElement} from 'react';
import React from 'react';

import {BitcoinVerificationButton} from './bitcoin/VerificationButton';
import {EvmVerificationButton} from './evm/VerificationButton';
import {SolanaVerificationButton} from './solana/VerificationButton';
import type {VerificationProps} from './types';

export const getVerificationProvider = (
  props: VerificationProps,
): ReactElement => {
  switch (props.currency) {
    case 'SOL':
      return (
        <SolanaVerificationButton
          address={props.address}
          currency={props.currency}
          domain={props.domain}
          setVerified={props.setVerified}
          setWeb3Deps={props.setWeb3Deps}
        ></SolanaVerificationButton>
      );
    case 'ETH':
    case 'MATIC':
    case 'FTM':
    case 'AVAX':
      return (
        <EvmVerificationButton
          address={props.address}
          currency={props.currency}
          domain={props.domain}
          setVerified={props.setVerified}
          setWeb3Deps={props.setWeb3Deps}
        ></EvmVerificationButton>
      );
    case 'BTC':
      return (
        <BitcoinVerificationButton
          address={props.address}
          currency={props.currency}
          domain={props.domain}
          setVerified={props.setVerified}
          setWeb3Deps={props.setWeb3Deps}
        ></BitcoinVerificationButton>
      );
    default:
      return <div></div>;
  }
};

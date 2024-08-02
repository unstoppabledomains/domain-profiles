import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {AccessWalletModal} from '.';
import {useWeb3Context} from '../../hooks';
import type {Web3Dependencies} from '../../lib';
import {isDomainValidForManagement} from '../../lib';
import type {DomainProfileTabType} from '../Manage';
import type {ManageTabProps} from '../Manage/common/types';
import {Configuration, WalletConfigState} from './Configuration';
import {Header} from './Header';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const Wallet: React.FC<
  ManageTabProps & {
    emailAddress?: string;
    avatarUrl?: string;
    recoveryToken?: string;
    showMessages?: boolean;
    mode?: WalletMode;
    setAuthAddress?: (v: string) => void;
    isNewUser?: boolean;
  }
> = ({
  emailAddress,
  address,
  domain,
  avatarUrl,
  recoveryToken,
  showMessages,
  mode = 'basic',
  isNewUser,
  onUpdate,
  setAuthAddress,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>();
  const [isWeb3DepsLoading, setIsWeb3DepsLoading] = useState(true);
  const [isHeaderClicked, setIsHeaderClicked] = useState(false);
  const [accessToken, setAccessToken] = useState<string>();
  const {setWeb3Deps} = useWeb3Context();

  const handleWalletLoaded = (v: boolean) => {
    setIsLoaded(v);
  };

  const handleAccessWalletComplete = async (
    web3Dependencies?: Web3Dependencies,
  ) => {
    // handle the provided deps if provided
    if (web3Dependencies) {
      setWeb3Deps(web3Dependencies);
    }
    setIsWeb3DepsLoading(false);
  };

  const handleAccessToken = (
    t: DomainProfileTabType,
    v: {accessToken: string},
  ) => {
    setAccessToken(v.accessToken);
    onUpdate(t, v);
  };

  return (
    <Box className={classes.container}>
      <Header
        mode={mode}
        isLoaded={isLoaded}
        isFetching={isFetching}
        avatarUrl={avatarUrl}
        showMessages={showMessages}
        address={address}
        accessToken={accessToken}
        emailAddress={emailAddress}
        onHeaderClick={() => setIsHeaderClicked(true)}
        domain={isDomainValidForManagement(domain) ? domain : undefined}
      />
      <Configuration
        mode={mode}
        emailAddress={emailAddress}
        address={address}
        domain={domain}
        recoveryToken={recoveryToken}
        onLoaded={handleWalletLoaded}
        onUpdate={handleAccessToken}
        setButtonComponent={setButtonComponent}
        setIsFetching={setIsFetching}
        isHeaderClicked={isHeaderClicked}
        setIsHeaderClicked={setIsHeaderClicked}
        setAuthAddress={setAuthAddress}
        initialState={
          isNewUser ? WalletConfigState.OnboardWithEmail : undefined
        }
      />
      {isLoaded && isWeb3DepsLoading && (
        <AccessWalletModal
          prompt={true}
          address={address}
          onComplete={deps => handleAccessWalletComplete(deps)}
          open={isWeb3DepsLoading}
          onClose={() => setIsWeb3DepsLoading(false)}
          isMpcWallet={true}
          isMpcPromptDisabled={true}
        />
      )}
    </Box>
  );
};

export type WalletMode = 'basic' | 'portfolio';

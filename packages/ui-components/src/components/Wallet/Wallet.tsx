import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {isDomainValidForManagement} from '../../lib';
import type {DomainProfileTabType} from '../Manage';
import type {ManageTabProps} from '../Manage/common/types';
import {Configuration, WalletConfigState} from './Configuration';
import {Header} from './Header';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
}));

export const Wallet: React.FC<
  ManageTabProps & {
    emailAddress?: string;
    avatarUrl?: string;
    recoveryPhrase?: string;
    recoveryToken?: string;
    showMessages?: boolean;
    mode?: WalletMode;
    disableInlineEducation?: boolean;
    setAuthAddress?: (v: string) => void;
    onLoginInitiated?: (emailAddress: string, password: string) => void;
    onLogout?: () => void;
    isNewUser?: boolean;
  }
> = ({
  emailAddress,
  address,
  domain,
  avatarUrl,
  recoveryPhrase,
  recoveryToken,
  showMessages,
  mode = 'basic',
  disableInlineEducation,
  isNewUser,
  onUpdate,
  onLoginInitiated,
  onLogout,
  setAuthAddress,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>();
  const [isHeaderClicked, setIsHeaderClicked] = useState(false);
  const [accessToken, setAccessToken] = useState<string>();

  const handleWalletLoaded = (v: boolean) => {
    setIsLoaded(v);
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
        onLogout={onLogout}
        domain={isDomainValidForManagement(domain) ? domain : undefined}
      />
      <Configuration
        mode={mode}
        emailAddress={emailAddress}
        recoveryPhrase={recoveryPhrase}
        address={address}
        domain={domain}
        recoveryToken={recoveryToken}
        onLoaded={handleWalletLoaded}
        onLoginInitiated={onLoginInitiated}
        onUpdate={handleAccessToken}
        setButtonComponent={setButtonComponent}
        setIsFetching={setIsFetching}
        isHeaderClicked={isHeaderClicked}
        setIsHeaderClicked={setIsHeaderClicked}
        setAuthAddress={setAuthAddress}
        disableInlineEducation={disableInlineEducation}
        initialState={
          isNewUser ? WalletConfigState.OnboardWithEmail : undefined
        }
      />
    </Box>
  );
};

export type WalletMode = 'basic' | 'portfolio';

import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {AccessWalletModal} from '.';
import {useFireblocksState, useWeb3Context} from '../../hooks';
import type {Web3Dependencies} from '../../lib';
import {
  CustodyState,
  getBootstrapState,
  isDomainValidForManagement,
  useTranslationContext,
} from '../../lib';
import type {DomainProfileTabType} from '../Manage';
import type {ManageTabProps} from '../Manage/common/types';
import Modal from '../Modal';
import ClaimWalletModal from './ClaimWalletModal';
import {Header} from './Header';
import {WalletConfigState, WalletProvider} from './WalletProvider';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  modalTitleStyle: {
    color: 'inherit',
    alignSelf: 'center',
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
    disableBasicHeader?: boolean;
    fullScreenModals?: boolean;
    forceRememberOnDevice?: boolean;
    isNewUser?: boolean;
    loginClicked?: boolean;
    setAuthAddress?: (v: string) => void;
    onLoginInitiated?: (emailAddress: string, password: string) => void;
    onError?: () => void;
    onLogout?: () => void;
    onDisconnect?: () => void;
    onClaimComplete?: (emailAddress: string, password: string) => void;
    onSettingsClick?: () => void;
    onMessagesClick?: () => void;
    onMessagePopoutClick?: (address?: string) => void;
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
  disableBasicHeader,
  isNewUser,
  loginClicked,
  fullScreenModals,
  forceRememberOnDevice,
  onUpdate,
  onError,
  onLoginInitiated,
  onLogout,
  onClaimComplete,
  onDisconnect,
  onSettingsClick,
  onMessagesClick,
  onMessagePopoutClick,
  setAuthAddress,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [state] = useFireblocksState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>();
  const [isCustodyWallet, setIsCustodyWallet] = useState<boolean>();
  const [isWeb3DepsLoading, setIsWeb3DepsLoading] = useState(true);
  const [isHeaderClicked, setIsHeaderClicked] = useState(false);
  const [showClaimWalletModal, setShowClaimWalletModal] = useState<boolean>();
  const [accessToken, setAccessToken] = useState<string>();
  const {setWeb3Deps} = useWeb3Context();

  const handleWalletLoaded = async (v: boolean) => {
    const bootstrapState = getBootstrapState(state);
    if (bootstrapState?.custodyState?.state === CustodyState.CUSTODY) {
      setIsCustodyWallet(true);
      if (setAuthAddress) {
        setAuthAddress(config.UNSTOPPABLE_CONTRACT_ADDRESS);
      }
    }
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
    tab: DomainProfileTabType,
    data: {accessToken: string},
  ) => {
    setAccessToken(data.accessToken);
    onUpdate(tab, data);
  };

  const handleClaimWallet = () => {
    setShowClaimWalletModal(true);
  };

  const handleClaimComplete = (email: string, password: string) => {
    if (onClaimComplete) {
      onClaimComplete(email, password);
    } else {
      handleClaimModalClose();
    }
  };

  const handleClaimModalClose = () => {
    setShowClaimWalletModal(false);
  };

  return (
    <Box className={classes.container}>
      {(mode !== 'basic' || !disableBasicHeader) && (
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
          onDisconnect={onDisconnect}
          onSettingsClick={onSettingsClick}
          onMessagesClick={onMessagesClick}
          onMessagePopoutClick={onMessagePopoutClick}
          onClaimWalletClick={accessToken ? undefined : handleClaimWallet}
          fullScreenModals={fullScreenModals}
          domain={isDomainValidForManagement(domain) ? domain : undefined}
        />
      )}
      <WalletProvider
        mode={mode}
        emailAddress={emailAddress}
        recoveryPhrase={recoveryPhrase}
        address={address}
        domain={domain}
        recoveryToken={recoveryToken}
        onError={onError}
        onLoaded={handleWalletLoaded}
        onLoginInitiated={onLoginInitiated}
        onUpdate={handleAccessToken}
        onClaimWallet={handleClaimWallet}
        setButtonComponent={setButtonComponent}
        setIsFetching={setIsFetching}
        isHeaderClicked={isHeaderClicked}
        setIsHeaderClicked={setIsHeaderClicked}
        setAuthAddress={setAuthAddress}
        disableInlineEducation={disableInlineEducation}
        fullScreenModals={fullScreenModals}
        forceRememberOnDevice={forceRememberOnDevice || isNewUser}
        loginClicked={loginClicked}
        initialState={
          isNewUser ? WalletConfigState.OnboardWithCustody : undefined
        }
      />
      {isLoaded && !isCustodyWallet && isWeb3DepsLoading && (
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
      {showClaimWalletModal && (
        <Modal
          title={t('wallet.claimWalletTitle')}
          open={true}
          fullScreen={fullScreenModals}
          titleStyle={classes.modalTitleStyle}
          onClose={handleClaimModalClose}
        >
          <ClaimWalletModal onComplete={handleClaimComplete} />
        </Modal>
      )}
    </Box>
  );
};

export type WalletMode = 'basic' | 'portfolio';

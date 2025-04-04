import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
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
import type {TokenRefreshResponse} from '../../lib/types/fireBlocks';
import type {DomainProfileTabType} from '../Manage';
import type {ManageTabProps} from '../Manage/common/types';
import Modal from '../Modal';
import ClaimWalletModal from './ClaimWalletModal';
import {Header} from './Header';
import SecurityCenterModal from './SecurityCenterModal';
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
    disableSignInHeader?: boolean;
    disableBasicHeader?: boolean;
    fullScreenModals?: boolean;
    forceRememberOnDevice?: boolean;
    isNewUser?: boolean;
    loginClicked?: boolean;
    loginState?: TokenRefreshResponse;
    banner?: React.ReactNode;
    setAuthAddress?: (v: string) => void;
    onLoginInitiated?: (
      emailAddress: string,
      password: string,
      state: TokenRefreshResponse,
    ) => void;
    onError?: () => void;
    onLogout?: () => void;
    onDisconnect?: () => void;
    onSidePanelClick?: () => void;
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
  disableSignInHeader,
  disableBasicHeader,
  isNewUser,
  loginClicked,
  loginState,
  fullScreenModals,
  forceRememberOnDevice,
  banner,
  onUpdate,
  onError,
  onLoginInitiated,
  onLogout,
  onDisconnect,
  onSidePanelClick,
  onSettingsClick,
  onMessagesClick,
  onMessagePopoutClick,
  setAuthAddress,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const theme = useTheme();
  const [state] = useFireblocksState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>();
  const [isWeb3DepsLoading, setIsWeb3DepsLoading] = useState(true);
  const [isHeaderClicked, setIsHeaderClicked] = useState(false);
  const [isSecurityCenterModalOpen, setIsSecurityCenterModalOpen] =
    useState(false);
  const [showClaimWalletModal, setShowClaimWalletModal] = useState<boolean>();
  const [showMessagesInHeader, setShowMessagesInHeader] = useState<boolean>();
  const [accessToken, setAccessToken] = useState<string>();
  const {setWeb3Deps, showPinCta} = useWeb3Context();

  // indicates session lock has been checked and the session is
  // not in a locked state
  const isSessionUnlocked = showPinCta === false;

  const handleWalletLoaded = async (v: boolean) => {
    const bootstrapState = getBootstrapState(state);
    if (bootstrapState?.custodyState?.state === CustodyState.CUSTODY) {
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

  const handleSecurityCenterOpen = () => {
    setIsSecurityCenterModalOpen(true);
  };

  const handleClaimWallet = () => {
    setShowClaimWalletModal(true);
  };

  const handleClaimComplete = (token: string) => {
    setAccessToken(token);
    handleClaimModalClose();
  };

  const handleClaimModalClose = () => {
    setShowClaimWalletModal(false);
  };

  // until the session is unlocked, there is nothing to display
  if (!isSessionUnlocked) {
    return null;
  }

  return (
    <Box className={classes.container}>
      {((mode !== 'basic' && (accessToken || !disableSignInHeader)) ||
        !disableBasicHeader) && (
        <Header
          mode={mode}
          isLoaded={isLoaded}
          isFetching={isFetching}
          avatarUrl={avatarUrl}
          showMessages={
            (theme.wallet.type === 'udme' || showMessagesInHeader) &&
            showMessages &&
            !!accessToken
          }
          address={address}
          accessToken={accessToken}
          emailAddress={emailAddress}
          onHeaderClick={() => setIsHeaderClicked(true)}
          onLogout={onLogout}
          onDisconnect={onDisconnect}
          onSettingsClick={onSettingsClick}
          onSidePanelClick={onSidePanelClick}
          onMessagesClick={onMessagesClick}
          onMessagePopoutClick={onMessagePopoutClick}
          onClaimWalletClick={accessToken ? undefined : handleClaimWallet}
          onSecurityCenterClicked={handleSecurityCenterOpen}
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
        onSecurityCenterClicked={handleSecurityCenterOpen}
        setButtonComponent={setButtonComponent}
        setIsFetching={setIsFetching}
        isHeaderClicked={isHeaderClicked}
        setIsHeaderClicked={setIsHeaderClicked}
        setAuthAddress={setAuthAddress}
        setShowMessagesInHeader={setShowMessagesInHeader}
        showMessages={
          theme.wallet.type === 'upio' && showMessages && !showMessagesInHeader
        }
        fullScreenModals={fullScreenModals}
        forceRememberOnDevice={forceRememberOnDevice || isNewUser}
        loginClicked={loginClicked}
        initialState={
          isNewUser ? WalletConfigState.OnboardWithCustody : undefined
        }
        initialLoginState={loginState}
        banner={banner}
      />
      {isLoaded && accessToken && isWeb3DepsLoading && (
        <Box sx={{display: 'none'}}>
          <AccessWalletModal
            prompt={true}
            address={address}
            onComplete={deps => handleAccessWalletComplete(deps)}
            open={isWeb3DepsLoading}
            onClose={() => setIsWeb3DepsLoading(false)}
            isMpcWallet={true}
            isMpcPromptDisabled={true}
          />
        </Box>
      )}
      {showClaimWalletModal && (
        <Modal
          title={t('wallet.claimWalletTitle')}
          open={true}
          fullScreen={fullScreenModals}
          titleStyle={classes.modalTitleStyle}
          onClose={handleClaimModalClose}
        >
          <ClaimWalletModal
            onClaimInitiated={onLoginInitiated}
            onComplete={handleClaimComplete}
          />
        </Modal>
      )}
      {isSecurityCenterModalOpen && (
        <Modal
          title={t('wallet.securityCenter')}
          open={isSecurityCenterModalOpen}
          fullScreen={fullScreenModals}
          titleStyle={classes.modalTitleStyle}
          onClose={() => setIsSecurityCenterModalOpen(false)}
        >
          <SecurityCenterModal accessToken={accessToken} />
        </Modal>
      )}
    </Box>
  );
};

export type WalletMode = 'basic' | 'portfolio';

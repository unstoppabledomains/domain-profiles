import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import {useSnackbar} from 'notistack';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';

import {ProfileManager} from '../../components/Wallet/ProfileManager';
import {fetchApi} from '../../lib';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';

export interface ShowHideButtonProps {
  showDomain: boolean;
  setShowDomain: (value: boolean) => void;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  recordName?: string;
  ownerAddress: string;
  domain: string;
  showText?: string;
  hideText?: string;
  tooltip?: string;
}

const ShowHideButton: React.FC<ShowHideButtonProps> = ({
  showDomain,
  setShowDomain,
  setWeb3Deps,
  recordName = 'showDomainSuggestion',
  ownerAddress,
  domain,
  showText,
  hideText,
  tooltip,
}) => {
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();
  const [saveClicked, setSaveClicked] = useState(false);
  const [record, setRecord] = useState<Record<string, boolean>>({});
  const handleSaveChanges = (
    savedRecords: Record<string, string | boolean>,
  ) => {
    setShowDomain(savedRecords[recordName] as boolean);
    enqueueSnackbar(t('domainSuggestion.saveSuccess'), {
      variant: 'success',
    });
  };

  const handleClick = () => {
    if (!saveClicked) {
      setRecord({[recordName]: !showDomain});
      setSaveClicked(true);
    }
  };

  const handleSaveFailed = () => {
    enqueueSnackbar(t('domainSuggestion.saveFailed'), {
      variant: 'error',
    });
  };

  const handleSaveProfile = async (signature: string, expiry: string) => {
    await fetchApi(`/user/${domain}`, {
      host: config.PROFILE.HOST_URL,
      method: 'POST',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-auth-domain': domain,
        'x-auth-expires': expiry,
        'x-auth-signature': signature,
      },
      body: JSON.stringify(record),
    });

    // wait a moment before reloading
    await new Promise(resolve => setTimeout(resolve, 1000));

    // clear state values
    handleSaveChanges(record);
  };

  return (
    <>
      <Tooltip title={tooltip || ''}>
        <Button
          startIcon={
            showDomain ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />
          }
          data-testid="show-hide-button"
          onClick={handleClick}
          variant="text"
          size="small"
          sx={{color: showDomain ? 'neutralShades.600' : 'neutralShades.500'}}
        >
          {showDomain
            ? hideText || t('domainSuggestion.hide')
            : showText || t('domainSuggestion.show')}
        </Button>
      </Tooltip>
      <ProfileManager
        domain={domain}
        ownerAddress={ownerAddress!}
        setWeb3Deps={setWeb3Deps}
        saveClicked={saveClicked}
        setSaveClicked={setSaveClicked}
        onSignature={handleSaveProfile}
        onFailed={handleSaveFailed}
      />
    </>
  );
};

export default ShowHideButton;

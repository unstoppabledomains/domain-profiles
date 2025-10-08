import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import type {SelectChangeEvent} from '@mui/material/Select';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {ReactElement} from 'react';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {ProfileManager} from '../../components/Wallet/ProfileManager';
import type {NftMintItem, NftRequestItem, NftResponse} from '../../lib';
import { fetchApi} from '../../lib';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';

const useStyles = makeStyles()((theme: Theme) => ({
  flexContainer: {
    marginTop: '0px',
    display: 'flex',
    verticalAlign: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },
  symbolContainer: {
    display: 'flex',
    textAlign: 'left',
  },
  configLink: {
    color: theme.palette.neutralShades[600],
  },
  buttonLink: {
    marginRight: '1rem',
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 1.5,
    fontWeight: theme.typography.fontWeightMedium,
    transition: theme.transitions.create('color'),
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.primary.main,
    },
  },
  selectVisibility: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  subTitle: {
    marginTop: theme.spacing(1),
  },
}));

export const Manager: React.FC<ManagerProps> = ({
  domain,
  ownerAddress,
  records,
  profileServiceUrl,
  itemsToUpdate,
  saveClicked,
  setModalOpen,
  setSaveClicked,
  setRecords,
  setWeb3Deps,
  getNextNftPage,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [symbolToggles, setSymbolToggles] = useState<ReactElement>();
  const [showAllItems, setShowAllItems] = useState<boolean>(true);

  // render the symbol table
  useEffect(() => {
    renderSymbols();
  }, [records]);

  const handleSymbolToggle = (symbol: string) => {
    if (!records) {
      return;
    }
    records[symbol].enabled = !records[symbol].enabled;
    setRecords(records);
    renderSymbols();
  };

  const handleVisibilityModeChange = (e: SelectChangeEvent<string>) => {
    setShowAllItems(e.target.value === 'true');
    if (records) {
      setRecords(records);
    }
  };

  // send final call to save preferences to profile API
  const handleSaveProfile = async (signature: string, expiry: string) => {
    // prepare the request body
    if (!records) {
      return;
    }

    // store request body
    const requestBody: NftRequest[] = [];
    Object.keys(records).forEach(symbol => {
      requestBody.push({
        symbol,
        address: records[symbol].address,
        public: records[symbol].enabled,
        showAllItems,
        items: itemsToUpdate
          .filter(item => item.symbol === symbol)
          .map<NftRequestItem>(item => {
            return {
              mint: item.mint,
              public: item.public,
            };
          }),
      });
    });

    // make the request
    await fetchApi(`/user/${domain}/nfts`, {
      host: profileServiceUrl,
      method: 'POST',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-auth-domain': domain,
        'x-auth-expires': expiry,
        'x-auth-signature': signature,
      },
      body: JSON.stringify(requestBody),
    });

    // close the management dialogue
    setModalOpen(false);

    // wait a moment before reloading
    await new Promise(resolve => setTimeout(resolve, 1000));
    await getNextNftPage(true);
  };

  const renderSymbols = () => {
    if (!records) {
      return;
    }
    setShowAllItems(
      Object.keys(records!).filter(symbol => records[symbol].showAllItems)
        .length > 0,
    );
    setSymbolToggles(
      <div className={classes.symbolContainer}>
        <FormGroup>
          {Object.keys(records!)
            .sort()
            .map(symbol => (
              <div>
                <FormControlLabel
                  value={symbol}
                  label={symbol}
                  control={
                    <Checkbox
                      defaultChecked={records[symbol].enabled}
                      onChange={() => handleSymbolToggle(symbol)}
                    />
                  }
                />
              </div>
            ))}
        </FormGroup>
      </div>,
    );
  };

  return (
    <Box>
      {records && (
        <div className={classes.flexContainer}>
          <div>
            {symbolToggles}
            {records && (
              <Box
                mt={2}
                display="flex"
                flexDirection="column"
                textAlign="left"
                alignItems="left"
              >
                <Typography className={classes.subTitle} variant="h6">
                  {t('nftCollection.manageVisibilityDefaultTitle')}
                </Typography>
                <Typography variant="body1">
                  {t('nftCollection.visibilityDescription')}
                </Typography>
                <Select
                  id="visibilityMode"
                  value={String(showAllItems)}
                  onChange={handleVisibilityModeChange}
                  className={classes.selectVisibility}
                >
                  <MenuItem value={'true'}>
                    <Typography variant="body2">
                      {t('nftCollection.manageVisibilityShowByDefault')}
                    </Typography>
                  </MenuItem>
                  <MenuItem value={'false'}>
                    <Typography variant="body2">
                      {t('nftCollection.manageVisibilityHideByDefault')}
                    </Typography>
                  </MenuItem>
                </Select>
              </Box>
            )}
          </div>
          <ProfileManager
            domain={domain}
            ownerAddress={ownerAddress!}
            setWeb3Deps={setWeb3Deps}
            saveClicked={saveClicked}
            setSaveClicked={setSaveClicked}
            onSignature={handleSaveProfile}
          />
        </div>
      )}
    </Box>
  );
};

interface MessageResponse {
  message: string;
  headers: {
    ['x-auth-expires']: number;
  };
}

interface NftRequest {
  symbol: string;
  address: string;
  public: boolean;
  showAllItems: boolean;
  order?: number;
  items?: NftRequestItem[];
}

export type ManagerProps = NftGalleryManagerProps & {
  saveClicked: boolean;
  setSaveClicked: (value: boolean) => void;
  setModalOpen: (value: boolean) => void;
};

export const NftGalleryManager: React.FC<NftGalleryManagerProps> = ({
  domain,
  ownerAddress,
  records,
  profileServiceUrl,
  itemsToUpdate,
  setRecords,
  setWeb3Deps,
  getNextNftPage: getNextNftPage,
  hasNfts,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const [saveClicked, setSaveClicked] = useState<boolean>(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleDialogOpen = () => {
    setSaveClicked(false);
    setModalOpen(true);
  };

  const handleCancelClicked = () => {
    setModalOpen(false);
  };

  const handleSaveClicked = () => {
    setSaveInProgress(true);
    setSaveClicked(true);
  };

  const handleAddAddress = () => {
    setSaveInProgress(true);
    window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/manage?domain=${domain}&page=crypto`;
  };

  return (
    <>
      {itemsToUpdate.length > 0 ? (
        <div className={classes.flexContainer}>
          <Link
            href="#"
            underline="none"
            data-testid={`nftGallery-confirm-button`}
            className={classes.buttonLink}
            onClick={handleDialogOpen}
          >
            <div className={classes.flexContainer}>
              <VisibilityOff sx={{marginRight: '3px'}} />
              {t('common.confirm')}{' '}
              {itemsToUpdate.length > 0 && ` (${itemsToUpdate.length})`}
            </div>
          </Link>
        </div>
      ) : hasNfts ? (
        <Link
          href="#"
          underline="none"
          data-testid={`nftGallery-config-button`}
          className={cx(classes.buttonLink, classes.configLink)}
          onClick={handleDialogOpen}
        >
          <div className={classes.flexContainer}>
            <SettingsOutlined sx={{marginRight: '3px'}} fontSize={'small'} />
            {t('manage.configure')}{' '}
          </div>
        </Link>
      ) : (
        <Button
          variant="outlined"
          data-testid={`nftGallery-config-button`}
          onClick={handleDialogOpen}
        >
          {t('manage.configure')}
        </Button>
      )}
      <Dialog open={modalOpen}>
        <DialogTitle>{t('nftCollection.manageTitle')}</DialogTitle>
        <DialogContent>
          <Typography sx={{marginBottom: '10px'}}>
            {records
              ? t('nftCollection.manageDescription')
              : t('nftCollection.addOnchainAddress')}
          </Typography>
          <Manager
            domain={domain}
            ownerAddress={ownerAddress}
            records={records}
            profileServiceUrl={profileServiceUrl}
            itemsToUpdate={itemsToUpdate}
            saveClicked={saveClicked}
            setSaveClicked={setSaveClicked}
            setRecords={setRecords}
            setWeb3Deps={setWeb3Deps}
            setModalOpen={setModalOpen}
            getNextNftPage={getNextNftPage}
          />
          {itemsToUpdate.length > 0 && (
            <div>
              <Typography className={classes.subTitle} variant={'h6'}>
                {t('nftCollection.manageVisibilityTitle')}
              </Typography>
              <Typography variant="body2">
                {t('nftCollection.manageVisibility', {
                  count: itemsToUpdate.length,
                })}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color={'primary'}
            onClick={handleCancelClicked}
            sx={{marginBottom: '10px'}}
          >
            {t('common.cancel')}
          </Button>
          {records ? (
            <LoadingButton
              color={'primary'}
              variant={'contained'}
              onClick={handleSaveClicked}
              data-testid={`nftGallery-modal-save`}
              loading={saveInProgress}
              sx={{marginRight: '10px', marginBottom: '10px'}}
            >
              {t('common.save')}
            </LoadingButton>
          ) : (
            <LoadingButton
              color={'primary'}
              variant={'contained'}
              onClick={handleAddAddress}
              loading={saveInProgress}
              data-testid={`nftGallery-modal-add-address`}
              sx={{marginRight: '10px', marginBottom: '10px'}}
            >
              {t('nftCollection.addAddress')}
            </LoadingButton>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export type NftGalleryManagerProps = {
  domain: string;
  ownerAddress: string;
  records?: Record<string, NftResponse>;
  profileServiceUrl: string;
  itemsToUpdate: NftMintItem[];
  setRecords: (value: Record<string, NftResponse>) => void;
  getNextNftPage: (reset?: boolean) => Promise<void>;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  hasNfts?: boolean;
};

import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {ReactElement} from 'react';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {ProfileManager} from '../../components/Wallet/ProfileManager';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';
import type {Nft} from './NftCard';

const useStyles = makeStyles()((theme: Theme) => ({
  flexContainer: {
    marginTop: '0px',
    display: 'flex',
    verticalAlign: 'center',
    textAlign: 'center',
    alignItems: 'center',
  },
  centeredContainer: {
    marginTop: '0px',
    display: 'flex',
    verticalAlign: 'center',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolContainer: {
    display: 'flex',
    textAlign: 'left',
  },
  configLink: {
    color: '#62626A',
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
  symbolHeaderLabelOn: {
    padding: theme.spacing(0, 0.75),
    fontSize: theme.typography.body2.fontSize,
    lineHeight: '1.25rem',
    backgroundColor: theme.palette.successShades[700],
    color: theme.palette.white,
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(1.5),
    cursor: 'pointer',
  },
  symbolHeaderLabelOff: {
    padding: theme.spacing(0, 0.75),
    fontSize: theme.typography.body2.fontSize,
    lineHeight: '1.25rem',
    backgroundColor: theme.palette.neutralShades[200],
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(1.5),
    cursor: 'pointer',
  },
  spinner: {
    margin: theme.spacing(7),
    textAlign: 'center',
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
  const [symbolToggles, setSymbolToggles] = useState<ReactElement>();
  const [loading, setLoading] = useState<boolean>(false);

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

  // send final call to save preferences to profile API
  const handleSaveProfile = async (signature: string, expiry: string) => {
    setLoading(true);

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
        showAllItems: true,
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
    const domainNftUrl = `${profileServiceUrl}/user/${domain}/nfts`;
    await fetch(domainNftUrl, {
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
        <div
          className={
            loading ? classes.centeredContainer : classes.flexContainer
          }
        >
          {loading ? (
            <div className={classes.spinner}>
              <CircularProgress />
            </div>
          ) : (
            <div>{symbolToggles}</div>
          )}
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
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleDialogOpen = () => {
    setSaveClicked(false);
    setModalOpen(true);
  };

  const handleCancelClicked = () => {
    setModalOpen(false);
  };

  const handleSaveClicked = () => {
    setSaveClicked(true);
  };

  const handleAddAddress = () => {
    window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/manage?domain=${domain}&page=crypto`;
  };

  return (
    <>
      {itemsToUpdate.length > 0 && (
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
          <Divider
            sx={{marginLeft: '5px;', marginRight: '5px;'}}
            orientation="vertical"
            flexItem
          />
        </div>
      )}
      {hasNfts ? (
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
              <Typography sx={{marginTop: '10px'}} variant={'h6'}>
                {t('nftCollection.manageVisibilityTitle')}
              </Typography>
              <Typography>
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
            <Button
              color={'primary'}
              variant={'contained'}
              onClick={handleSaveClicked}
              data-testid={`nftGallery-modal-save`}
              sx={{marginRight: '10px', marginBottom: '10px'}}
            >
              {t('common.save')}
            </Button>
          ) : (
            <Button
              color={'primary'}
              variant={'contained'}
              onClick={handleAddAddress}
              data-testid={`nftGallery-modal-add-address`}
              sx={{marginRight: '10px', marginBottom: '10px'}}
            >
              {t('nftCollection.addAddress')}
            </Button>
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

export type NftMintItem = NftRequestItem & {
  symbol: string;
};

export interface NftRequestItem {
  mint: string;
  public: boolean;
}

export interface NftResponse {
  nfts: Nft[];
  address: string;
  verified: boolean;
  enabled: boolean;
  cursor?: string;
}

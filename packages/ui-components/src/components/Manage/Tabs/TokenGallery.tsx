import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getDomainNfts} from '../../../actions';
import {useWeb3Context} from '../../../hooks';
import type {NftResponse, SerializedUserDomainProfileData} from '../../../lib';
import {useTranslationContext} from '../../../lib';
import {Manager} from '../../TokenGallery/NftGalleryManager';
import {DomainProfileTabType} from '../DomainProfile';
import {TabHeader} from '../common/TabHeader';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(-3),
    },
  },
  infoContainer: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(3),
  },
  icon: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(2),
    width: '75px',
    height: '75px',
  },
  description: {
    color: theme.palette.neutralShades[600],
  },
}));

export const TokenGallery: React.FC<TokenGalleryProps> = ({
  address,
  domain,
  onUpdate,
}) => {
  const {classes} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const [saveClicked, setSaveClicked] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [t] = useTranslationContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [nftAddressRecords, setNftAddressRecords] =
    useState<Record<string, NftResponse>>();

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    setNftAddressRecords(await getDomainNfts(domain));
    setIsLoaded(true);
  };

  const handleRecordsUpdate = () => {
    onUpdate(DomainProfileTabType.TokenGallery);
  };

  const handleSaveClicked = () => {
    setSaveInProgress(true);
    setSaveClicked(true);
  };

  return (
    <Box className={classes.container}>
      <TabHeader
        icon={<CollectionsOutlinedIcon />}
        description={t('manage.tokenGalleryDescription')}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001227010-how-to-setup-and-manage-the-token-gallery"
      />
      {isLoaded ? (
        <>
          <Box mb={1}>
            <Typography variant="body1">
              {nftAddressRecords
                ? t('nftCollection.manageDescription')
                : t('nftCollection.addOnchainAddress')}
            </Typography>
          </Box>
          <Manager
            domain={domain}
            ownerAddress={address}
            records={nftAddressRecords}
            profileServiceUrl={config.PROFILE.HOST_URL}
            itemsToUpdate={[]}
            setRecords={handleRecordsUpdate}
            saveClicked={saveClicked}
            setSaveClicked={setSaveClicked}
            setWeb3Deps={setWeb3Deps}
            setModalOpen={setSaveInProgress}
            getNextNftPage={async () => {}}
          />
          <LoadingButton
            variant="contained"
            disabled={saveInProgress}
            className={classes.button}
            loading={saveInProgress}
            onClick={handleSaveClicked}
          >
            {t('common.save')}
          </LoadingButton>
        </>
      ) : (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export type TokenGalleryProps = {
  address: string;
  domain: string;
  onUpdate(
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ): void;
};

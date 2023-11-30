import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getDomainNfts} from '../../../actions';
import {useWeb3Context} from '../../../hooks';
import type {NftResponse} from '../../../lib';
import {useTranslationContext} from '../../../lib';
import {NftGalleryManager} from '../../TokenGallery/NftGalleryManager';

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
}) => {
  const {classes} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
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

  return (
    <Box className={classes.container}>
      {isLoaded ? (
        <>
          <Box
            display="flex"
            alignItems="center"
            alignContent="center"
            className={classes.infoContainer}
          >
            <CollectionsOutlinedIcon className={classes.icon} />
            <Typography variant="body2" className={classes.description}>
              {t('manage.tokenGalleryDescription')}{' '}
            </Typography>
          </Box>
          <Box className={classes.button} />
          <NftGalleryManager
            ownerAddress={address}
            domain={domain}
            records={nftAddressRecords}
            profileServiceUrl={config.PROFILE.HOST_URL}
            itemsToUpdate={[]}
            setRecords={() => {}}
            getNextNftPage={async () => {}}
            setWeb3Deps={setWeb3Deps}
            hasNfts={false}
          />
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
};

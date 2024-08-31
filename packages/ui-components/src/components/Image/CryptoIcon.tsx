import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import {LazyLoadImage} from 'react-lazy-load-image-component';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useResolverKeys from '../../hooks/useResolverKeys';
import {getDefaultCryptoIconUrl} from '../../lib';
import {getMappedResolverKey} from '../../lib/types/resolverKeys';

const useStyles = makeStyles()((theme: Theme) => ({
  innerImage: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.neutralShades[400],
    width: '100%',
    height: '100%',
  },
  fallbackText: {
    color: theme.palette.neutralShades[800],
    fontWeight: 'bold',
  },
}));

type Props = {
  currency: string;
  className?: string;
};

export const CryptoIcon: React.FC<Props> = ({currency, className}) => {
  const {classes} = useStyles();
  const {mappedResolverKeys, loading} = useResolverKeys();
  const [iconUrl, setIconUrl] = useState<string>(
    getDefaultCryptoIconUrl(currency),
  );
  const [iconLoaded, setIconLoaded] = useState(false);
  const [title, setTitle] = useState<string>(currency);
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    // wait for resolver keys to load
    if (loading || !mappedResolverKeys) {
      return;
    }

    // find the currency icon URL
    const mappedKey = getMappedResolverKey(currency, mappedResolverKeys);
    const mappedResolverUrl =
      mappedKey?.info?.iconUrl || mappedKey?.info?.logoUrl;
    if (mappedResolverUrl && mappedResolverUrl !== iconUrl) {
      setIconUrl(mappedResolverUrl);
    }

    setTitle(mappedKey?.name || currency);
  }, [loading]);

  const handleError = () => {
    setIsBroken(true);
  };

  const renderPlaceholder = () => (
    <Box className={classes.fallbackContainer}>
      <Tooltip title={title}>
        <Typography variant="body2" className={classes.fallbackText}>
          {currency.slice(0, 1)}
        </Typography>
      </Tooltip>
    </Box>
  );

  return (
    <Avatar className={className}>
      {isBroken || !iconUrl ? (
        renderPlaceholder()
      ) : (
        <LazyLoadImage
          className={
            iconLoaded ? classes.innerImage : classes.fallbackContainer
          }
          src={iconUrl}
          onError={handleError}
          placeholder={renderPlaceholder()}
          onLoad={() => setIconLoaded(true)}
        />
      )}
    </Avatar>
  );
};

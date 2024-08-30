import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, {useEffect, useState} from 'react';

import useResolverKeys from '../../hooks/useResolverKeys';
import {getMappedResolverKey} from '../../lib/types/resolverKeys';

type Props = {
  currency: string;
  className?: string;
};

export const CryptoIcon: React.FC<Props> = ({currency, className}) => {
  const {mappedResolverKeys, loading} = useResolverKeys();
  const [iconUrl, setIconUrl] = useState<string>();
  const [title, setTitle] = useState<string>(currency);

  useEffect(() => {
    // wait for resolver keys to load
    if (loading || !mappedResolverKeys) {
      return;
    }

    // find the currency icon URL
    const mappedKey = getMappedResolverKey(currency, mappedResolverKeys);
    setIconUrl(mappedKey?.info?.iconUrl || mappedKey?.info?.logoUrl);
    setTitle(mappedKey?.name || currency);
  }, [loading]);

  return (
    <Tooltip title={title}>
      <Avatar src={iconUrl} className={className}>
        <Typography variant="body2">{currency.slice(0, 1)}</Typography>
      </Avatar>
    </Tooltip>
  );
};

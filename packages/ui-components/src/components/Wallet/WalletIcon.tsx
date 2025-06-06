import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles<{size: number; boxShadow: boolean}>()((
  theme: Theme,
  {size, boxShadow},
) => {
  // optional box shadow feature
  const borderStyle = boxShadow
    ? {boxShadow: theme.shadows[3]}
    : {border: `1px solid ${theme.palette.neutralShades[100]}`};
  const commonFeatures = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${size * 0.23}px`,
  };

  return {
    walletIcon: {
      display: 'flex',
      '& > img': {
        ...commonFeatures,
        ...borderStyle,
      },
      '& > svg': {
        backgroundColor: theme.palette.white,
        color: theme.palette.primary.main,
        ...commonFeatures,
        ...borderStyle,
      },
    },
  };
});

type WalletIconProps = {
  size?: number;
  boxShadow?: boolean;
  beta?: boolean;
};

const WalletIcon = ({
  size = 40,
  boxShadow = false,
  beta = false,
}: WalletIconProps): JSX.Element => {
  const theme = useTheme();
  const {classes} = useStyles({size, boxShadow});

  return (
    <Box className={classes.walletIcon}>
      {theme.wallet.type === 'udme' ? (
        <SvgIcon width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M22 5.37c0-.76-.3-1.5-.85-2.03a2.94 2.94 0 0 0-2.07-.84H4.92c-.78 0-1.51.3-2.06.84A2.86 2.86 0 0 0 2 5.37v10.3a4 4 0 0 0 2.97 3.87l8.26 2.2a3 3 0 0 0 3.77-2.9v-7.49c0-.76-.25-1.5-.72-2.1a3.56 3.56 0 0 0-1.87-1.26L5.38 5.53A.62.62 0 0 1 5 5.24a.6.6 0 0 1 .23-.84c.15-.08.32-.1.48-.06 2.92.77 2.94.82 2.97.82h10.4c.17 0 .33.07.45.18a.6.6 0 0 1 0 .87.63.63 0 0 1-.45.18h-4.36c-.05 0-.1.02-.14.05a.2.2 0 0 0-.06.13c-.01.05 0 .1.03.14a.2.2 0 0 0 .12.09 4.78 4.78 0 0 1 2.57 1.62l.1.02h1.74c.17 0 .33.06.45.18a.6.6 0 0 1 0 .87.63.63 0 0 1-.45.18h-.83a.2.2 0 0 0-.17.09.2.2 0 0 0 0 .18c.16.45.24.93.24 1.41v5.69c0 .05.02.1.06.14.04.04.09.06.14.06h.63a2.94 2.94 0 0 0 2.02-.86c.53-.54.83-1.25.83-2V5.37Zm-9.08 11V9.21l-2.54.77v5.7c0 .34-.13.64-.37.82-.24.19-.56.24-.9.15a1.72 1.72 0 0 1-.9-.63A1.73 1.73 0 0 1 7.86 15v-4.24l-2.18.65v3.01c0 2.08 1.63 4.2 3.63 4.73 2 .54 3.62-.71 3.62-2.79Z"
            clipRule="evenodd"
          />
          <path
            fill="#00C9FF"
            d="m10.38 12.4-2.53 1.3V15c0 .08 0 .16.02.24l2.51-.39V12.4ZM5.83 15.55c-.07-.25-.12-.5-.14-.76L3.5 15.91l2.33-.36ZM12.92 14.46V11.1l2.17-1.1v4.13l-2.17.33Z"
          />
        </SvgIcon>
      ) : (
        <img
          src={`${
            beta
              ? 'https://storage.googleapis.com/unstoppable-client-assets/images/upio/logo/beta.png'
              : 'https://storage.googleapis.com/unstoppable-client-assets/images/upio/logo/128.png'
          }`}
        />
      )}
    </Box>
  );
};

export default WalletIcon;

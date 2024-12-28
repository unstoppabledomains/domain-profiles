import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import Image from 'next/legacy/image';
import React, {useEffect, useState} from 'react';
import {useIntervalWhen} from 'rooks';

import config from '@unstoppabledomains/config';
import type {LogoTheme} from '@unstoppabledomains/ui-kit/components';
import {Logo} from '@unstoppabledomains/ui-kit/components';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

type Props = {
  theme: LogoTheme;
  hovering: boolean;
};

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    padding: '11px',
    paddingTop: 15,
    position: 'relative',
  },
  logos: {
    display: 'inline-flex',
    position: 'absolute',
    alignItems: 'center',
    left: 0,
    top: -5,
  },
  logoVisibleFixed: {
    opacity: 1,
    transitionDuration: '.5s',
  },
  logoNotVisibleFixed: {
    opacity: 0,
    position: 'absolute',
    transitionDuration: '.5s',
  },
  logoImage: {
    width: '22px',
    height: '22px',
  },
}));

const UnstoppableAnimated: React.FC<Props> = ({theme, hovering}) => {
  const {classes} = useStyles();
  const [count, setCount] = useState(0);
  const logos = [
    'images/wallet-icons/MetaMask.svg',
    'images/wallet-button/wallet-connect.svg',
    'images/wallet-button/trust-wallet.svg',
    'images/wallet-button/blockchain.com.svg',
    'images/wallet-button/coinbase.svg',
    'images/wallet-button/crypto.com.svg',
    'images/wallet-button/brave.svg',
    'images/wallet-icons/phantom.svg',
    'images/wallet-button/kresus.svg',
    'images/wallet-button/unstoppable-domains.svg',
  ];

  useIntervalWhen(
    () => setCount(prev => (prev === logos.length - 1 ? 0 : prev + 1)),
    1_000,
    hovering,
    false,
  );

  useEffect(() => {
    if (!hovering) {
      setCount(0);
    }
  }, [hovering]);

  if (!hovering) {
    return <Logo theme={theme} />;
  }
  return (
    <Box className={classes.root}>
      <Box className={classes.logos}>
        {logos.map((logo, i) => (
          <Box
            key={logo}
            className={
              count === i
                ? classes.logoVisibleFixed
                : classes.logoNotVisibleFixed
            }
          >
            <Image
              src={`${config.ASSETS_BUCKET_URL}/${logo}`}
              width={22}
              height={22}
              alt="wallet"
              unoptimized={true}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default UnstoppableAnimated;

import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../../lib';
import {TabHeader} from '../../common/TabHeader';
import type {ManageTabProps} from '../../common/types';
import {Configuration} from './Configuration';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const Wallet: React.FC<
  ManageTabProps & {
    mode?: 'basic' | 'portfolio';
  }
> = ({address, domain, mode = 'basic', onUpdate, setButtonComponent}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Box className={classes.container}>
      <TabHeader
        icon={<WalletOutlinedIcon />}
        description={t('manage.cryptoWalletDescription')}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001205861-list-domain-for-sale-on-our-website"
      />
      <Configuration
        mode={mode}
        address={address}
        domain={domain}
        onUpdate={onUpdate}
        setButtonComponent={setButtonComponent}
      />
    </Box>
  );
};

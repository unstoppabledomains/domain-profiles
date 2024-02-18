import CloseIcon from '@mui/icons-material/Close';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useWeb3Context} from '../../../../hooks';
import {useTranslationContext} from '../../../../lib';
import {notifyEvent} from '../../../../lib/error';
import CopyToClipboard from '../../../CopyToClipboard';
import Link from '../../../Link';
import {getBlockchainName} from './types';

const useStyles = makeStyles()((theme: Theme) => ({
  dialogRoot: {
    padding: theme.spacing(3),
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: theme.palette.common.black,
  },
  modalSubTitle: {
    color: theme.palette.neutralShades[600],
  },
  contentContainer: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  tabListContainer: {
    marginTop: theme.spacing(2),
  },
  tabContentContainer: {
    display: 'flex',
    width: '100%',
  },
  infoText: {
    color: theme.palette.neutralShades[600],
    marginBottom: theme.spacing(3),
  },
}));

enum tabType {
  Sign = 'sign',
  DelegateXyz = 'delegate.xyz',
}

type Props = {
  open: boolean;
  ownerAddress: string;
  walletAddress: string;
  symbol: string;
  onClose: () => void;
  onVerifyClick: () => void;
  showDelegateInfo?: boolean;
};

const VerificationInfoModal: React.FC<Props> = ({
  open,
  onClose,
  onVerifyClick,
  showDelegateInfo,
  symbol,
  ownerAddress,
  walletAddress,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const [tabValue, setTabValue] = useState(tabType.Sign);
  const {setWeb3Deps} = useWeb3Context();

  useEffect(() => {
    try {
      // always disconnect wallet when loading the verification modal, because
      // the user needs the ability to change their connected wallet to match
      // the crypto address record.
      if (setWeb3Deps) {
        setWeb3Deps(undefined);
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'WALLET', 'Signature');
    }
  }, [setWeb3Deps]);

  const handleClickDelegate = async () => {
    window.open(
      `https://delegate.xyz/profile/${walletAddress}/registry?r`,
      '_blank',
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const tv = newValue as tabType;
    setTabValue(tv);
  };

  return (
    <Dialog open={open} onClose={onClose} classes={{paper: classes.dialogRoot}}>
      <TabContext value={tabValue as tabType}>
        <Box className={classes.modalHeader}>
          <Box display="flex" flexDirection="column">
            <Typography variant="h5" className={classes.modalTitle}>
              {t('manage.verificationInfoModal.title')}
            </Typography>
            <Typography className={classes.modalSubTitle} variant="caption">
              {t('manage.verificationInfoModal.address', {
                walletAddress,
              })}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box className={classes.contentContainer}>
          <Typography variant="body1">
            {t('manage.verificationInfoModal.introduction', {
              ownerAddress: truncateEthAddress(ownerAddress),
              walletAddress: truncateEthAddress(walletAddress),
            })}
          </Typography>
          <Box className={classes.tabListContainer}>
            <TabList onChange={handleTabChange} variant="standard">
              <Tab
                label={t('manage.verificationInfoModal.verifyWithSignature')}
                value={tabType.Sign}
              />
              {showDelegateInfo && (
                <Tab
                  label={t('manage.verificationInfoModal.verifyWithDelegate')}
                  value={tabType.DelegateXyz}
                />
              )}
            </TabList>
          </Box>
          <Box className={classes.tabContentContainer}>
            <TabPanel value={tabType.Sign}>
              <Typography className={classes.infoText} variant="body2">
                {t('manage.verificationInfoModal.infoSigning', {
                  ownerAddress: truncateEthAddress(ownerAddress),
                  walletAddress: truncateEthAddress(walletAddress),
                })}
              </Typography>
              <Button fullWidth onClick={onVerifyClick} variant="contained">
                {t('manage.verificationInfoModal.signAndVerify')}
              </Button>
            </TabPanel>
            <TabPanel value={tabType.DelegateXyz}>
              <Typography className={classes.infoText} variant="body2">
                {t('manage.verificationInfoModal.infoDelegateXyz1', {
                  ownerAddress: truncateEthAddress(ownerAddress),
                  walletAddress: truncateEthAddress(walletAddress),
                })}
              </Typography>
              <Typography className={classes.infoText} variant="body2">
                {t('manage.verificationInfoModal.infoDelegateXyz2', {
                  ownerAddress: truncateEthAddress(ownerAddress),
                  walletAddress: truncateEthAddress(walletAddress),
                  blockchain: getBlockchainName(symbol),
                })}{' '}
                <Link
                  href="https://docs.delegate.xyz/delegate/"
                  target="_blank"
                >
                  {t('common.learnMore')}
                </Link>
              </Typography>
              <CopyToClipboard
                stringToCopy={ownerAddress}
                onCopy={handleClickDelegate}
              >
                <Button fullWidth variant="contained">
                  {t('manage.verificationInfoModal.goToDelegateXyz')}
                </Button>
              </CopyToClipboard>
            </TabPanel>
          </Box>
        </Box>
      </TabContext>
    </Dialog>
  );
};

export default VerificationInfoModal;

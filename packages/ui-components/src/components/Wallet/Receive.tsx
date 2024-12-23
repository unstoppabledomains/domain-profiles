import CheckIcon from '@mui/icons-material/CheckCircle';
import CopyIcon from '@mui/icons-material/ContentCopy';
import InfoIcon from '@mui/icons-material/Info';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect, useRef, useState} from 'react';
import {QRCode} from 'react-qrcode-logo';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance, TokenEntry} from '../../lib';
import {useTranslationContext} from '../../lib';
import Link from '../Link';
import ManageInput from '../Manage/common/ManageInput';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';
import {SelectAsset} from './SelectAsset';
import {TitleWithBackButton} from './TitleWithBackButton';

const useStyles = makeStyles()((theme: Theme) => ({
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '346px',
      marginLeft: theme.spacing(-1),
      marginRight: theme.spacing(-1),
    },
    height: '100%',
    justifyContent: 'space-between',
  },
  selectAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    justifyContent: 'space-between',
  },
  assetsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
  },
  asset: {
    backgroundImage: 'linear-gradient(#0655DD, #043893)',
    borderRadius: 9,
    padding: 12,
    width: '100%',
  },
  assetLogo: {
    height: '70px',
    width: '70px',
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: theme.shadows[6],
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    width: '100%',
  },
  receiveAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  receiveContentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  copyButton: {},
  addressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  captionContainer: {
    display: 'flex',
    backgroundColor: '#EEF0F3',
    padding: 10,
    borderRadius: 9,
  },
  input: {
    fontSize: '12px',
  },
  infoIcon: {
    fontSize: 15,
  },
  learnMoreLink: {
    display: 'inline-flex',
  },
  flex: {
    display: 'flex',
  },
}));

type Props = {
  onCancelClick: () => void;
  wallets: SerializedWalletBalance[];
  initialSelectedToken?: TokenEntry;
};

const Receive: React.FC<Props> = ({
  onCancelClick,
  wallets,
  initialSelectedToken,
}) => {
  const [t] = useTranslationContext();
  const [selectedToken, setSelectedToken] = useState<TokenEntry>();
  const [copied, setCopied] = useState<boolean>(false);
  const {classes} = useStyles();
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialSelectedToken) {
      return;
    }
    handleSelectToken(initialSelectedToken);
  }, [initialSelectedToken]);

  const handleSelectToken = (token: TokenEntry) => {
    setSelectedToken(token);
  };

  const handleBackClick = () => {
    if (selectedToken && !initialSelectedToken) {
      setSelectedToken(undefined);
    } else {
      onCancelClick();
    }
  };

  if (!selectedToken) {
    return (
      <Box className={classes.flexColCenterAligned}>
        <SelectAsset
          onSelectAsset={handleSelectToken}
          wallets={wallets}
          onCancelClick={handleBackClick}
          label={t('wallet.selectAssetToReceive')}
          supportedAssetList={config.WALLETS.CHAINS.RECEIVE}
        />
      </Box>
    );
  }

  const handleCopyClick = () => {
    void navigator.clipboard.writeText(selectedToken.walletAddress);
    setCopied(true);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Box className={classes.flexColCenterAligned}>
      <TitleWithBackButton
        onCancelClick={handleBackClick}
        label={t('wallet.actionOnBlockchainTitle', {
          action: t('common.receive'),
          symbol: getBlockchainDisplaySymbol(selectedToken.ticker),
          blockchain: selectedToken.walletName,
        })}
      />
      <Box className={classes.contentWrapper}>
        <Box className={classes.receiveContentContainer}>
          <Box className={classes.receiveAssetContainer} mb={2}>
            <img src={selectedToken.imageUrl} className={classes.assetLogo} />
          </Box>
          <QRCode
            value={`${selectedToken.walletName}:${selectedToken.walletAddress}`}
            size={125}
            logoOpacity={0.5}
            logoHeight={60}
            logoWidth={60}
            qrStyle={'dots'}
            ecLevel={'H'}
            eyeRadius={5}
            style={{innerHeight: 80, innerWidth: 30}}
          />
          <Box className={classes.addressWrapper} mt={2}>
            <ManageInput
              mt={1}
              placeholder=""
              onChange={() => null}
              id="amount"
              value={selectedToken.walletAddress}
              stacked={true}
              disabled
              multiline
              classes={{input: classes.input}}
              endAdornment={
                <Button
                  onClick={handleCopyClick}
                  className={classes.copyButton}
                >
                  {copied ? <CheckIcon color="success" /> : <CopyIcon />}
                </Button>
              }
            />
          </Box>
        </Box>
      </Box>
      <Box mb={1} className={classes.captionContainer}>
        <Box mr={1}>
          <InfoIcon className={classes.infoIcon} color="error" />
        </Box>
        <Typography variant="caption" color="error" component="div">
          <Markdown>
            {t(
              config.WALLETS.CHAINS.DOMAINS.map(s => s.toLowerCase()).includes(
                selectedToken.symbol.toLowerCase(),
              )
                ? 'wallet.receiveAddressCaptionWithDomains'
                : 'wallet.receiveAddressCaption',
              {
                symbol: getBlockchainDisplaySymbol(selectedToken.ticker),
                blockchain: selectedToken.walletName,
              },
            )}
          </Markdown>{' '}
          {t('wallet.sendingForOtherNetworksAndTokens', {
            symbol: getBlockchainDisplaySymbol(selectedToken.ticker),
            blockchain: selectedToken.walletName,
          })}{' '}
          <Link
            href={config.WALLETS.LANDING_PAGE_URL}
            target="_blank"
            className={classes.learnMoreLink}
          >
            <Typography variant={'caption'}>{t('common.learnMore')}</Typography>
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Receive;

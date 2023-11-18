import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../../../lib/i18n';
import {getAddressMetadata, isEthAddress} from '../../protocol/resolution';
import {isXmtpUser} from '../../protocol/xmtp';
import type {AddressResolution} from '../../types';
import {TabType} from '../../types';
import CallToAction from '../CallToAction';
import Search from '../Search';

const useStyles = makeStyles()((theme: Theme) => ({
  cardContainer: {
    padding: theme.spacing(1),
    border: 'none',
    height: '100%',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    color: theme.palette.neutralShades[400],
  },
  loadingSpinner: {
    color: 'inherit',
  },
  searchContainer: {
    display: 'flex',
    width: '100%',
    color: theme.palette.neutralShades[600],
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  headerActionContainer: {
    display: 'flex',
    color: theme.palette.neutralShades[600],
    alignItems: 'center',
  },
  headerBackIcon: {
    marginRight: theme.spacing(1),
    cursor: 'pointer',
  },
  headerCloseIcon: {
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
  },
  resultContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(4),
  },
  resultStatus: {
    display: 'flex',
    flexDirection: 'column',
  },
  chatAvailability: {
    display: 'flex',
    alignItems: 'center',
  },
  chatAvailableIcon: {
    width: 15,
    height: 15,
    marginRight: theme.spacing(0.5),
  },
  chatReady: {
    color: theme.palette.success.main,
  },
  chatNotReady: {
    color: theme.palette.neutralShades[400],
  },
  available: {
    cursor: 'pointer',
    color: theme.palette.common.black,
  },
  notAvailable: {
    color: theme.palette.neutralShades[600],
  },
  avatar: {
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    height: 50,
    width: 50,
    color: 'white',
  },
}));

export const ConversationStart: React.FC<ConversationStartProps> = ({
  address,
  onBack,
  onClose,
  selectedCallback,
  initialSearch,
}) => {
  const {cx, classes} = useStyles();
  const [t] = useTranslationContext();
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean>();
  const [selectedPeer, setSelectedPeer] = useState<AddressResolution>();

  const handleSearch = async (searchTerm: string) => {
    // wait for a valid search term
    const isValid =
      searchTerm.split('.').length === 2 || isEthAddress(searchTerm);
    if (isValid) {
      setLoading(true);
      setSelectedPeer(undefined);
      const searchResult = await getAddressMetadata(searchTerm);
      if (searchResult?.address) {
        const networkStatus = await isXmtpUser(searchResult.address);
        setIsAvailable(networkStatus);
        setSelectedPeer(searchResult);
      }
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (!selectedPeer) {
      return;
    }
    setLoading(true);
    selectedCallback(selectedPeer);
  };

  return (
    <Card className={classes.cardContainer} variant="outlined">
      <CardHeader
        title={t('push.newMessage')}
        action={
          <Box className={classes.headerActionContainer}>
            <KeyboardDoubleArrowDownIcon
              className={classes.headerCloseIcon}
              onClick={onClose}
            />
          </Box>
        }
      />
      <CardContent>
        <Box className={classes.searchContainer}>
          <ArrowBackOutlinedIcon
            className={classes.headerBackIcon}
            onClick={onBack}
          />
          <Search
            handleSearch={handleSearch}
            tab={TabType.Chat}
            initialValue={initialSearch}
          />
        </Box>
        {loading && (
          <Box className={classes.loadingContainer}>
            <CircularProgress className={classes.loadingSpinner} />
          </Box>
        )}
        {selectedPeer && !loading && (
          <Box
            className={cx(
              classes.resultContainer,
              isAvailable ? classes.available : classes.notAvailable,
            )}
            onClick={isAvailable ? handleSelect : undefined}
          >
            {selectedPeer.avatarUrl && (
              <Avatar src={selectedPeer.avatarUrl} className={classes.avatar} />
            )}
            <Box className={classes.resultStatus}>
              <Typography variant="subtitle2">
                {selectedPeer.name || selectedPeer.address}
              </Typography>
              <Box
                className={cx(
                  classes.chatAvailability,
                  isAvailable ? classes.chatReady : classes.chatNotReady,
                )}
              >
                {isAvailable ? (
                  <CheckIcon className={classes.chatAvailableIcon} />
                ) : (
                  <CloudOffIcon className={classes.chatAvailableIcon} />
                )}
                <Typography variant="caption">
                  {isAvailable ? t('push.chatReady') : t('push.chatNotReady')}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        {!selectedPeer && !loading && (
          <CallToAction
            icon={'ForumOutlinedIcon'}
            title={t('push.chatNew')}
            subTitle={t('push.chatNewDescription')}
          />
        )}
      </CardContent>
    </Card>
  );
};

export type ConversationStartProps = {
  address: string;
  onBack: () => void;
  onClose: () => void;
  selectedCallback: (peerAddress: AddressResolution) => void;
  initialSearch?: string;
};

export default ConversationStart;

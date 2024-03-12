import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import MailLockOutlinedIcon from '@mui/icons-material/MailLockOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {useState} from 'react';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getOwnerDomains} from '../../actions';
import {useDomainConfig, useWeb3Context} from '../../hooks';
import type {SerializedUserDomainProfileData} from '../../lib';
import {isExternalDomain, useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {DomainListModal} from '../Domain';
import {Badges as BadgesTab} from './Tabs/Badges';
import {Crypto as CryptoTab} from './Tabs/Crypto';
import {Email as EmailTab} from './Tabs/Email';
import {ListForSale as ListForSaleTab} from './Tabs/ListForSale';
import {Profile as ProfileTab} from './Tabs/Profile';
import {Reverse as ReverseTab} from './Tabs/Reverse';
import {TokenGallery as TokenGalleryTab} from './Tabs/TokenGallery';
import {Transfer as TransferTab} from './Tabs/Transfer';
import {Website as WebsiteTab} from './Tabs/Website';

const useStyles = makeStyles<{width: string}>()((theme: Theme, {width}) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  containerWidth: {
    maxWidth: `calc(${width} - ${theme.spacing(5)})`,
  },
  upperContainer: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  lowerContainer: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(3),
    },
  },
  actionContainer: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 2000000,
  },
  tabHeaderContainer: {
    backgroundColor: theme.palette.white,
    position: 'sticky',
    top: 0,
    zIndex: 1000000,
    paddingTop: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(-0.5),
      marginRight: theme.spacing(-0.5),
    },
    [theme.breakpoints.up('md')]: {
      paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(-1),
    },
  },
  domainTitle: {
    marginLeft: theme.spacing(1),
    cursor: 'pointer',
  },
  tabList: {
    overflow: 'hidden',
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing(3),
      marginRight: theme.spacing(3),
      border: `1px solid ${theme.palette.neutralShades[200]}`,
      borderRadius: theme.shape.borderRadius,
      paddingLeft: theme.spacing(1),
    },
    [theme.breakpoints.down('md')]: {
      maxWidth: `calc(100vw - ${theme.spacing(6)})`,
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(0),
      marginTop: theme.spacing(1),
    },
  },
  tabLabel: {
    [theme.breakpoints.down('md')]: {
      maxWidth: '90px',
    },
  },
  tabContentItem: {
    marginLeft: theme.spacing(-3),
    marginRight: theme.spacing(-3),
    maxWidth: `calc(${width} + ${theme.spacing(5)})`,
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(1),
    },
  },
  ownerAddress: {
    color: theme.palette.neutralShades[600],
  },
}));

export const DomainProfile: React.FC<DomainProfileProps> = ({
  address,
  domain: initialDomain,
  metadata,
  width,
  onClose,
  onUpdate,
}) => {
  const {classes, cx} = useStyles({width});
  const [t] = useTranslationContext();
  const theme = useTheme();
  const isVerticalNav = useMediaQuery(theme.breakpoints.up('md'));
  const [buttonComponent, setButtonComponent] = useState<React.ReactNode>(
    <></>,
  );
  const {configTab: tabValue, setConfigTab: setTabValue} = useDomainConfig();
  const [showOtherDomainsModal, setShowOtherDomainsModal] = useState(false);
  const [domain, setDomain] = useState(initialDomain);
  const {setWeb3Deps} = useWeb3Context();

  const isOnchainSupported =
    !isExternalDomain(domain) &&
    (metadata.type as string)?.toLowerCase() === 'uns' &&
    (metadata.blockchain as string)?.toLowerCase() === 'matic';

  const onUpdateWrapper = (
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ) => {
    if (domain === initialDomain) {
      onUpdate(tab, data);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const tv = newValue as DomainProfileTabType;
    setTabValue(tv);
  };

  const handleOtherDomainsModalOpen = () => {
    setShowOtherDomainsModal(true);
  };

  const handleOtherDomainsModalClose = () => {
    setShowOtherDomainsModal(false);
  };

  const handleOtherDomainClick = (v: string) => {
    setDomain(v);
    handleOtherDomainsModalClose();
  };

  const handleRetrieveOwnerDomains = async (cursor?: number | string) => {
    const retData: {domains: string[]; cursor?: string} = {
      domains: [],
      cursor: undefined,
    };
    try {
      const domainData = await getOwnerDomains(address, cursor as string, true);
      if (domainData) {
        retData.domains = domainData.data.map(f => f.domain);
        retData.cursor = domainData.meta.pagination.cursor;
      }
    } catch (e) {
      notifyEvent(e, 'error', 'PROFILE', 'Fetch', {
        msg: 'error retrieving owner domains',
      });
    }
    return retData;
  };

  return (
    <Box className={cx(classes.container, classes.containerWidth)}>
      <TabContext value={tabValue as DomainProfileTabType}>
        <Box className={classes.upperContainer}>
          {onClose && (
            <Box className={classes.actionContainer}>
              <IconButton onClick={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          <Grid container>
            <Grid item xs={12} className={classes.tabHeaderContainer}>
              <Typography
                variant="h4"
                className={classes.domainTitle}
                onClick={handleOtherDomainsModalOpen}
              >
                <Box display="flex" alignItems="center">
                  {domain}
                  <ExpandMoreIcon />
                </Box>
              </Typography>
              <Typography
                ml={1}
                variant="body2"
                className={classes.ownerAddress}
              >
                {t('manage.ownerAddress', {
                  address: truncateEthAddress(address),
                })}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} className={classes.containerWidth}>
              <Box className={classes.tabList}>
                {isVerticalNav && (
                  <Typography
                    variant="h6"
                    mb={1}
                    mt={2}
                    mr={3}
                    display="flex"
                    justifyContent="center"
                  >
                    {t('manage.manageProfile')}
                  </Typography>
                )}
                <TabList
                  orientation={isVerticalNav ? 'vertical' : 'horizontal'}
                  onChange={handleTabChange}
                  variant={isVerticalNav ? undefined : 'scrollable'}
                  scrollButtons={false}
                >
                  <Tab
                    icon={<AccountCircleOutlinedIcon />}
                    iconPosition="top"
                    label={
                      <Box className={classes.tabLabel}>
                        {t('manage.profile')}
                      </Box>
                    }
                    value={DomainProfileTabType.Profile}
                  />
                  {isOnchainSupported && (
                    <Tab
                      icon={<MonetizationOnOutlinedIcon />}
                      iconPosition="top"
                      label={
                        <Box className={classes.tabLabel}>
                          {t('manage.crypto')}
                        </Box>
                      }
                      value={DomainProfileTabType.Crypto}
                    />
                  )}
                  {isOnchainSupported && (
                    <Tab
                      icon={<SwapHorizOutlinedIcon />}
                      iconPosition="top"
                      label={
                        <Box className={classes.tabLabel}>
                          {t('manage.reverse')}
                        </Box>
                      }
                      value={DomainProfileTabType.Reverse}
                    />
                  )}
                  {isOnchainSupported && (
                    <Tab
                      icon={<LanguageOutlinedIcon />}
                      iconPosition="top"
                      label={
                        <Box className={classes.tabLabel}>
                          {t('manage.web3Website')}
                        </Box>
                      }
                      value={DomainProfileTabType.Website}
                    />
                  )}
                  <Tab
                    icon={<EmojiEventsOutlinedIcon />}
                    iconPosition="top"
                    label={
                      <Box className={classes.tabLabel}>
                        {t('manage.badges')}
                      </Box>
                    }
                    value={DomainProfileTabType.Badges}
                  />
                  <Tab
                    icon={<CollectionsOutlinedIcon />}
                    iconPosition="top"
                    label={
                      <Box className={classes.tabLabel}>
                        {t('manage.tokenGallery')}
                      </Box>
                    }
                    value={DomainProfileTabType.TokenGallery}
                  />
                  <Tab
                    icon={<MailLockOutlinedIcon />}
                    iconPosition="top"
                    label={
                      <Box className={classes.tabLabel}>
                        {t('manage.email')}
                      </Box>
                    }
                    value={DomainProfileTabType.Email}
                  />
                  <Tab
                    icon={<SellOutlinedIcon />}
                    iconPosition="top"
                    label={
                      <Box className={classes.tabLabel}>
                        {t('manage.listForSale')}
                      </Box>
                    }
                    value={DomainProfileTabType.ListForSale}
                  />
                  {isOnchainSupported && (
                    <Tab
                      icon={<SendOutlinedIcon />}
                      iconPosition="top"
                      label={
                        <Box className={classes.tabLabel}>
                          {t('manage.transfer')}
                        </Box>
                      }
                      value={DomainProfileTabType.Transfer}
                    />
                  )}
                </TabList>
              </Box>
            </Grid>
            <Grid xs={12} md={8} item>
              <TabPanel
                value={DomainProfileTabType.Profile}
                className={cx(classes.tabContentItem)}
              >
                <ProfileTab
                  address={address}
                  domain={domain}
                  onUpdate={onUpdateWrapper}
                  setButtonComponent={setButtonComponent}
                />
              </TabPanel>
              <TabPanel
                value={DomainProfileTabType.Badges}
                className={cx(classes.tabContentItem)}
              >
                <BadgesTab
                  address={address}
                  domain={domain}
                  onUpdate={onUpdateWrapper}
                  setButtonComponent={setButtonComponent}
                />
              </TabPanel>
              <TabPanel
                value={DomainProfileTabType.Email}
                className={cx(classes.tabContentItem)}
              >
                <EmailTab
                  address={address}
                  domain={domain}
                  onUpdate={onUpdateWrapper}
                  setButtonComponent={setButtonComponent}
                />
              </TabPanel>
              <TabPanel
                value={DomainProfileTabType.ListForSale}
                className={cx(classes.tabContentItem)}
              >
                <ListForSaleTab
                  address={address}
                  domain={domain}
                  onUpdate={onUpdateWrapper}
                  setButtonComponent={setButtonComponent}
                />
              </TabPanel>
              <TabPanel
                value={DomainProfileTabType.TokenGallery}
                className={cx(classes.tabContentItem)}
              >
                <TokenGalleryTab
                  address={address}
                  domain={domain}
                  onUpdate={onUpdateWrapper}
                  setButtonComponent={setButtonComponent}
                />
              </TabPanel>
              <TabPanel
                value={DomainProfileTabType.Crypto}
                className={cx(classes.tabContentItem)}
              >
                <CryptoTab
                  domain={domain}
                  address={address}
                  onUpdate={onUpdateWrapper}
                  setButtonComponent={setButtonComponent}
                  filterFn={(k: string) => k.startsWith('crypto.')}
                />
              </TabPanel>
              <TabPanel
                value={DomainProfileTabType.Website}
                className={cx(classes.tabContentItem)}
              >
                <WebsiteTab
                  domain={domain}
                  address={address}
                  onUpdate={onUpdateWrapper}
                  setButtonComponent={setButtonComponent}
                />
              </TabPanel>
              <TabPanel
                value={DomainProfileTabType.Reverse}
                className={cx(classes.tabContentItem)}
              >
                <ReverseTab
                  address={address}
                  domain={domain}
                  onUpdate={onUpdateWrapper}
                  setButtonComponent={setButtonComponent}
                />
              </TabPanel>
              <TabPanel
                value={DomainProfileTabType.Transfer}
                className={cx(classes.tabContentItem)}
              >
                <TransferTab
                  address={address}
                  domain={domain}
                  onUpdate={onUpdateWrapper}
                  setButtonComponent={setButtonComponent}
                />
              </TabPanel>
            </Grid>
          </Grid>
        </Box>
        <Box className={cx(classes.lowerContainer)}>
          <Grid container>
            <Grid item xs={12} className={classes.containerWidth}>
              {buttonComponent}
            </Grid>
          </Grid>
        </Box>
        {showOtherDomainsModal && (
          <DomainListModal
            id="domainList"
            title={t('manage.otherDomains')}
            subtitle={t('manage.otherDomainsDescription')}
            retrieveDomains={handleRetrieveOwnerDomains}
            open={showOtherDomainsModal}
            setWeb3Deps={setWeb3Deps}
            onClose={handleOtherDomainsModalClose}
            onClick={handleOtherDomainClick}
          />
        )}
      </TabContext>
    </Box>
  );
};

export type DomainProfileProps = {
  address: string;
  domain: string;
  width: string;
  metadata: Record<string, string | boolean>;
  onClose?: () => void;
  onUpdate(
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ): void;
};

export enum DomainProfileTabType {
  Badges = 'badges',
  Crypto = 'crypto',
  Email = 'email',
  ListForSale = 'listForSale',
  Profile = 'profile',
  Reverse = 'reverse',
  TokenGallery = 'tokenGallery',
  Transfer = 'transfer',
  Website = 'website',
}

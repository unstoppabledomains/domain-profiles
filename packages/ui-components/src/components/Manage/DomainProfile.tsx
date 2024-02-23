import CloseIcon from '@mui/icons-material/Close';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import type {BadgeProps} from '@mui/material/Badge';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {styled} from '@mui/material/styles';
import React, {useState} from 'react';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useDomainConfig} from '../../hooks';
import type {SerializedUserDomainProfileData} from '../../lib';
import {isExternalDomain, useTranslationContext} from '../../lib';
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
    marginLeft: theme.spacing(-0.5),
    marginRight: theme.spacing(-0.5),
  },
  tabWidth: {
    width,
    [theme.breakpoints.down('sm')]: {
      width: `calc(100vw - ${theme.spacing(6)})`,
    },
  },
  tabList: {
    overflow: 'hidden',
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(-5),
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(0),
    },
  },
  tabLabel: {
    maxWidth: '90px',
  },
  tabContentItem: {
    marginLeft: theme.spacing(-3),
    marginRight: theme.spacing(-3),
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(1),
    },
  },
  ownerAddress: {
    color: theme.palette.neutralShades[600],
  },
}));

const StyledTabBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: -1,
  },
}));

export const DomainProfile: React.FC<DomainProfileProps> = ({
  address,
  domain,
  width,
  onClose,
  onUpdate,
}) => {
  const {classes, cx} = useStyles({width});
  const [t] = useTranslationContext();
  const [buttonComponent, setButtonComponent] = useState<React.ReactNode>(
    <></>,
  );
  const {configTab: tabValue, setConfigTab: setTabValue} = useDomainConfig();
  const [tabUnreadDot, setTabUnreadDot] = useState<
    Record<DomainProfileTabType, boolean>
  >({
    badges: false,
    profile: false,
    crypto: false,
    reverse: false,
    email: false,
    tokenGallery: false,
    transfer: false,
    listForSale: false,
    website: false,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const tv = newValue as DomainProfileTabType;
    setTabValue(tv);
    setTabUnreadDot({
      ...tabUnreadDot,
      [tv]: false,
    });
  };

  return (
    <Box className={classes.container}>
      <TabContext value={tabValue as DomainProfileTabType}>
        <Box className={classes.upperContainer}>
          {onClose && (
            <Box className={classes.actionContainer}>
              <IconButton onClick={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          <Box className={classes.tabHeaderContainer}>
            <Typography ml={1} variant="h4">
              {domain}
            </Typography>
            <Typography ml={1} variant="body2" className={classes.ownerAddress}>
              {t('manage.ownerAddress', {address: truncateEthAddress(address)})}
            </Typography>
            <Box className={cx(classes.tabList, classes.tabWidth)}>
              <TabList onChange={handleTabChange} variant="scrollable">
                <Tab
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={!tabUnreadDot[DomainProfileTabType.Profile]}
                    >
                      <Box className={classes.tabLabel}>
                        {t('manage.profile')}
                      </Box>
                    </StyledTabBadge>
                  }
                  value={DomainProfileTabType.Profile}
                />
                <Tab
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={!tabUnreadDot[DomainProfileTabType.Crypto]}
                    >
                      <Box className={classes.tabLabel}>
                        {' '}
                        {t('manage.crypto')}
                      </Box>
                    </StyledTabBadge>
                  }
                  disabled={isExternalDomain(domain)}
                  value={DomainProfileTabType.Crypto}
                />
                <Tab
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={!tabUnreadDot[DomainProfileTabType.Reverse]}
                    >
                      <Box className={classes.tabLabel}>
                        {t('manage.reverse')}
                      </Box>
                    </StyledTabBadge>
                  }
                  disabled={isExternalDomain(domain)}
                  value={DomainProfileTabType.Reverse}
                />
                <Tab
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={!tabUnreadDot[DomainProfileTabType.Website]}
                    >
                      <Box className={classes.tabLabel}>
                        {t('manage.web3Website')}
                      </Box>
                    </StyledTabBadge>
                  }
                  value={DomainProfileTabType.Website}
                />
                <Tab
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={!tabUnreadDot[DomainProfileTabType.Badges]}
                    >
                      <Box className={classes.tabLabel}>
                        {t('manage.badges')}
                      </Box>
                    </StyledTabBadge>
                  }
                  value={DomainProfileTabType.Badges}
                />
                <Tab
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={
                        !tabUnreadDot[DomainProfileTabType.TokenGallery]
                      }
                    >
                      <Box className={classes.tabLabel}>
                        {t('manage.tokenGallery')}
                      </Box>
                    </StyledTabBadge>
                  }
                  value={DomainProfileTabType.TokenGallery}
                />
                <Tab
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={!tabUnreadDot[DomainProfileTabType.Email]}
                    >
                      <Box className={classes.tabLabel}>
                        {t('manage.email')}
                      </Box>
                    </StyledTabBadge>
                  }
                  value={DomainProfileTabType.Email}
                />
                <Tab
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={
                        !tabUnreadDot[DomainProfileTabType.ListForSale]
                      }
                    >
                      <Box className={classes.tabLabel}>
                        {t('manage.listForSale')}
                      </Box>
                    </StyledTabBadge>
                  }
                  value={DomainProfileTabType.ListForSale}
                />
                <Tab
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={!tabUnreadDot[DomainProfileTabType.Transfer]}
                    >
                      <Box className={classes.tabLabel}>
                        {t('manage.transfer')}
                      </Box>
                    </StyledTabBadge>
                  }
                  disabled={isExternalDomain(domain)}
                  value={DomainProfileTabType.Transfer}
                />
              </TabList>
            </Box>
          </Box>
          <TabPanel
            value={DomainProfileTabType.Profile}
            className={cx(classes.tabContentItem, classes.tabWidth)}
          >
            <ProfileTab
              address={address}
              domain={domain}
              onUpdate={onUpdate}
              setButtonComponent={setButtonComponent}
            />
          </TabPanel>
          <TabPanel
            value={DomainProfileTabType.Badges}
            className={cx(classes.tabContentItem, classes.tabWidth)}
          >
            <BadgesTab
              address={address}
              domain={domain}
              onUpdate={onUpdate}
              setButtonComponent={setButtonComponent}
            />
          </TabPanel>
          <TabPanel
            value={DomainProfileTabType.Email}
            className={cx(classes.tabContentItem, classes.tabWidth)}
          >
            <EmailTab
              address={address}
              domain={domain}
              onUpdate={onUpdate}
              setButtonComponent={setButtonComponent}
            />
          </TabPanel>
          <TabPanel
            value={DomainProfileTabType.ListForSale}
            className={cx(classes.tabContentItem, classes.tabWidth)}
          >
            <ListForSaleTab
              address={address}
              domain={domain}
              onUpdate={onUpdate}
              setButtonComponent={setButtonComponent}
            />
          </TabPanel>
          <TabPanel
            value={DomainProfileTabType.TokenGallery}
            className={cx(classes.tabContentItem, classes.tabWidth)}
          >
            <TokenGalleryTab
              address={address}
              domain={domain}
              onUpdate={onUpdate}
              setButtonComponent={setButtonComponent}
            />
          </TabPanel>
          <TabPanel
            value={DomainProfileTabType.Crypto}
            className={cx(classes.tabContentItem, classes.tabWidth)}
          >
            <CryptoTab
              domain={domain}
              address={address}
              onUpdate={onUpdate}
              setButtonComponent={setButtonComponent}
              filterFn={(k: string) => k.startsWith('crypto.')}
            />
          </TabPanel>
          <TabPanel
            value={DomainProfileTabType.Website}
            className={cx(classes.tabContentItem, classes.tabWidth)}
          >
            <WebsiteTab
              domain={domain}
              address={address}
              onUpdate={onUpdate}
              setButtonComponent={setButtonComponent}
            />
          </TabPanel>
          <TabPanel
            value={DomainProfileTabType.Reverse}
            className={cx(classes.tabContentItem, classes.tabWidth)}
          >
            <ReverseTab
              address={address}
              domain={domain}
              onUpdate={onUpdate}
              setButtonComponent={setButtonComponent}
            />
          </TabPanel>
          <TabPanel
            value={DomainProfileTabType.Transfer}
            className={cx(classes.tabContentItem, classes.tabWidth)}
          >
            <TransferTab
              address={address}
              domain={domain}
              onUpdate={onUpdate}
              setButtonComponent={setButtonComponent}
            />
          </TabPanel>
        </Box>
        <Box className={classes.lowerContainer}>{buttonComponent}</Box>
      </TabContext>
    </Box>
  );
};

export type DomainProfileProps = {
  address: string;
  domain: string;
  width: string;
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

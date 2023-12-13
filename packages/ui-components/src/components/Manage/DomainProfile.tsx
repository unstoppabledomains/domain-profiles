import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import type {BadgeProps} from '@mui/material/Badge';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {styled} from '@mui/material/styles';
import React, {useState} from 'react';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedUserDomainProfileData} from '../../lib';
import {useTranslationContext} from '../../lib';
import {Crypto as CryptoTab} from './Tabs/Crypto';
import {Email as EmailTab} from './Tabs/Email';
import {ListForSale as ListForSaleTab} from './Tabs/ListForSale';
import {Profile as ProfileTab} from './Tabs/Profile';
import {Reverse as ReverseTab} from './Tabs/Reverse';
import {TokenGallery as TokenGalleryTab} from './Tabs/TokenGallery';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  tabHeaderContainer: {
    backgroundColor: theme.palette.white,
    position: 'sticky',
    top: 0,
    zIndex: 1000000,
    paddingTop: theme.spacing(3),
  },
  tabList: {
    overflow: 'hidden',
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(-5),
    width: '515px',
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(0),
      width: 'calc(100vw - 70px)',
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
  onUpdate,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [tabValue, setTabValue] = useState(DomainProfileTabType.Profile);
  const [tabUnreadDot, setTabUnreadDot] = useState<
    Record<DomainProfileTabType, boolean>
  >({
    profile: false,
    crypto: false,
    reverse: false,
    email: false,
    tokenGallery: false,
    listForSale: false,
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
      <TabContext value={tabValue}>
        <Box className={classes.tabHeaderContainer}>
          <Typography variant="h4">{domain}</Typography>
          <Typography variant="body2" className={classes.ownerAddress}>
            {t('manage.ownerAddress', {address: truncateEthAddress(address)})}
          </Typography>
          <Box className={classes.tabList}>
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
                    invisible={!tabUnreadDot[DomainProfileTabType.Email]}
                  >
                    <Box className={classes.tabLabel}>{t('manage.email')}</Box>
                  </StyledTabBadge>
                }
                value={DomainProfileTabType.Email}
              />
              <Tab
                label={
                  <StyledTabBadge
                    color="primary"
                    variant="dot"
                    invisible={!tabUnreadDot[DomainProfileTabType.ListForSale]}
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
                    invisible={!tabUnreadDot[DomainProfileTabType.TokenGallery]}
                  >
                    <Box className={classes.tabLabel}>
                      {t('profile.gallery')}
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
                    invisible={!tabUnreadDot[DomainProfileTabType.Crypto]}
                  >
                    <Box className={classes.tabLabel}>
                      {' '}
                      {t('manage.crypto')}
                    </Box>
                  </StyledTabBadge>
                }
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
                value={DomainProfileTabType.Reverse}
              />
            </TabList>
          </Box>
        </Box>
        <TabPanel
          value={DomainProfileTabType.Profile}
          className={classes.tabContentItem}
        >
          <ProfileTab address={address} domain={domain} onUpdate={onUpdate} />
        </TabPanel>
        <TabPanel
          value={DomainProfileTabType.Email}
          className={classes.tabContentItem}
        >
          <EmailTab address={address} domain={domain} />
        </TabPanel>
        <TabPanel
          value={DomainProfileTabType.ListForSale}
          className={classes.tabContentItem}
        >
          <ListForSaleTab
            address={address}
            domain={domain}
            onUpdate={onUpdate}
          />
        </TabPanel>
        <TabPanel
          value={DomainProfileTabType.TokenGallery}
          className={classes.tabContentItem}
        >
          <TokenGalleryTab
            address={address}
            domain={domain}
            onUpdate={onUpdate}
          />
        </TabPanel>
        <TabPanel
          value={DomainProfileTabType.Crypto}
          className={classes.tabContentItem}
        >
          <CryptoTab
            domain={domain}
            address={address}
            filterFn={(k: string) => k.startsWith('crypto.')}
          />
        </TabPanel>
        <TabPanel
          value={DomainProfileTabType.Reverse}
          className={classes.tabContentItem}
        >
          <ReverseTab domain={domain} />
        </TabPanel>
      </TabContext>
    </Box>
  );
};

export type DomainProfileProps = {
  address: string;
  domain: string;
  onUpdate(
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ): void;
};

export enum DomainProfileTabType {
  Crypto = 'crypto',
  Email = 'email',
  ListForSale = 'listForSale',
  Profile = 'profile',
  Reverse = 'reverse',
  TokenGallery = 'tokenGallery',
}

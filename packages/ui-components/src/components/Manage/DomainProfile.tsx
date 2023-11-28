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

import {useTranslationContext} from '../../lib';
import {Crypto as CryptoTab} from './Tabs/Crypto';
import {Email as EmailTab} from './Tabs/Email';
import {Profile as ProfileTab} from './Tabs/Profile';
import {Reverse as ReverseTab} from './Tabs/Reverse';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(1),
  },
  tabHeaderContainer: {
    marginTop: theme.spacing(1),
    width: '100%',
  },
  tabContentContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
  },
  tabList: {
    marginRight: theme.spacing(-4),
  },
  tabContentItem: {
    marginLeft: theme.spacing(-3),
    marginRight: theme.spacing(-3),
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

const enum TabType {
  Crypto = 'crypto',
  Email = 'email',
  Profile = 'profile',
  Reverse = 'reverse',
}

export const DomainProfile: React.FC<DomainProfileProps> = ({
  address,
  domain,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [tabValue, setTabValue] = useState(TabType.Profile);
  const [tabUnreadDot, setTabUnreadDot] = useState<Record<TabType, boolean>>({
    profile: false,
    crypto: false,
    reverse: false,
    email: false,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const tv = newValue as TabType;
    setTabValue(tv);
    setTabUnreadDot({
      ...tabUnreadDot,
      [tv]: false,
    });
  };

  return (
    <Box className={classes.container}>
      <Typography variant="h4">{domain}</Typography>
      <Typography variant="body2" className={classes.ownerAddress}>
        {t('manage.ownerAddress', {address: truncateEthAddress(address)})}
      </Typography>
      <TabContext value={tabValue}>
        <Box className={classes.tabHeaderContainer}>
          <TabList
            onChange={handleTabChange}
            variant="fullWidth"
            className={classes.tabList}
          >
            <Tab
              label={
                <StyledTabBadge
                  color="primary"
                  variant="dot"
                  invisible={!tabUnreadDot[TabType.Profile]}
                >
                  {t('manage.profile')}
                </StyledTabBadge>
              }
              value={TabType.Profile}
            />
            <Tab
              label={
                <StyledTabBadge
                  color="primary"
                  variant="dot"
                  invisible={!tabUnreadDot[TabType.Email]}
                >
                  {t('manage.email')}
                </StyledTabBadge>
              }
              value={TabType.Email}
            />
            <Tab
              label={
                <StyledTabBadge
                  color="primary"
                  variant="dot"
                  invisible={!tabUnreadDot[TabType.Crypto]}
                >
                  {t('manage.crypto')}
                </StyledTabBadge>
              }
              value={TabType.Crypto}
            />
            <Tab
              label={
                <StyledTabBadge
                  color="primary"
                  variant="dot"
                  invisible={!tabUnreadDot[TabType.Reverse]}
                >
                  {t('manage.reverse')}
                </StyledTabBadge>
              }
              value={TabType.Reverse}
            />
          </TabList>
        </Box>
        <Box className={classes.tabContentContainer}>
          <TabPanel value={TabType.Profile} className={classes.tabContentItem}>
            <ProfileTab address={address} domain={domain} />
          </TabPanel>
          <TabPanel value={TabType.Email} className={classes.tabContentItem}>
            <EmailTab domain={domain} />
          </TabPanel>
          <TabPanel value={TabType.Crypto} className={classes.tabContentItem}>
            <CryptoTab domain={domain} />
          </TabPanel>
          <TabPanel value={TabType.Reverse} className={classes.tabContentItem}>
            <ReverseTab domain={domain} />
          </TabPanel>
        </Box>
      </TabContext>
    </Box>
  );
};

export type DomainProfileProps = {
  address: string;
  domain: string;
};

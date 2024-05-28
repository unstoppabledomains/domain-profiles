import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React, {useEffect} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../lib';
import {TabHeader} from '../common/TabHeader';
import type {ManageTabProps} from '../common/types';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  icon: {
    color: theme.palette.neutralShades[400],
    width: '75px',
    height: '75px',
  },
}));

export const DnsRecords: React.FC<ManageTabProps> = ({
  domain,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  useEffect(() => {
    setButtonComponent(<></>);
  }, []);

  return (
    <Box className={classes.container}>
      <TabHeader
        icon={<LanguageOutlinedIcon />}
        description={t('manage.dnsManagementDescription')}
        learnMoreLink="https://unstoppabledomains.freshdesk.com/support/solutions/articles/48001248014-dns-records-and-different-types-com-domains-only-"
      />
      <Box className={classes.content}>
        <SettingsSuggestOutlinedIcon className={classes.icon} />
        <Typography variant="h5">{t('common.comingSoon')}</Typography>
        <Typography variant="body1">
          <Markdown>
            {t('manage.dnsManagementComingSoon', {
              domain,
              link: `${config.UNSTOPPABLE_WEBSITE_URL}/manage?page=dns&domain=${domain}`,
            })}
          </Markdown>
        </Typography>
      </Box>
    </Box>
  );
};

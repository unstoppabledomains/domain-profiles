import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import useTranslationContext from 'lib/i18n';
import type {GetServerSideProps, NextPage} from 'next';
import React from 'react';

import config from '@unstoppabledomains/config';

export interface ConfigPageProps {
  renderTime: string;
}

const ConfigPage: NextPage<ConfigPageProps> = ({renderTime}) => {
  const [t] = useTranslationContext();
  return (
    <Paper sx={{margin: '25px', padding: '25px'}}>
      <Typography variant="h4">
        {t('nftCollection.unstoppableDomains')}
      </Typography>
      <Typography variant="body1">
        {t('config.renderedAt', {renderTime})}
      </Typography>
      <Typography variant="h5" sx={{marginTop: '10px'}}>
        Config
      </Typography>
      <pre>{JSON.stringify(config, undefined, 2)}</pre>
    </Paper>
  );
};

export const getServerSideProps: GetServerSideProps<
  ConfigPageProps
> = async () => {
  return {
    props: {
      renderTime: new Date().toISOString(),
    },
  };
};

export default ConfigPage;

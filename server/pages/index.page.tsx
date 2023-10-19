import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type {GetServerSideProps, NextPage} from 'next';
import React from 'react';

import config from '@unstoppabledomains/config';

export interface HomePageProps {
  renderTime: string;
}

const HomePage: NextPage<HomePageProps> = ({renderTime}) => {
  return (
    <Paper sx={{margin: '25px', padding: '25px'}}>
      <Typography variant="h4">Unstoppable Domains</Typography>
      <Typography variant="body1">Render at {renderTime}</Typography>
      <Typography variant="h5" sx={{marginTop: '10px'}}>
        Config
      </Typography>
      <pre>{JSON.stringify(config, undefined, 2)}</pre>
    </Paper>
  );
};

export const getServerSideProps: GetServerSideProps<
  HomePageProps
> = async () => {
  return {
    props: {
      renderTime: new Date().toISOString(),
    },
  };
};

export default HomePage;

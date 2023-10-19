import type {GetServerSideProps, NextPage} from 'next';
import React from 'react';

import config from '@unstoppabledomains/config';

export interface HomePageProps {
  now: number;
}

const HomePage: NextPage<HomePageProps> = ({now}) => {
  return (
    <>
      <div>Hello world, it is {now}!</div>
      <h3>Config</h3>
      <pre>{JSON.stringify(config, undefined, 2)}</pre>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  HomePageProps
> = async () => {
  return {
    props: {
      now: Date.now(),
    },
  };
};

export default HomePage;

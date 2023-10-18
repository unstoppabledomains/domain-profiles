import type {GetServerSideProps, NextPage} from 'next';
import React from 'react';

export interface HomePageProps {
  domain: string;
}

const HomePage: NextPage<HomePageProps> = ({domain}) => {
  return <div>Hello {domain}!</div>;
};

export const getServerSideProps: GetServerSideProps<
  HomePageProps
> = async () => {
  return {
    props: {
      domain: 'world',
    },
  };
};

export default HomePage;

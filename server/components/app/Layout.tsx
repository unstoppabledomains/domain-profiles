import Box from '@mui/material/Box';
import type {ReactNode} from 'react';
import React from 'react';
import {useStyles} from 'styles/pages/app.styles';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = ({children}) => {
  const {classes} = useStyles();

  return <Box className={classes.container}>{children}</Box>;
};

export default Layout;

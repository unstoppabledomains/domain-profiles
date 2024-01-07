import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const gradientBase = 800;

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    position: 'relative',
    backgroundImage: `linear-gradient(${
      theme.palette.neutralShades[gradientBase - 200]
    }, ${theme.palette.neutralShades[gradientBase]})`,
    height: '400px',
  },
  scrollableContainer: {
    height: '100%',
    overflow: 'auto',
  },
}));

type MainScrollableContentProps = {
  id: string;
  header?: React.ReactNode;
  children: React.ReactNode;
};

const MainScrollableContent: React.FC<MainScrollableContentProps> = ({
  id,
  header,
  children,
}) => {
  const {classes} = useStyles();

  return (
    <Grid container>
      <Grid item sm={12} md={6}>
        {header && header}
        <Card className={classes.container} id={`mainScrollableContent-${id}`}>
          <CardContent>
            <Box
              className={classes.scrollableContainer}
              id={`mainScrollableContent-${id}`}
            >
              {children}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MainScrollableContent;

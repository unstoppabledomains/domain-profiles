import type {Theme} from '@mui/material/styles';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    background: theme.palette.background.default,
    height: '100vh',
  },
}));

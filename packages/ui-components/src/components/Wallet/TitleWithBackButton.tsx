import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
  },
}));

type Props = {
  onCancelClick: () => void;
  label: string;
  variant?: 'h4' | 'h5';
};

export const TitleWithBackButton: React.FC<Props> = ({
  onCancelClick,
  variant = 'h5',
  label,
}) => {
  const {classes} = useStyles();

  return (
    <Box className={classes.fullWidth}>
      <IconButton onClick={onCancelClick} data-testid={'back-button'}>
        <ArrowBackOutlinedIcon />
      </IconButton>
      <Typography ml={1} variant={variant}>
        {label}
      </Typography>
    </Box>
  );
};

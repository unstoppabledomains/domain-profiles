import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

// TODO jss-to-tss-react codemod: usages of this hook outside of this file will not be converted.
export const useStyles = makeStyles()((theme: Theme) => ({
  formError: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    fontSize: '0.8125rem',
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: 1,
    color: theme.palette.dangerShades[700],
    '&:not(:last-child)': {
      marginBottom: theme.spacing(1),
    },
  },
  formWarning: {
    color: theme.palette.warningShades[700],
  },
  formErrorIcon: {
    display: 'flex',
    width: 15,
    height: 15,
    marginRight: theme.spacing(1),
    '& svg': {
      width: 'inherit',
      height: 'inherit',
    },
  },
}));

type Props = {
  message: string | JSX.Element;
  severity?: 'error' | 'warning';
  className?: string;
};

const FormError: React.FC<Props> = ({message, className, severity}) => {
  const {classes, cx} = useStyles();

  return (
    <div
      className={cx(classes.formError, className, {
        [classes.formWarning]: severity === 'warning',
      })}
    >
      <div className={classes.formErrorIcon}>
        {severity === 'warning' ? <WarningAmberIcon /> : <ErrorOutlineIcon />}
      </div>
      {message}
    </div>
  );
};

export default FormError;

import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import type {LoadingButtonProps} from '@mui/lab/LoadingButton';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../lib';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: theme.spacing(-2),
  },
  button: {
    marginBottom: theme.spacing(0.5),
  },
  checkbox: {
    marginRight: theme.spacing(0),
  },
  checkboxText: {
    color: theme.palette.neutralShades[600],
  },
  checkBoxTextDisabled: {
    color: theme.palette.neutralShades[400],
  },
  statusIcon: {
    marginRight: theme.spacing(1),
  },
}));

export type BulkUpdateLoadingButtonProps = LoadingButtonProps & {
  address: string;
  count: number;
  isBulkUpdate: boolean;
  setIsBulkUpdate: (v: boolean) => void;
  errorMessage?: string;
};

const BulkUpdateLoadingButton: React.FC<
  BulkUpdateLoadingButtonProps
> = props => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();

  const handleEnabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setIsBulkUpdate(event.target.checked);
  };

  return (
    <Box className={cx(props.className, classes.container)}>
      <LoadingButton
        variant={props.variant}
        loading={!props.errorMessage && props.loading}
        onClick={props.onClick}
        className={classes.button}
        disabled={props.disabled}
        color={props.errorMessage ? 'error' : 'primary'}
        fullWidth
      >
        {props.errorMessage ? (
          <Box display="flex" alignItems="center">
            <ErrorOutlineOutlinedIcon className={classes.statusIcon} />
            {props.errorMessage}
          </Box>
        ) : props.disabled && props.count ? (
          <Box display="flex" alignItems="center">
            <CheckIcon className={classes.statusIcon} />
            {t('manage.updatedDomains', {
              count: props.count,
              s: props.count > 1 ? 's' : '',
            })}
          </Box>
        ) : props.isBulkUpdate ? (
          t('common.bulkSave')
        ) : (
          t('common.save')
        )}
      </LoadingButton>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              onChange={handleEnabledChange}
              className={classes.checkbox}
              checked={props.isBulkUpdate}
              disabled={props.disabled}
            />
          }
          label={
            <Typography
              variant="caption"
              className={
                props.disabled
                  ? classes.checkBoxTextDisabled
                  : classes.checkboxText
              }
            >
              {t('manage.applyToAllDomains', {
                address: truncateEthAddress(props.address),
              })}
            </Typography>
          }
        />
      </FormGroup>
    </Box>
  );
};

export default BulkUpdateLoadingButton;

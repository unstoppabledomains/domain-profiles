import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';

import type {DomainProfileVisibilityValues} from '../../../lib';
import {useTranslationContext} from '../../../lib';
import useStyles from '../../../styles/components/manage.styles';
import FormError from './FormError';

interface ManageInputProps {
  id: string;
  value?: string;
  label: string | JSX.Element;
  placeholder: string;
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  deprecated?: boolean;
  onChange: (id: string, value: string) => void;
  // if true, the input will allow adding multiple lines of text. Else, one line
  // only.  Defaults to false.
  multiline?: boolean;
  helperText?: string;
  labelIcon?: React.ReactNode;
  disableTextTrimming?: boolean;
  // if true, the label and input will be stacked. else, the label will be to the left of the input
  stacked?: boolean;
  // number of rows to display when the `multiline` prop is set to true.
  rows?: number;
  // maximum number of characters allowed in the input element
  maxLength?: number;
  endAdornment?: React.ReactNode;
  startAdornment?: React.ReactNode;
  classes?: {
    root?: string;
    input?: string;
    adornedStart?: string;
    adornedEnd?: string;
  };
  publicVisibilityValues?: object;
  isCardOpen?: {
    cardOpen: boolean;
    id: string | null;
  };
  password?: boolean;
  setPublicVisibilityValues?: React.Dispatch<
    React.SetStateAction<DomainProfileVisibilityValues>
  > | null;
  setIsCardOpen?: React.Dispatch<
    React.SetStateAction<{
      cardOpen: boolean;
      id: string | null;
    }>
  >;
}

const ManageInput: React.FC<ManageInputProps> = ({
  id,
  value,
  label,
  placeholder,
  error,
  errorText,
  disabled = false,
  deprecated = false,
  onChange,
  multiline = false,
  helperText,
  labelIcon = null,
  disableTextTrimming = false,
  stacked = true,
  maxLength,
  rows,
  password = false,
  startAdornment = null,
  endAdornment = null,
  classes: classesOverride,
  publicVisibilityValues,
  setPublicVisibilityValues,
  isCardOpen,
  setIsCardOpen,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const handleChange = ({target}: React.ChangeEvent<HTMLInputElement>) => {
    onChange(
      target.id,
      disableTextTrimming ? target.value : target.value.trim(),
    );
  };

  const handleAdornmentClick = (e: {stopPropagation: () => void}) => {
    // Toggles visibility of the modal
    e.stopPropagation();
    setIsCardOpen!(prev => {
      if (prev?.cardOpen) {
        return {
          id,
          cardOpen: false,
        };
      } else {
        return {
          id,
          cardOpen: true,
        };
      }
    });
  };

  const togglePublicVisibility = (e: {stopPropagation: () => void}) => {
    e.stopPropagation();
    if (setPublicVisibilityValues) {
      setPublicVisibilityValues(prev => {
        return {...prev, [id + 'Public']: prev && !prev[id + 'Public']};
      });
    }
  };

  function BasicCard() {
    return isCardOpen && isCardOpen.id === id && isCardOpen.cardOpen ? (
      <Card sx={{minWidth: 275}} className={classes.card}>
        <Typography color="text.secondary" className={classes.cardTitle}>
          {t('manage.whoCanViewYourData')}
        </Typography>

        <Typography
          sx={{fontSize: '14px'}}
          color="text.secondary"
          style={{whiteSpace: 'normal'}}
        >
          {t('manage.youCanControlAccessToYourData')}
        </Typography>
        <CardActions className={classes.cardBtnContainer}>
          <div
            className={classes.cardModalButtons}
            onClick={togglePublicVisibility}
            data-testid="inlineTogglePrivate"
          >
            <IconButton
              aria-label="toggle public visibility"
              className={classes.iconButtonBig}
            >
              {publicVisibilityValues &&
              publicVisibilityValues[id + 'Public'] === false ? (
                <CheckIcon className={classes.checkIcon} />
              ) : (
                <VisibilityOffOutlinedIcon />
              )}
              <Typography className={classes.cardCaption}>
                {t('manage.onlyYouAndDapps')}
              </Typography>
            </IconButton>
          </div>
          <div
            className={`${classes.cardModalButtons} ${classes.visibleBtn}`}
            onClick={togglePublicVisibility}
            data-testid="inlineTogglePublic"
          >
            <IconButton
              aria-label="toggle public visibility"
              className={classes.iconButtonBig}
            >
              {publicVisibilityValues &&
              publicVisibilityValues[id + 'Public'] === false ? (
                <PublicOutlinedIcon />
              ) : (
                <CheckIcon className={classes.checkIcon} />
              )}
              <Typography className={classes.cardCaption}>
                {t('manage.visibleToEveryone')}
              </Typography>
            </IconButton>
          </div>
        </CardActions>
      </Card>
    ) : null;
  }

  return (
    <FormControl className={classes.formMargin} fullWidth>
      <Grid container>
        <Grid
          item
          className={classes.labelGridItem}
          xs={12}
          sm={stacked ? 12 : 3}
        >
          <div className={classes.labelAndIconDiv}>
            {labelIcon && <div className={classes.labelIcon}>{labelIcon}</div>}
            <InputLabel
              focused={false}
              htmlFor={id}
              className={cx(classes.formLabel, classes.formControlInputLabel)}
            >
              {label}
            </InputLabel>
          </div>
        </Grid>
        <Grid item xs={12} sm={stacked ? 12 : 9}>
          <OutlinedInput
            id={id}
            disabled={disabled || deprecated}
            error={error}
            minRows={rows}
            maxRows={rows}
            value={value || ''}
            type={password ? 'password' : undefined}
            inputProps={{
              'data-testid': `input-${id}`,
              className: !endAdornment && error ? classes.error : '',
              maxLength,
            }}
            multiline={multiline}
            placeholder={placeholder}
            onChange={handleChange}
            classes={{
              root: cx(classes.inputRoot, classesOverride?.root),
              input: cx(classes.input, classesOverride?.input),
              adornedStart: classesOverride?.adornedStart,
              adornedEnd: classesOverride?.adornedEnd,
            }}
            startAdornment={startAdornment}
            endAdornment={
              endAdornment
                ? endAdornment
                : setPublicVisibilityValues && (
                    <InputAdornment
                      position="end"
                      style={{paddingRight: '15px', position: 'relative'}}
                    >
                      {publicVisibilityValues &&
                      publicVisibilityValues[id + 'Public'] ? (
                        <Tooltip title={t('manage.publicData')}>
                          <PublicOutlinedIcon className={classes.publicIcon} />
                        </Tooltip>
                      ) : (
                        <Tooltip title={t('manage.privateData')}>
                          <VisibilityOffOutlinedIcon
                            className={classes.privateIcon}
                          />
                        </Tooltip>
                      )}
                      <IconButton
                        data-testid="inlineToggle"
                        aria-label="toggle public visibility"
                        onClick={handleAdornmentClick}
                        edge="end"
                      >
                        <ExpandMoreOutlinedIcon />
                      </IconButton>
                      <BasicCard></BasicCard>
                    </InputAdornment>
                  )
            }
          />
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
          {(deprecated || (error && errorText)) && (
            <div className={classes.formErrorContainer}>
              <FormError
                message={deprecated ? t('manage.legacyToken') : errorText ?? ''}
              />
            </div>
          )}
        </Grid>
      </Grid>
    </FormControl>
  );
};

export default ManageInput;

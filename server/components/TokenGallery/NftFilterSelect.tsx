import ArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import NftFilterSelectOption from './NftFilterSelectOption';

const useStyles = makeStyles<{
  variant: Variant;
  expanded: boolean;
}>()((theme: Theme, {variant, expanded}) => ({
  root: {
    flex: 'none',
    [theme.breakpoints.down('sm')]: {
      flex: 1,
    },
  },
  selectButton: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...(variant === 'chip'
      ? {
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: theme.palette.neutralShades[300],
          borderRadius: (theme.shape.borderRadius as number) * 4,
          padding: theme.spacing(1, 1.5),
          '&:hover': {
            backgroundColor: 'transparent',
            '& .MuiTypography-root, & svg': {
              color: theme.palette.primary.main,
            },
          },
          '&[disabled]': {
            borderColor: theme.palette.neutralShades[200],
            '& .MuiTypography-root, & svg': {
              color: theme.palette.neutralShades[400],
            },
          },
          '& .MuiTypography-root, & svg': {
            color: expanded
              ? theme.palette.primary.main
              : theme.palette.greyShades[900],
          },
        }
      : {}),
  },
  label: {
    color: theme.palette.grey[700],
    fontWeight: theme.typography.fontWeightMedium,
    textTransform: 'none',
    whiteSpace: 'nowrap',
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  activeValue: {
    color: theme.palette.grey[700],
    fontWeight: theme.typography.fontWeightMedium,
    textTransform: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  dropIcon: {
    fontSize: 20, // Icons require px size
    color: theme.palette.grey[700],
    marginLeft: theme.spacing(0.5),
  },
}));

type Option = {
  value: string;
  label: string;
};

type Variant = 'simple' | 'chip';

type Props = {
  id: string;
  title?: string;
  variant?: Variant;
  onChange: (value: string) => void;
  options: Option[];
  selected: string[];
  disabled: boolean;
};

const NftFilterSelect: React.FC<Props> = ({
  id,
  title = '',
  variant = 'simple',
  onChange,
  options,
  selected,
  disabled,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {classes} = useStyles({variant, expanded: !!anchorEl});
  const selectId = `${title}${options.map(o => o.value)}`;

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    handleClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.root} data-testid="filter-select">
      <Button
        data-testid={id}
        color="primary"
        aria-controls={selectId}
        aria-haspopup="true"
        onClick={handleOpen}
        classes={{root: classes.selectButton}}
        disabled={disabled}
      >
        {!!title && (
          <Typography variant="body2" className={classes.label}>
            {title}
          </Typography>
        )}
        <Typography variant="body2" className={classes.activeValue}>
          <ArrowDownIcon className={classes.dropIcon} />
        </Typography>
      </Button>

      <Menu
        id={selectId}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {options
          .filter(option => option.value !== '')
          .map(option => (
            <NftFilterSelectOption
              {...option}
              id={`${id}-${option.value}`}
              onSelect={handleSelect}
              active={
                (selected.length === 0 && option.value === 'all') ||
                selected.includes(option.value)
              }
              key={option.value}
            />
          ))}
      </Menu>
    </div>
  );
};

export default NftFilterSelect;

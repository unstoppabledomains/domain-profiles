import CheckIcon from '@mui/icons-material/Check';
import MenuItem from '@mui/material/MenuItem';
import type {Theme} from '@mui/material/styles';
import type {ForwardedRef} from 'react';
import React from 'react';
import type {CSSObject} from 'tss-react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  menuItem: {
    minWidth: 220,
    minHeight: 40,
  },
  checkIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.link.main,
  },
  iconHolder: {
    width: 36,
  },
  menuItemText: {
    ...theme.typography.body2,
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    fontWeight: theme.typography.fontWeightMedium,
  } as CSSObject, // Ensuring the type compatibility "typography.body2" from @mui with "CSSObject"
}));

type Props = {
  id: string;
  value: string;
  active: boolean;
  label: string;
  prefix?: string;
  onSelect: (newValue: string) => void;
};

const NftFilterSelectOption = React.forwardRef(
  (props: Props, ref: ForwardedRef<HTMLLIElement>) => {
    const {value, active, prefix, label, onSelect} = props;
    const {classes} = useStyles();
    const onClick = () => onSelect(value);

    return (
      <MenuItem
        data-testid={props.id}
        ref={ref}
        key={value}
        onClick={onClick}
        className={classes.menuItem}
      >
        {active ? (
          <CheckIcon className={classes.checkIcon} />
        ) : (
          <div className={classes.iconHolder} />
        )}
        <div className={classes.menuItemText}>
          <div>
            {prefix}
            {label}
          </div>
        </div>
      </MenuItem>
    );
  },
);

export default NftFilterSelectOption;

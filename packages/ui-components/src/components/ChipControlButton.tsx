import type {ChipProps} from '@mui/material/Chip';
import Chip from '@mui/material/Chip';
import React from 'react';

const ChipControlButton = (props: ChipProps) => {
  return (
    <Chip
      {...props}
      color="info"
      icon={props.icon}
      size="small"
      sx={{
        ...props.sx,
        paddingLeft: 0.5,
        paddingRight: 0.5,
        paddingTop: 2,
        paddingBottom: 2,
      }}
    />
  );
};

export default ChipControlButton;

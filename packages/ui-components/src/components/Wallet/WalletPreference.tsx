import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import React from 'react';

interface WalletPreferenceProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const WalletPreference: React.FC<WalletPreferenceProps> = ({
  title,
  description,
  icon,
  children,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="left"
      justifyContent="left"
      textAlign="left"
      width="100%"
      mt={3}
    >
      <Box display="flex" alignItems="center">
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Divider />
      <Typography variant="body2" mb={1} mt={1}>
        {description}
      </Typography>
      {children}
    </Box>
  );
};

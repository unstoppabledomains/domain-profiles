import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import React, {useState} from 'react';

export const WalletPreference: React.FC<WalletPreferenceProps> = ({
  title,
  statusElement,
  description,
  icon,
  expanded: forceExpanded,
  children,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<boolean>();

  function handleClick(): void {
    setExpanded(!expanded);
  }

  return (
    <Accordion
      sx={{
        backgroundColor: forceExpanded
          ? theme.palette.dangerShades[100]
          : undefined,
        color: forceExpanded
          ? theme.palette.getContrastText(theme.palette.dangerShades[100])
          : undefined,
      }}
      expanded={forceExpanded ? true : expanded}
    >
      <AccordionSummary
        onClick={forceExpanded ? undefined : handleClick}
        expandIcon={
          <ExpandMoreIcon sx={{display: forceExpanded ? 'none' : undefined}} />
        }
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Box display="flex" alignItems="center">
            {icon}
            <Typography
              variant={forceExpanded ? 'subtitle1' : 'subtitle2'}
              fontWeight="bold"
            >
              {title}
            </Typography>
          </Box>
          {statusElement && !expanded && (
            <Box display="flex" alignItems="center" mr={1}>
              {statusElement}
            </Box>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="left"
          justifyContent="left"
          textAlign="left"
          width="100%"
        >
          <Typography variant="body2" mb={1}>
            {description}
          </Typography>
          {children}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export interface WalletPreferenceProps {
  title: string;
  statusElement?: React.ReactNode;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  expanded?: boolean;
}

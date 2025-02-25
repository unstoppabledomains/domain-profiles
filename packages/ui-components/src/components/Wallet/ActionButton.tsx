import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SendIcon from '@mui/icons-material/Send';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Box from '@mui/material/Box';
import type {ButtonProps} from '@mui/material/Button';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {styled, useTheme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../lib';

const useStyles = makeStyles<{size: 'small' | 'medium' | 'large'}>()((
  theme: Theme,
  {size},
) => {
  const baseSize = size === 'small' ? 70 : size === 'medium' ? 75 : 80;
  return {
    actionButton: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: `${baseSize}px`,
      height: `${baseSize}px`,
      cursor: 'pointer',
      [theme.breakpoints.down('sm')]: {
        width: `${baseSize - 16}px`,
        height: `${baseSize - 16}px`,
      },
    },
    actionIcon: {
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
      width: `${baseSize / 2 - 12}px`,
      height: `${baseSize / 2 - 12}px`,
      [theme.breakpoints.down('sm')]: {
        width: `${baseSize / 2 - 16}px`,
        height: `${baseSize / 2 - 16}px`,
      },
    },
    actionText: {
      whiteSpace: 'nowrap',
      fontWeight: 'bold',
    },
    actionContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
  };
});

type Props = {
  size: 'small' | 'medium' | 'large';
  variant: 'receive' | 'send' | 'swap' | 'buySell';
  onClick: () => void;
};

const ActionButton: React.FC<Props> = ({variant, onClick, size = 'large'}) => {
  const {classes} = useStyles({size});
  const [t] = useTranslationContext();
  const theme = useTheme();

  return (
    <StyledButton
      className={classes.actionButton}
      onClick={onClick}
      variant="contained"
      colorPalette={theme.palette.neutralShades}
      shade={theme.palette.mode === 'light' ? 100 : 600}
      size={size}
    >
      {variant === 'receive' ? (
        <Box className={classes.actionContent}>
          <QrCodeIcon className={classes.actionIcon} />
          <Typography variant="body2" className={classes.actionText}>
            {t('common.receive')}
          </Typography>
        </Box>
      ) : variant === 'send' ? (
        <Box className={classes.actionContent}>
          <SendIcon className={classes.actionIcon} />
          <Typography variant="body2" className={classes.actionText}>
            {t('common.send')}
          </Typography>
        </Box>
      ) : variant === 'swap' ? (
        <Box className={classes.actionContent}>
          <SwapHorizIcon className={classes.actionIcon} />
          <Typography variant="body2" className={classes.actionText}>
            {t('swap.title')}
          </Typography>
        </Box>
      ) : variant === 'buySell' ? (
        <Box className={classes.actionContent}>
          <AttachMoneyIcon className={classes.actionIcon} />
          <Typography variant="body2" className={classes.actionText}>
            {t('common.buySell')}
          </Typography>
        </Box>
      ) : null}
    </StyledButton>
  );
};

type StyledButtonProps = ButtonProps & {
  colorPalette: Record<number, string>;
  shade: number;
};

const StyledButton = styled(Button)<StyledButtonProps>(
  ({theme, shade, colorPalette}) => ({
    color: theme.palette.getContrastText(colorPalette[shade]),
    backgroundColor: colorPalette[shade],
    '&:hover': {
      backgroundColor: colorPalette[shade + 100],
    },
  }),
);

export default ActionButton;
